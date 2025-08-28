import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/courses/courseSlice';
import studentReducer from '../features/students/studentSlice';
import enrollmentReducer from '../features/enrollments/enrollmentSlice';
import authReducer from '../features/auth/authSlice';

export interface Course {
    id: number;
    code: string;
    title: string;
    credits: number;
    capacity: number;
}

export interface Student {
    id: number;
    indexNumber: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Enrollment {
    id: number;
    student: Student;
    course: Course;
    enrolledAt: string;
    grade?: string;
}

export interface CourseState {
    courses: Course[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}

export interface StudentState {
    students: Student[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}

export interface EnrollmentState {
    enrollments: Enrollment[];
    loading: boolean;
    error: string | null;
}

export const store = configureStore({
    reducer: {
        courses: courseReducer,
        students: studentReducer,
        enrollments: enrollmentReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
