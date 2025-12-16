import InputTask from "../InputTask/InputTask";

const Pomodoro = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-1/4">
        <h1 className="text-center text-white text-5xl font-bold">
          Pomodoro Timer
        </h1>

        <p className="text-white text-center my-3">
          Create Tasks & Specify time for them !
        </p>

        <InputTask />
      </div>
    </div>
  );
};

export default Pomodoro;
