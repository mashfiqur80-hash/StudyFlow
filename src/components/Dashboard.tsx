import React from 'react';
import { Flame, Trophy, Clock, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import { UserStats, StudySession, Subject, Exam } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  stats: UserStats;
  sessions: StudySession[];
  subjects: Subject[];
  exams: Exam[];
}

export default function Dashboard({ stats, sessions, subjects, exams }: DashboardProps) {
  const todaySessions = sessions.filter(s => isToday(parseISO(s.timestamp)));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const progress = Math.min(100, (todayMinutes / stats.dailyGoalMinutes) * 100);

  const upcomingExams = [...exams]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const quotes = [
    "The secret of getting ahead is getting started.",
    "Don't stop until you're proud.",
    "Focus on being productive instead of busy.",
    "Your future self will thank you for today's work.",
    "Small progress is still progress."
  ];
  const quote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h2 className="text-2xl font-bold">Hello, Student! 👋</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 italic">"{quote}"</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-2xl font-bold">{stats.streak}</span>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Day Streak</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-2xl font-bold">{Math.round(todayMinutes / 60 * 10) / 10}h</span>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Today</span>
        </div>
      </div>

      {/* Progress Card */}
      <section className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Daily Goal</h3>
            <p className="text-3xl font-bold">{todayMinutes} <span className="text-lg font-normal opacity-70">/ {stats.dailyGoalMinutes}m</span></p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </section>

      {/* Upcoming Exams */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Upcoming Exams</h3>
          <button className="text-indigo-600 text-sm font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {upcomingExams.length > 0 ? upcomingExams.map(exam => {
            const daysLeft = differenceInDays(new Date(exam.date), new Date());
            const subject = subjects.find(s => s.id === exam.subjectId);
            return (
              <div key={exam.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}>
                  <span className="text-xs font-bold uppercase">{format(new Date(exam.date), 'MMM')}</span>
                  <span className="text-lg font-bold leading-none">{format(new Date(exam.date), 'dd')}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{exam.title}</h4>
                  <p className="text-xs text-zinc-500">{subject?.name}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                  )}>
                    {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No upcoming exams. Relax!</p>
            </div>
          )}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h3 className="text-lg font-bold mb-4">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className={cn(
            "flex-shrink-0 w-24 h-32 rounded-2xl border flex flex-col items-center justify-center text-center p-2 transition-all",
            stats.streak >= 3 ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800" : "bg-zinc-100 border-transparent opacity-40"
          )}>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight">3 Day Streak</span>
          </div>
          <div className={cn(
            "flex-shrink-0 w-24 h-32 rounded-2xl border flex flex-col items-center justify-center text-center p-2 transition-all",
            sessions.length >= 5 ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-zinc-100 border-transparent opacity-40"
          )}>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight">5 Sessions</span>
          </div>
          <div className={cn(
            "flex-shrink-0 w-24 h-32 rounded-2xl border flex flex-col items-center justify-center text-center p-2 transition-all",
            todayMinutes >= stats.dailyGoalMinutes ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-zinc-100 border-transparent opacity-40"
          )}>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight">Goal Met</span>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      <section>
        <h3 className="text-lg font-bold mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {sessions.slice(0, 3).map(session => {
            const subject = subjects.find(s => s.id === session.subjectId);
            return (
              <div key={session.id} className="flex items-center gap-4">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: subject?.color }} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{subject?.name}</h4>
                  <p className="text-xs text-zinc-500">{format(parseISO(session.timestamp), 'h:mm a')} • {session.durationMinutes} mins</p>
                </div>
                {session.notes && <p className="text-[10px] text-zinc-400 max-w-[100px] truncate">{session.notes}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
