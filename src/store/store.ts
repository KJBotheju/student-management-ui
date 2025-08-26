import { configureStore } from '@reduxjs/toolkit';
import courseReducer from '../features/courses/courseSlice';
import studentReducer from '../features/students/studentSlice';
import enrollmentReducer from '../features/enrollments/enrollmentSlice';

export const store = configureStore({
    reducer: {
        courses: courseReducer,
        students: studentReducer,
        enrollments: enrollmentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
