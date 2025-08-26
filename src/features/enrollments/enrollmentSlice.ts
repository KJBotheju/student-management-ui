import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { enrollmentAPI } from '../../services/api';

export interface Enrollment {
    id: number;
    student: any;
    course: any;
    enrolledAt: string;
    grade?: string;
}

interface EnrollmentState {
    enrollments: Enrollment[];
    loading: boolean;
    error: string | null;
}

const initialState: EnrollmentState = {
    enrollments: [],
    loading: false,
    error: null,
};

export const enrollStudent = createAsyncThunk(
    'enrollments/enrollStudent',
    async ({ studentId, courseId }: { studentId: number; courseId: number }) => {
        const response = await enrollmentAPI.enroll(studentId, courseId);
        return response.data;
    }
);

export const gradeEnrollment = createAsyncThunk(
    'enrollments/gradeEnrollment',
    async ({ id, grade }: { id: number; grade: string }) => {
        const response = await enrollmentAPI.grade(id, grade);
        return response.data;
    }
);

export const fetchStudentEnrollments = createAsyncThunk(
    'enrollments/fetchStudentEnrollments',
    async (studentId: number) => {
        const response = await enrollmentAPI.getByStudent(studentId);
        return response.data;
    }
);

export const fetchCourseEnrollments = createAsyncThunk(
    'enrollments/fetchCourseEnrollments',
    async (courseId: number) => {
        const response = await enrollmentAPI.getByCourse(courseId);
        return response.data;
    }
);

export const dropEnrollment = createAsyncThunk(
    'enrollments/dropEnrollment',
    async (id: number) => {
        await enrollmentAPI.drop(id);
        return id;
    }
);

export const fetchStudentGPA = createAsyncThunk(
    'enrollments/fetchStudentGPA',
    async (studentId: number) => {
        const response = await enrollmentAPI.getGPA(studentId);
        return { studentId, gpa: response.data };
    }
);

const enrollmentSlice = createSlice({
    name: 'enrollments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.enrollments = action.payload;
            })
            .addCase(fetchStudentEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch enrollments';
            })
            .addCase(enrollStudent.fulfilled, (state, action) => {
                state.enrollments.push(action.payload);
            })
            .addCase(gradeEnrollment.fulfilled, (state, action) => {
                const index = state.enrollments.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.enrollments[index] = action.payload;
                }
            })
            .addCase(dropEnrollment.fulfilled, (state, action) => {
                state.enrollments = state.enrollments.filter(e => e.id !== action.payload);
            });
    },
});

export default enrollmentSlice.reducer;
