import "./singleTask.css";
import Buttons from "./buttons";
import EditForm from "../InputForm/editForm";
import Clock from "./clock";

const SingleTask = ({task, onSubmit, editTime, onClick, show, setShow, active, setActive}) => {
  return (
    <div className="flex flex-col">
      <Buttons setShow={setShow} active={active} setActive={setActive} />
      <div className="">
        {show === "pomodoro" && <Clock timer={(task[0].time)*6000} />}
        {show === "break" && <Clock timer={5*6000} />}
        {show === "edit" && (
          <EditForm
            task={task[0]}
            onSubmit={onSubmit}
            editTime={editTime}
            onClick={onClick}
          />
        )}
      </div>
    </div>
  );
};

export default SingleTask;
