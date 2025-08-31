import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    username: string;
    email: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthResponse {
    token?: string;
    type?: string;
    username?: string;
    email?: string;
    role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    message?: string;
}

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.post<AuthResponse>('/auth/login', credentials);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                
                return response.data;
            } else {
                return rejectWithValue(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async (userData: SignupRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.post<AuthResponse>('/auth/signup', userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Signup failed'
            );
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.post('/auth/logout');
            localStorage.removeItem('token');
            return {};
        } catch (error: any) {
            localStorage.removeItem('token');
            return {};
        }
    }
);

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        loadUserFromToken: (state) => {
            const token = localStorage.getItem('token');
            if (token) {
                state.token = token;
                state.isAuthenticated = true;
            }
        },
        logoutLocal: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token || null;
                state.user = action.payload.username ? {
                    username: action.payload.username,
                    email: action.payload.email || '',
                    role: action.payload.role || 'STUDENT'
                } : null;
                state.isAuthenticated = !!action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });

        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError, loadUserFromToken, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
