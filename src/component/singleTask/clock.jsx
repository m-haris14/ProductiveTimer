import { useState } from "react";
import "./clock.css";
import StopWatch from "../StopWatch/stopWatch";
const Clock = ({ timer }) => {
  const [isRunning, setIsRunning] = useState(false);
  const startAndStop = () => {
    setIsRunning(!isRunning);
  };
  return (
    <div className="flex justify-center items-center">
      <div className="h-60 w-60 mt-5  border-8 border-[#24264b] rounded-full p-2.5 shadow-[0_4px_8px_rgba(0,0,0,0.2),0_6px_20px_rgba(0,0,0,0.19)]">
        <div
          className="h-51 w-51 p-23   border-8 border-[#ce6970]  rounded-full  flex flex-col justify-center items-center  text-center text-white  text-4xl"
        >
          <div onClick={startAndStop}>
            <StopWatch
              countDown={timer}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clock;
