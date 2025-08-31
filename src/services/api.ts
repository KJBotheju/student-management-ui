import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request:', config.url, token.substring(0, 20) + '...');
        } else {
            console.log('No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            console.log('401 Unauthorized - redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const courseAPI = {
    getAllCourses: (page = 0, size = 10) => api.get(`/courses?page=${page}&size=${size}`),
    getCourse: (id: number) => api.get(`/courses/${id}`),
    createCourse: (course: any) => api.post('/courses', course),
    updateCourse: (id: number, course: any) => api.put(`/courses/${id}`, course),
    deleteCourse: (id: number) => api.delete(`/courses/${id}`),
};

export const studentAPI = {
    getAllStudents: (page = 0, size = 10) => api.get(`/students?page=${page}&size=${size}`),
    getStudent: (id: number) => api.get(`/students/${id}`),
    createStudent: (student: any) => api.post('/students', student),
    updateStudent: (id: number, student: any) => api.put(`/students/${id}`, student),
    deleteStudent: (id: number) => api.delete(`/students/${id}`),
};

export const enrollmentAPI = {
    enroll: (studentId: number, courseId: number) => 
        api.post(`/enrollments/enroll?studentId=${studentId}&courseId=${courseId}`),
    grade: (id: number, grade: string) => 
        api.patch(`/enrollments/${id}/grade?grade=${encodeURIComponent(grade)}`, null),
    getByStudent: (studentId: number) => 
        api.get(`/enrollments/by-student/${studentId}`),
    getByCourse: (courseId: number) => 
        api.get(`/enrollments/by-course/${courseId}`),
    drop: (id: number) => 
        api.delete(`/enrollments/${id}`),
    getGPA: (studentId: number) => 
        api.get(`/enrollments/gpa/${studentId}`),
};

export default api;
