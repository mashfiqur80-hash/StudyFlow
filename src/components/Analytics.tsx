import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, startOfWeek, eachDayOfInterval, subDays, isSameDay, parseISO } from 'date-fns';
import { Download } from 'lucide-react';
import { StudySession, Subject } from '../types';

interface AnalyticsProps {
  sessions: StudySession[];
  subjects: Subject[];
}

export default function Analytics({ sessions, subjects }: AnalyticsProps) {
  // Weekly Data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(day => {
    const daySessions = sessions.filter(s => isSameDay(parseISO(s.timestamp), day));
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return {
      name: format(day, 'EEE'),
      minutes: totalMinutes,
      hours: Math.round(totalMinutes / 60 * 10) / 10
    };
  });

  // Subject Distribution Data
  const subjectData = subjects.map(subject => ({
    name: subject.name,
    value: subject.totalMinutes,
    color: subject.color
  })).filter(s => s.value > 0);

  const mostStudied = [...subjects].sort((a, b) => b.totalMinutes - a.totalMinutes)[0];

  const exportData = () => {
    const data = {
      sessions,
      subjects,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <button 
          onClick={exportData}
          className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition-colors"
          title="Export Data"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Time</p>
          <p className="text-2xl font-bold">{Math.round(sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60)}h</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Top Subject</p>
          <p className="text-lg font-bold truncate">{mostStudied?.name || 'None'}</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-6">Weekly Progress (Hours)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Subject Distribution */}
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-6">Subject Distribution</h3>
        {subjectData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 w-full">
              {subjectData.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500 text-sm py-8">Start studying to see distribution!</p>
        )}
      </section>
    </div>
  );
}
