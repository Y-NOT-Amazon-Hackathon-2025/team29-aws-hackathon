export interface Certificate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examDate?: string;
  passingScore: number;
  subjects: string[];
}

export interface Curriculum {
  id: string;
  certificateId: string;
  userId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalWeeks: number;
  dailyHours: number;
  totalHours?: number;
  status?: 'active' | 'inactive';
  weeklyPlan: WeeklyPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyPlan {
  week: number;
  topics: string[];
  goals: string[];
  resources: Resource[];
}

export interface Resource {
  type: 'book' | 'video' | 'practice' | 'article';
  title: string;
  url?: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
