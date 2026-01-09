import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { socket } from "../../socket";

const TaskComments = ({ taskId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!taskId) return;
    setComments([]); // Clear previous task comments
    fetchComments();

    const onNewComment = (data) => {
      if (String(data.taskId) === String(taskId)) {
        setComments((prev) => [...prev, data.comment]);
      }
    };

    socket.on("task_comment", onNewComment);

    return () => {
      socket.off("task_comment", onNewComment);
    };
  }, [taskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tasks/single/${taskId}`
      );
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
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/comments`, {
        senderId: user._id,
        text: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
      <div className="p-3 bg-slate-800/50 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200">
          Task Discussions
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {comments.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          comments.map((comment, index) => {
            const isMe =
              String(comment.sender?._id || comment.sender) ===
              String(user._id);
            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-slate-400">
                    {comment.sender?.fullName || "User"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
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
        className="p-3 bg-slate-800/80 border-t border-slate-700/50 flex gap-2"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
