import React, { createContext, useContext, useState, useCallback } from "react";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    resolve: null,
  });

  const confirm = useCallback((message, title = "Verification Required") => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        resolve,
      });
    });
  }, []);

  const handleClose = (value) => {
    if (modalState.resolve) {
      modalState.resolve(value);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-10000 p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl border border-white/10 overflow-hidden scale-in animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                {modalState.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {modalState.message}
              </p>
            </div>

            <div className="p-8 pt-6 flex gap-3">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClose(true)}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
