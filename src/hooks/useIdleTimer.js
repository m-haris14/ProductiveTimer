import { useState, useEffect } from "react";

const useIdleTimer = (totalTimeout = 60000, promptTimeout = 50000) => {
  const [isIdle, setIsIdle] = useState(false);
  const [isPrompted, setIsPrompted] = useState(false);

  useEffect(() => {
    let idleTimer;
    let promptTimer;

    const resetTimer = () => {
      setIsIdle(false);
      setIsPrompted(false);

      clearTimeout(idleTimer);
      clearTimeout(promptTimer);

      promptTimer = setTimeout(() => setIsPrompted(true), promptTimeout);
      idleTimer = setTimeout(() => setIsIdle(true), totalTimeout);
    };

    // Events to listen for
    const events = [
      "mousemove",
      "keydown",
      "wheel",
      "DOMMouseScroll",
      "mousewheel",
      "mousedown",
      "touchstart",
      "touchmove",
      "MSPointerDown",
      "MSPointerMove",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(promptTimer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [totalTimeout, promptTimeout]);

  return { isIdle, isPrompted };
};

export default useIdleTimer;
