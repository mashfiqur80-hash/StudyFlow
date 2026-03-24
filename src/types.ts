export type Subject = {
  id: string;
  name: string;
  color: string;
  totalMinutes: number;
};

export type Exam = {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  description: string;
};

export type StudySession = {
  id: string;
  subjectId: string;
  durationMinutes: number;
  timestamp: string;
  notes?: string;
};

export type UserStats = {
  streak: number;
  lastStudyDate: string | null;
  dailyGoalMinutes: number;
};
