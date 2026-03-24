import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, StudySession } from '../types';
import { cn } from '../lib/utils';

interface TimerProps {
  subjects: Subject[];
  onSessionComplete: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
}

type TimerMode = 'focus' | 'break';

export default function Timer({ subjects, onSessionComplete }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [showComplete, setShowComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      onSessionComplete({
        subjectId: selectedSubjectId,
        durationMinutes: 25,
        notes: 'Pomodoro session'
      });
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 3000);
    }
    // Switch mode
    const nextMode = mode === 'focus' ? 'break' : 'focus';
    setMode(nextMode);
    setTimeLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Mode Toggle */}
      <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-2xl w-full max-w-[240px]">
        <button
          onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all",
            mode === 'focus' ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600" : "text-zinc-500"
          )}
        >
          <Brain className="w-4 h-4" /> Focus
        </button>
        <button
          onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all",
            mode === 'break' ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600" : "text-zinc-500"
          )}
        >
          <Coffee className="w-4 h-4" /> Break
        </button>
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="753.98"
            animate={{ strokeDashoffset: 753.98 * (1 - progress / 100) }}
            className={cn(
              "transition-colors duration-500",
              mode === 'focus' ? "text-indigo-600" : "text-emerald-500"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold tracking-tighter">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs uppercase tracking-widest text-zinc-500 mt-2 font-bold">
            {mode === 'focus' ? 'Focus Time' : 'Take a Break'}
          </span>
        </div>
      </div>

      {/* Subject Selection */}
      {mode === 'focus' && (
        <div className="w-full space-y-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Select Subject</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap",
                  selectedSubjectId === subject.id 
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                    : "border-transparent bg-white dark:bg-zinc-900 text-zinc-500"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 transition-transform"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all",
            isActive 
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" 
              : "bg-indigo-600 text-white"
          )}
        >
          {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
        </button>
        <div className="w-14" /> {/* Spacer for balance */}
      </div>

      {/* Completion Toast */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">Session Saved! Keep it up!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
