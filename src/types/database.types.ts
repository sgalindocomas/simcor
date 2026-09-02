export type UserRole = 'centro' | 'profesor' | 'alumno' | 'admin';
export type Language = 'es' | 'en' | 'pt' | 'fr';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  lang: Language;
  created_at?: string;
  updated_at?: string;
}

export interface Center {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  study_type?: string | null;
  center_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  center_id: string;
  department?: string | null;
  course_group?: string | null;
  student_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Professor {
  id: string;
  center_id: string;
  department?: string | null;
  employee_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EnrolledStudentProfile extends Profile {
  student_data?: Student;
}

export interface EnrolledProfessorProfile extends Profile {
  professor_data?: Professor;
}

export interface CenterSignUpData {
  email: string;
  password?: string;
  full_name: string;
  center_name: string;
  study_type: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  lang?: Language;
}

export interface StudentEnrollData {
  email: string;
  password?: string;
  full_name: string;
  center_id: string;
  course_group?: string;
  department?: string;
  student_code?: string;
  lang?: Language;
}

export interface ProfessorEnrollData {
  email: string;
  password?: string;
  full_name: string;
  center_id: string;
  department?: string;
  employee_number?: string;
  lang?: Language;
}
