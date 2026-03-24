import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, X, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Exam, Subject } from '../types';
import { cn } from '../lib/utils';

interface ExamsProps {
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  subjects: Subject[];
}

export default function Exams({ exams, setExams, subjects }: ExamsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    date: '',
    description: ''
  });

  const addExam = () => {
    if (!newExam.title || !newExam.date || !newExam.subjectId) return;
    const exam: Exam = {
      ...newExam,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExams([...exams, exam]);
    setIsAdding(false);
    setNewExam({ title: '', subjectId: subjects[0]?.id || '', date: '', description: '' });
  };

  const deleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exams</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Add Exam Reminder</h3>
            <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-zinc-400" /></button>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Exam Title (e.g. Midterm)"
              value={newExam.title}
              onChange={(e) => setNewExam({...newExam, title: e.target.value})}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select 
              value={newExam.subjectId}
              onChange={(e) => setNewExam({...newExam, subjectId: e.target.value})}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input 
              type="date" 
              value={newExam.date}
              onChange={(e) => setNewExam({...newExam, date: e.target.value})}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <textarea 
              placeholder="Description (optional)"
              value={newExam.description}
              onChange={(e) => setNewExam({...newExam, description: e.target.value})}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
            />
          </div>
          <button 
            onClick={addExam}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl"
          >
            Save Reminder
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sortedExams.length > 0 ? sortedExams.map(exam => {
          const daysLeft = differenceInDays(new Date(exam.date), new Date());
          const subject = subjects.find(s => s.id === exam.subjectId);
          const isUrgent = daysLeft <= 3 && daysLeft >= 0;

          return (
            <div key={exam.id} className={cn(
              "bg-white dark:bg-zinc-900 p-5 rounded-3xl border transition-all",
              isUrgent ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10" : "border-zinc-200 dark:border-zinc-800"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}>
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{exam.title}</h4>
                    <p className="text-xs text-zinc-500">{subject?.name}</p>
                  </div>
                </div>
                <button onClick={() => deleteExam(exam.id)} className="text-zinc-300 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">{format(new Date(exam.date), 'EEEE, MMMM do')}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                  isUrgent ? "bg-red-100 text-red-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                )}>
                  {isUrgent && <AlertCircle className="w-3 h-3" />}
                  {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
                </div>
              </div>
              {exam.description && (
                <p className="mt-3 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 italic">
                  {exam.description}
                </p>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No exams scheduled. Add one to stay ahead!</p>
          </div>
        )}
      </div>
    </div>
  );
}
