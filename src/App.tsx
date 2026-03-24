import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Timer as TimerIcon, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  Flame,
  Trophy,
  Moon,
  Sun,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, isToday, startOfWeek, subDays, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import { Subject, Exam, StudySession, UserStats } from './types';

// Components (will be moved to separate files later if needed)
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import Subjects from './components/Subjects';
import Exams from './components/Exams';
import Analytics from './components/Analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State management with localStorage
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('studyflow_subjects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Mathematics', color: '#ef4444', totalMinutes: 0 },
      { id: '2', name: 'Science', color: '#3b82f6', totalMinutes: 0 },
      { id: '3', name: 'English', color: '#10b981', totalMinutes: 0 },
    ];
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('studyflow_exams');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('studyflow_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('studyflow_stats');
    return saved ? JSON.parse(saved) : {
      streak: 0,
      lastStudyDate: null,
      dailyGoalMinutes: 120,
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('studyflow_subjects', JSON.stringify(subjects));
    localStorage.setItem('studyflow_exams', JSON.stringify(exams));
    localStorage.setItem('studyflow_sessions', JSON.stringify(sessions));
    localStorage.setItem('studyflow_stats', JSON.stringify(stats));
  }, [subjects, exams, sessions, stats]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addSession = (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    
    // Update subject total time
    setSubjects(prev => prev.map(s => 
      s.id === session.subjectId 
        ? { ...s, totalMinutes: s.totalMinutes + session.durationMinutes }
        : s
    ));

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastStudyDate !== today) {
      const yesterday = subDays(new Date(), 1).toISOString().split('T')[0];
      const newStreak = stats.lastStudyDate === yesterday ? stats.streak + 1 : 1;
      setStats(prev => ({
        ...prev,
        streak: newStreak,
        lastStudyDate: today
      }));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'timer', label: 'Timer', icon: TimerIcon },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: Calendar },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className={cn(
      "min-h-screen pb-20 transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-opacity-80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">StudyFlow</h1>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                sessions={sessions} 
                subjects={subjects} 
                exams={exams}
              />
            )}
            {activeTab === 'timer' && (
              <Timer 
                subjects={subjects} 
                onSessionComplete={addSession} 
              />
            )}
            {activeTab === 'subjects' && (
              <Subjects 
                subjects={subjects} 
                setSubjects={setSubjects} 
              />
            )}
            {activeTab === 'exams' && (
              <Exams 
                exams={exams} 
                setExams={setExams} 
                subjects={subjects}
              />
            )}
            {activeTab === 'analytics' && (
              <Analytics 
                sessions={sessions} 
                subjects={subjects} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-indigo-50")} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="w-1 h-1 bg-indigo-600 rounded-full mt-0.5"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
