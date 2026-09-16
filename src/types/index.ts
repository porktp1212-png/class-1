export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; // รหัสนักเรียน (เช่น 65001)
  grade?: string; // เช่น ม.3/1
  subject?: string; // วิชา/กลุ่มสาระ สำหรับครู
  department?: string;
  password?: string; // For fallback credential validation
  totalPoints: number;
  level: number;
  streakDays?: number;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  code: string; // 6-digit code for joining
  teacherId: string;
  teacherName: string;
  description: string;
  color: string;
  studentIds: string[];
  schedule?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  classroomId: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'pdf' | 'video' | 'link' | 'slide' | 'doc';
  unit?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  pointsReward: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileUrl?: string;
  score?: number | null;
  status: 'submitted' | 'graded' | 'late';
  teacherFeedback?: string;
  aiFeedback?: string;
  pointsAwarded?: number;
}

export interface AttendanceRecord {
  id: string;
  classroomId: string;
  date: string; // YYYY-MM-DD
  checkedAt: string;
  records: Record<
    string,
    {
      status: 'present' | 'late' | 'absent' | 'leave';
      note?: string;
    }
  >;
}

export interface BehaviorRecord {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  type: 'positive' | 'needs_improvement';
  category: string;
  scoreDelta: number;
  note?: string;
  date: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  classroomId: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  timeLimitMinutes: number;
  maxScore: number;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalScore: number;
  answers: number[];
  completedAt: string;
  pointsEarned: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  receiverId?: string; // studentId, teacherId, or 'all'
  classroomId: string;
  text: string;
  content?: string;
  timestamp: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  title: string;
  reason: string;
  issuedDate: string;
  teacherName: string;
  schoolName?: string;
  certificateNumber: string;
  pointsSnapshot?: number;
}
