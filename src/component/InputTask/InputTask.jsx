import { useState, useEffect } from "react";
// import "./InputTask.css";
import InputForm from "../InputForm/inputForm";
import Card from "../Cards/card";
import SingleTask from "../singleTask/singleTask";

const InputTask = () => {
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const [todo, setTodo] = useState([]);
  const [edit, setEdit] = useState("");
  const [path, setPath] = useState("addTask");
  const [tos, setTos] = useState({});
  const [show, setShow] = useState("pomodoro");
  const [active, setActive] = useState("task");

  useEffect(() => {
    const stored = localStorage.getItem("Todo");
    if (stored) {
      setTodo(JSON.parse(stored));
    }
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    const newTodo = [...todo, { id: Date.now(), todoTask: input, time: time }];
    localStorage.setItem("Todo", JSON.stringify(newTodo));
    setTodo(newTodo);
    setPath("view");
    setInput("");
    setTime("");
  };
  const inputTextHandler = (e) => {
    setInput(e.target.value);
  };
  const inputTimeHandler = (e) => {
    setTime(e.target.value);
  };
  const deleteTask = (taskId) => {
    setTodo((todo) => {
      return todo.filter((del) => {
        return del.id !== taskId;
      });
    });
    localStorage.setItem("Todo", JSON.stringify(todo));
  };
  const editTime = (e) => {
    setEdit(e.target.value);
    console.log(edit);
  };
  const editTodo = (id) => {
    setTodo(
      todo.map((tos) => {
        if (tos.id == id) {
          return { ...tos, time: edit };
        } else {
          return tos;
        }
      })
    );
    localStorage.setItem("Todo", JSON.stringify(todo));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPath("view");
    console.log(edit);
  };

  const editTask= (id) => {
    setPath("oneTask");
    setShow("edit");
    setActive("edit")
    setTodo(
      todo.map((tos) => {
        if (tos.id == id) {
          return { ...tos, time: edit };
        } else {
          return tos;
        }
      })
    );
    localStorage.setItem("Todo", JSON.stringify(todo));
  }

  const AddTask = () => {
    setPath("addTask");
  };

  const viewTask = (id) => {
    setPath("oneTask");
    setTos(
      todo.filter((tos) => {
        if (tos.id == id) {
          return tos;
        }
      })
    );
  };

  return (
    <>
      <div className="w-full h-auto flex justify-center items-center self-center">
        {path === "addTask" && (
          <InputForm
            Submit={submitHandler}
            value={input}
            onChange={inputTextHandler}
            inputTimeHandler={inputTimeHandler}
            time={time}
          />
        )}
        {path === "view" && (
          <div className="gap-2.5 w-full">
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-md mb-3 w-full hover:bg-yellow-600 transition"
                onClick={AddTask}>
              Add Task
            </button>
            {todo.map((t) => {
              return (
                <Card
                  key={t.id}
                  id={t.id}
                  task={t.todoTask}
                  countDown={t.time}
                  viewTask={() => viewTask(t.id)}
                  del={() => {
                    deleteTask(t.id);
                  }}
                  onEdit={editTask}
                />
              );
            })}
          </div>
        )}
        {path === "oneTask" && (
          <SingleTask
            task={tos}
            onSubmit={handleEditSubmit}
            editTime={editTime}
            onClick={editTodo}
            show={show}
            setShow={setShow}
            active={active}
            setActive={setActive}
          />
        )}
      </div>
    </>
  );
};

export default InputTask;
