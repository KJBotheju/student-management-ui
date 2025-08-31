import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './store/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import CourseList from './features/courses/CourseList';
import StudentList from './features/students/StudentList';
import EnrollmentList from './features/enrollments/EnrollmentList';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ProtectedRoute from './features/auth/ProtectedRoute';
import { loadUserFromToken } from './features/auth/authSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// App content component
const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Load user data from token on app start
    dispatch(loadUserFromToken());
  }, [dispatch]);

  // Protected Route wrapper that checks user role
  const RoleProtectedRoute: React.FC<{ 
    children: React.ReactNode; 
    allowedRoles?: string[];
    redirectTo?: string;
  }> = ({ children, allowedRoles = [], redirectTo = "/enrollments" }) => {
    return (
      <ProtectedRoute>
        {user && allowedRoles.length > 0 && !allowedRoles.includes(user.role) ? (
          <Navigate to={redirectTo} replace />
        ) : (
          children
        )}
      </ProtectedRoute>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? (
            user?.role === 'STUDENT' ? <Navigate to="/enrollments" replace /> : <Navigate to="/courses" replace />
          ) : <Login />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? (
            user?.role === 'STUDENT' ? <Navigate to="/enrollments" replace /> : <Navigate to="/courses" replace />
          ) : <Signup />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'STUDENT' ? (
                <Navigate to="/enrollments" replace />
              ) : (
                <Navigate to="/courses" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route
          path="/courses"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
              <Layout>
                <CourseList />
              </Layout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
              <Layout>
                <StudentList />
              </Layout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <Layout>
                <EnrollmentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Fallback route */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              user?.role === 'STUDENT' ? (
                <Navigate to="/enrollments" replace />
              ) : (
                <Navigate to="/courses" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
