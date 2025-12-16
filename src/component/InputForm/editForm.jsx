import React from "react";

const EditForm = ({ task, onSubmit, editTime, onClick }) => {
  return (
    <div>
      <form onSubmit={onSubmit} className="">
        <div className="flex-none w-auto">
          <input
            type="number"
            className="w-full mb-3 bg-transparent text-white border-0 border-b border-gray-400 
            outline-none focus:border-b-2 focus:border-yellow-400"
            max={25}
            onChange={editTime}
            id="validationTooltip01"
            placeholder={task.time}
            required
          />
        </div>
        <button
          type="submit"
          onClick={() => onClick(task.id)}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white 
          px-4 py-2 rounded transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditForm;
