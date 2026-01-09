import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { socket } from "../../socket";
import { FaTrash, FaPaperPlane } from "react-icons/fa";

const UniversalComments = ({ type, id, user }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const isAdmin = user?.designation === "Admin";
  const baseUrl =
    type === "project" ? `${API_BASE_URL}/projects` : `${API_BASE_URL}/tasks`;
  const socketEvent = type === "project" ? "project_comment" : "task_comment";

  useEffect(() => {
    if (!id) return;
    setComments([]);
    fetchComments();

    const onNewComment = (data) => {
      const incomingId = type === "project" ? data.projectId : data.taskId;
      if (String(incomingId) === String(id)) {
        setComments((prev) => [...prev, data.comment]);
      }
    };

    socket.on(socketEvent, onNewComment);

    return () => {
      socket.off(socketEvent, onNewComment);
    };
  }, [id, type]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const fetchComments = async () => {
    try {
      const url =
        type === "project" ? `${baseUrl}/${id}` : `${baseUrl}/single/${id}`;
      const response = await axios.get(url);
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${baseUrl}/${id}/comments`, {
        senderId: user._id,
        text: newComment,
      });
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      showToast("Transmission failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isConfirmed = await confirm(
      "Are you sure you want to permanently delete this message from the protocol?",
      "Purge Message"
    );
    if (!isConfirmed) return;
    try {
      await axios.delete(`${baseUrl}/${id}/comments/${commentId}`, {
        data: { userId: user._id },
      });
      setComments(comments.filter((c) => c._id !== commentId));
      showToast("Message purged from record.", "success");
    } catch (err) {
      console.error("Error deleting comment:", err);
      showToast("Failed to delete message.", "error");
    }
  };

  return (
    <div className="flex flex-col h-[450px] bg-slate-900/40 rounded-2xl overflow-hidden border border-white/5 relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
              💬
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">
              No discussions yet
            </p>
            <p className="text-[10px] mt-1">
              Start the conversation regarding this {type}
            </p>
          </div>
        ) : (
          comments.map((comment, index) => {
            const isMe =
              String(comment.sender?._id || comment.sender) ===
              String(user._id);
            return (
              <div
                key={comment._id || index}
                className={`flex flex-col group ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  {!isMe && (
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                      {comment.sender?.fullName || "System"}
                    </span>
                  )}
                  <span className="text-[10px] text-white/20 font-mono">
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {(isAdmin || isMe) && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 p-1"
                      title="Delete message"
                    >
                      <FaTrash className="text-[9px]" />
                    </button>
                  )}
                  {isMe && (
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                      You
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20"
                      : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                  }`}
                >
                  {comment.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-black/20 border-t border-white/5 flex gap-3 backdrop-blur-xl"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={`Add a note to this ${type}...`}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all focus:bg-white/10"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-30 flex items-center justify-center"
        >
          {loading ? "..." : <FaPaperPlane />}
        </button>
      </form>
    </div>
  );
};

export default UniversalComments;
