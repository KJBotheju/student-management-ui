import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { studentAPI } from '../../services/api';

interface Student {
    id: number;
    indexNumber: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface StudentState {
    students: Student[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}

const initialState: StudentState = {
    students: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
};

export const fetchStudents = createAsyncThunk(
    'students/fetchStudents',
    async ({ page, size }: { page: number; size: number }) => {
        const response = await studentAPI.getAllStudents(page, size);
        return response.data;
    }
);

export const createStudent = createAsyncThunk(
    'students/createStudent',
    async (student: Omit<Student, 'id'>) => {
        const response = await studentAPI.createStudent(student);
        return response.data;
    }
);

export const updateStudent = createAsyncThunk(
    'students/updateStudent',
    async ({ id, student }: { id: number; student: Student }) => {
        const response = await studentAPI.updateStudent(id, student);
        return response.data;
    }
);

export const deleteStudent = createAsyncThunk(
    'students/deleteStudent',
    async (id: number) => {
        await studentAPI.deleteStudent(id);
        return id;
    }
);

const studentSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.students = action.payload.content || [];
                state.currentPage = action.payload.number || action.payload.currentPage || 0;
                state.totalPages = action.payload.totalPages || 0;
                state.error = null;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch students';
            })
            .addCase(createStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students.push(action.payload);
                state.error = null;
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create student';
            })
            .addCase(updateStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.students.findIndex(student => student.id === action.payload.id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update student';
            })
            .addCase(deleteStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students = state.students.filter(student => student.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete student';
            });
    },
});

export default studentSlice.reducer;
