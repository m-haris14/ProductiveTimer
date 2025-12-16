import React from "react";

const InputForm = ({ Submit, input, onChange, inputTimeHandler, time }) => {
  return (
    <>
      <form onSubmit={Submit} className="inputForm">
        <div className=" mb-3">
          <input
            type="text"
            className="mb-3 border-b-2 bg-transparent rounded-lg p-1 text-white outline-none w-101"
            id="exampleInputEmail1"
            value={input}
            onChange={onChange}
            aria-describedby="emailHelp"
            placeholder="Name Your Task"
            required
          />
        </div>
        <div className="col-auto">
          <input
            type="number"
            className="mb-3 border-b-2 bg-transparent rounded-lg p-1 text-white outline-none w-101"
            max={25}
            value={time}
            onChange={inputTimeHandler}
            id="validationTooltip01"
            placeholder="Specify Time for task in mins"
            required
          />
        </div>
        <button
          type="submit"
         className="p-2 mt-3 w-full rounded-xl font-bold     text-[#1f2241] bg-white    border border-white
     hover:text-white hover:bg-[#1f2241]    transition-all duration-300"
        >
          Submit
        </button>
      </form>
    </>
  );
};

export default InputForm;
