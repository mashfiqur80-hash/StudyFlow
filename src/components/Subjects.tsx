import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Subject } from '../types';
import { cn } from '../lib/utils';

interface SubjectsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
}

export default function Subjects({ subjects, setSubjects }: SubjectsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', 
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
  ];

  const addSubject = () => {
    if (!newName.trim()) return;
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      color: newColor,
      totalMinutes: 0
    };
    setSubjects([...subjects, newSubject]);
    setNewName('');
    setIsAdding(false);
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subjects</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Add New Subject</h3>
            <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-zinc-400" /></button>
          </div>
          <input 
            type="text" 
            placeholder="Subject Name (e.g. Physics)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Choose Color</label>
            <div className="flex flex-wrap gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform",
                    newColor === color ? "scale-125 ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {newColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={addSubject}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            Create Subject
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: subject.color }}>
              <span className="text-xl font-bold">{subject.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{subject.name}</h4>
              <p className="text-xs text-zinc-500">{Math.round(subject.totalMinutes / 60 * 10) / 10} hours studied</p>
            </div>
            <button 
              onClick={() => deleteSubject(subject.id)}
              className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
