import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Link,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
    Badge as BadgeIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { signup, clearError } from './authSlice';

const Signup: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT' as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) {
            dispatch(clearError());
        }
    };

    const handleRoleChange = (e: any) => {
        setFormData(prev => ({
            ...prev,
            role: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            dispatch({ type: 'auth/setError', payload: 'Passwords do not match' });
            return;
        }

        if (formData.password.length < 6) {
            dispatch({ type: 'auth/setError', payload: 'Password must be at least 6 characters long' });
            return;
        }

        try {
            const signupData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            const result = await dispatch(signup(signupData));
            if (signup.fulfilled.match(result)) {
                setSignupSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
        }
    };

    if (signupSuccess) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                    padding: 2,
                }}
            >
                <Card
                    sx={{
                        maxWidth: 400,
                        width: '100%',
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 2 }}>
                            Account Created Successfully!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Your account has been created. Redirecting to login...
                        </Typography>
                        <CircularProgress sx={{ color: '#2e7d32' }} />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                padding: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 1 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Join University Course Management
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="username"
                            label="Username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={handleRoleChange}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <BadgeIcon color="action" />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="STUDENT">Student</MenuItem>
                                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                backgroundColor: '#2e7d32',
                                '&:hover': {
                                    backgroundColor: '#1b5e20',
                                },
                                py: 1.5,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1rem',
                                borderRadius: 2,
                                mb: 2,
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Create Account'
                            )}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    sx={{
                                        color: '#2e7d32',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Sign in here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Signup;
