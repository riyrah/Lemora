import { useState, useEffect } from "react";

const usePomodoroTimer = () => {
  const loadState = <T,>(key: string, defaultValue: T): T => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [minutes, setMinutes] = useState(() => loadState('pomodoroMinutes', 25));
  const [seconds, setSeconds] = useState(() => loadState('pomodoroSeconds', 0));
  const [isActive, setIsActive] = useState(() => loadState('pomodoroIsActive', false));
  const [sessionType, setSessionType] = useState<"Pomodoro" | "Short Break" | "Long Break">(
    () => loadState('pomodoroSessionType', "Pomodoro")
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroMinutes', JSON.stringify(minutes));
    localStorage.setItem('pomodoroSeconds', JSON.stringify(seconds));
    localStorage.setItem('pomodoroIsActive', JSON.stringify(isActive));
    localStorage.setItem('pomodoroSessionType', JSON.stringify(sessionType));
  }, [minutes, seconds, isActive, sessionType]);

  return {
    minutes,
    setMinutes,
    seconds,
    setSeconds,
    isActive,
    setIsActive,
    sessionType,
    setSessionType
  };
};

export default usePomodoroTimer; 