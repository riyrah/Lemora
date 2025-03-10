"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { DashboardButton } from "@/components/dashboard-button";
import { FiSettings, FiPlus, FiX, FiMoreVertical, FiMinus, FiMoreHorizontal } from "react-icons/fi";
import usePomodoroTimer from "@/hooks/usePomodoroTimer";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomos: number;
  completedPomos: number;
}

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
  tickingSound: string;
  tickingVolume: number;
}

interface PomodoroTimerProps {
  onComplete: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete }) => {
  const {
    minutes,
    setMinutes,
    seconds,
    setSeconds,
    isActive,
    setIsActive,
    sessionType,
    setSessionType
  } = usePomodoroTimer();
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTaskEdit, setShowTaskEdit] = useState<string | null>(null);
  const [editingPomos, setEditingPomos] = useState(1);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const [settings, setSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    alarmSound: "Kitchen",
    alarmVolume: 50,
    tickingSound: "None",
    tickingVolume: 50,
  });

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  const handleSessionChange = (type: typeof sessionType) => {
    setIsActive(false);
    setSessionType(type);
    setMinutes(settings[type === "Pomodoro" ? "pomodoro" : type === "Short Break" ? "shortBreak" : "longBreak"]);
    setSeconds(0);
  };

  const handleTimerEnd = () => {
    setIsActive(false);
    if (sessionType === "Pomodoro") {
      setCompletedSessions(prev => prev + 1);
      setTasks(prev => prev.map(task => 
        !task.completed ? { 
          ...task, 
          completedPomos: Math.min(task.completedPomos + 1, task.estimatedPomos),
          completed: task.completedPomos + 1 >= task.estimatedPomos
        } : task
      ));
      const nextType = completedSessions % settings.longBreakInterval === settings.longBreakInterval - 1 
        ? "Long Break" 
        : "Short Break";
      setSessionType(nextType);
      setMinutes(settings[nextType === "Long Break" ? "longBreak" : "shortBreak"]);
      if (settings.autoStartBreaks) setIsActive(true);
    } else {
      setSessionType("Pomodoro");
      setMinutes(settings.pomodoro);
      if (settings.autoStartPomodoros) setIsActive(true);
    }
    setSeconds(0);
    
    // Play alarm sound
    const audio = new Audio(`/sounds/${settings.alarmSound.toLowerCase()}.mp3`);
    audio.volume = settings.alarmVolume / 100;
    audio.play();
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks(prev => [...prev, {
        id: Math.random().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        estimatedPomos: 1,
        completedPomos: 0
      }]);
      setNewTaskTitle("");
      setShowNewTaskForm(false);
    }
  };

  const incrementPomo = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, estimatedPomos: task.estimatedPomos + 1 } : task
    ));
  };

  const decrementPomo = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, estimatedPomos: Math.max(1, task.estimatedPomos - 1) } : task
    ));
  };

  const calculateEstimatedTime = (pomos: number) => {
    const totalMinutes = pomos * settings.pomodoro + (pomos - 1) * settings.shortBreak;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const calculateTotalDuration = () => {
    const uncompletedTasks = tasks.filter(task => !task.completed);
    const totalPomos = uncompletedTasks.reduce((sum, task) => sum + task.estimatedPomos, 0);
    
    // Total work time + breaks between pomodoros (short breaks only between sessions)
    const totalMinutes = totalPomos * settings.pomodoro + 
                        Math.max(0, totalPomos - 1) * settings.shortBreak;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Calculate finish time
    const now = new Date();
    const finishTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
    const formattedFinishTime = finishTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    return { totalPomos, hours, minutes, formattedFinishTime };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerEnd();
            clearInterval(interval);
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  useEffect(() => {
    return () => {
      // Save state when component unmounts
      localStorage.setItem('pomodoroMinutes', JSON.stringify(minutes));
      localStorage.setItem('pomodoroSeconds', JSON.stringify(seconds));
      localStorage.setItem('pomodoroIsActive', JSON.stringify(isActive));
      localStorage.setItem('pomodoroSessionType', JSON.stringify(sessionType));
    };
  }, [minutes, seconds, isActive, sessionType]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Timer Header - Updated with larger buttons */}
        <div className="flex items-center justify-between p-6">
          <div className="flex gap-4">
            {["Pomodoro", "Short Break", "Long Break"].map((type) => (
              <button
                key={type}
                onClick={() => handleSessionChange(type as typeof sessionType)}
                className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                  sessionType === type 
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-purple-700 hover:bg-purple-100"
                } transform hover:scale-105 active:scale-95`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 text-purple-600 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <FiSettings className="w-6 h-6" />
          </button>
        </div>

        {/* Timer Display - Larger font and centered */}
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="text-[10rem] font-bold text-black mb-4 font-mono tracking-tighter">
            {formatTime(minutes)}:{formatTime(seconds)}
          </div>
          <DashboardButton
            variant="solid"
            color="primary"
            className="!bg-purple-600 !text-white px-16 py-6 rounded-2xl text-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? "PAUSE" : "START"}
          </DashboardButton>
        </div>

        {/* Task Manager - Updated with subtle background */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mx-4 mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-purple-900">Tasks</h2>
            <button className="p-2 text-purple-400 hover:text-purple-600">
              <FiMoreVertical className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {task.completedPomos}/{task.estimatedPomos}
                    </span>
                    {showTaskEdit === task.id ? (
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => decrementPomo(task.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm">{task.estimatedPomos}</span>
                        <button
                          onClick={() => incrementPomo(task.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTaskEdit(task.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiMoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {showTaskEdit === task.id && (
                  <div className="mt-2 pl-8 text-sm text-gray-500">
                    Estimated completion time: {calculateEstimatedTime(task.estimatedPomos)}
                  </div>
                )}
              </div>
            ))}
            {!showNewTaskForm ? (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-purple-500 hover:border-purple-500 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Add Task
              </button>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="What are you working on?"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNewTaskTitle("");
                        setShowNewTaskForm(false);
                      }}
                      className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addTask}
                      className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Move the duration display here */}
          {tasks.length > 0 && (
            <div className="mt-6 p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-medium text-purple-500">
                {calculateTotalDuration().totalPomos > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>Pomos: </span>
                    <span className="font-bold">{tasks.reduce((acc, task) => acc + task.completedPomos, 0)}</span>
                    <span>/</span>
                    <span>{tasks.reduce((acc, task) => acc + task.estimatedPomos, 0)}</span>
                    <span className="mx-2">•</span>
                    <span>Finish At: </span>
                    <span>{calculateTotalDuration().formattedFinishTime}</span>
                    <span className="text-purple-400 ml-1">({calculateTotalDuration().hours > 0 
                      ? `${calculateTotalDuration().hours}.${Math.floor((calculateTotalDuration().minutes / 60) * 10)}h`
                      : `${(calculateTotalDuration().minutes / 60).toFixed(1)}h`})</span>
                  </div>
                ) : (
                  <p>All tasks completed! 🎉</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Modal - Updated positioning */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-8 mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-purple-400 hover:text-purple-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Timer Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Time (minutes)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Pomodoro", key: "pomodoro" },
                      { label: "Short Break", key: "shortBreak" },
                      { label: "Long Break", key: "longBreak" }
                    ].map(({ label, key }) => (
                      <div key={key} className="flex flex-col gap-2">
                        <label className="text-sm text-gray-900">{label}</label>
                        <input
                          type="number"
                          min="1"
                          value={settings[key as keyof TimerSettings].toString()}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setSettings(prev => ({
                              ...prev,
                              [key]: isNaN(value) ? '' : Math.max(1, value)
                            }));
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            const finalValue = isNaN(value) || value < 1 ? 1 : value;
                            
                            setSettings(prev => ({
                              ...prev,
                              [key]: finalValue
                            }));
                            
                            if (sessionType === "Pomodoro" && key === "pomodoro") {
                              setMinutes(finalValue);
                            } else if (sessionType === "Short Break" && key === "shortBreak") {
                              setMinutes(finalValue);
                            } else if (sessionType === "Long Break" && key === "longBreak") {
                              setMinutes(finalValue);
                            }
                          }}
                          className="px-3 py-2 border rounded-lg text-gray-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto Start Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Auto Start Breaks</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoStartBreaks: e.target.checked
                        }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">Auto Start Pomodoros</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoStartPomodoros: e.target.checked
                        }))}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>

                {/* Sound Settings */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-900 block mb-2">Alarm Sound</label>
                    <select
                      value={settings.alarmSound}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alarmSound: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    >
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bell">Bell</option>
                      <option value="Digital">Digital</option>
                    </select>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.alarmVolume}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alarmVolume: parseInt(e.target.value)
                      }))}
                      className="w-full mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-900 block mb-2">Ticking Sound</label>
                    <select
                      value={settings.tickingSound}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        tickingSound: e.target.value
                      }))}
                      className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    >
                      <option value="None">None</option>
                      <option value="Soft">Soft</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.tickingVolume}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        tickingVolume: parseInt(e.target.value)
                      }))}
                      className="w-full mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 