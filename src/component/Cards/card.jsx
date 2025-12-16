import { MdOutlineAutoDelete } from "react-icons/md";
import { TbClockEdit } from "react-icons/tb";
import { useState } from "react";

const Card = ({ id, task, countDown, del, viewTask, onEdit }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-white shadow-md rounded-none p-1" key={id}>
        <div className="p-1 border border-gray-300 flex gap-5">
          <div className=" w-1/4 flex items-center m-0" onClick={viewTask}>
            <h3 className="text-lg font-semibold text-gray-900 text-center m-0">
              {task}
            </h3>
          </div>
          <h2 className="m-0 pt-2.5 w-1/4 text-end">{countDown}: 00</h2>
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="px-1 py-0.5 border border-red-500 text-red-500 rounded-md hover:bg-red-500 
              hover:text-white transition"
              onClick={() => setOpen(true)}
            >
              <MdOutlineAutoDelete size={20} />
            </button>
            {open && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50"
                tabIndex={-1}
              >
                <div className="relative w-full max-w-md mx-auto">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 text-lg text-red-500 pb-0">
                      <p>
                        This action will permanently remove this task, do you
                        want to go with this?
                      </p>
                    </div>
                    <div className="flex justify-end m-3 gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-500 text-white rounded-md
                       hover:bg-red-600 transition"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="px-1 py-0.5 border border-red-500 text-red-500 rounded-md
                      hover:bg-red-500 hover:text-white transition"
                        onClick={() => {
                          del(id);
                          setOpen(false);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button
            type="button"
              className="px-1 py-0.5 border border-yellow-500 text-yellow-500 rounded-md
            hover:bg-yellow-500 hover:text-white transition"
              onClick={() => {
                console.log("edit id:", id);
                onEdit(id);
              }}
            >
              <TbClockEdit size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
