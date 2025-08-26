import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { courseAPI } from '../../services/api';

interface Course {
    id: number;
    code: string;
    title: string;
    credits: number;
    capacity: number;
}

interface CourseState {
    courses: Course[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
}

const initialState: CourseState = {
    courses: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
};

export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async ({ page, size }: { page: number; size: number }) => {
        const response = await courseAPI.getAllCourses(page, size);
        return response.data;
    }
);

export const createCourse = createAsyncThunk(
    'courses/createCourse',
    async (course: Omit<Course, 'id'>) => {
        const response = await courseAPI.createCourse(course);
        return response.data;
    }
);

export const updateCourse = createAsyncThunk(
    'courses/updateCourse',
    async ({ id, course }: { id: number; course: Course }) => {
        const response = await courseAPI.updateCourse(id, course);
        return response.data;
    }
);

export const deleteCourse = createAsyncThunk(
    'courses/deleteCourse',
    async (id: number) => {
        await courseAPI.deleteCourse(id);
        return id;
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // Handle both DTO and direct Page response formats
                state.courses = action.payload.content || [];
                state.currentPage = action.payload.number || action.payload.currentPage || 0;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch courses';
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                state.courses.push(action.payload);
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                const index = state.courses.findIndex(course => course.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.courses = state.courses.filter(course => course.id !== action.payload);
            });
    },
});

export default courseSlice.reducer;
