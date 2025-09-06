// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Certificate Types
export interface Certificate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examDate?: string;
  registrationPeriod?: string;
  passingScore?: number;
  subjects?: string[];
  createdAt: string;
  updatedAt: string;
}

// Curriculum Types
export interface Curriculum {
  id: string;
  certificateId: string;
  certificateName: string;
  userId: string;
  studyPeriod: number; // days
  dailyStudyHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  weeklyPlan: WeeklyPlan[];
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyPlan {
  week: number;
  topics: string[];
  goals: string[];
  estimatedHours: number;
}

export interface Resource {
  type: 'book' | 'video' | 'practice' | 'website';
  title: string;
  description?: string;
  url?: string;
  author?: string;
  price?: number;
  rating?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Curriculum Generation Types
export interface CurriculumRequest {
  certificateId: string;
  studyPeriod: number;
  dailyStudyHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Task Types
export interface Task {
  id: string;
  curriculumId: string;
  week: number;
  day: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  estimatedHours: number;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'exam' | 'deadline';
  description?: string;
  completed?: boolean;
}
