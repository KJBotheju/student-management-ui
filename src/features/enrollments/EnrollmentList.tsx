import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Snackbar,
    Divider,
} from '@mui/material';
import { 
    Delete as DeleteIcon, 
    Grade as GradeIcon,
    Add as AddIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
    fetchStudentEnrollments,
    enrollStudent,
    gradeEnrollment,
    dropEnrollment,
    fetchStudentGPA,
} from './enrollmentSlice';
import { fetchStudents } from '../students/studentSlice';
import { fetchCourses } from '../courses/courseSlice';

const EnrollmentList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { enrollments, loading } = useSelector((state: RootState) => state.enrollments);
    const { students } = useSelector((state: RootState) => state.students);
    const { courses } = useSelector((state: RootState) => state.courses);
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
    });
    
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const [enrollOpen, setEnrollOpen] = useState(false);
    const [gradeOpen, setGradeOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [enrollFormData, setEnrollFormData] = useState({
        studentId: '',
        courseId: '',
    });
    const [grade, setGrade] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [gpa, setGpa] = useState<number | null>(null);

    const gradeMapping = {
        'A_PLUS': 'A +',
        'A': 'A',
        'A_MINUS': 'A -',
        'B_PLUS': 'B +',
        'B': 'B',
        'B_MINUS': 'B -',
        'C_PLUS': 'C +',
        'C': 'C',
        'C_MINUS': 'C -',
        'D_PLUS': 'D +',
        'D': 'D',
        'E': 'E'
    };

    const backendGrades = ['A_PLUS', 'A', 'A_MINUS', 'B_PLUS', 'B', 'B_MINUS', 'C_PLUS', 'C', 'C_MINUS', 'D_PLUS', 'D', 'E'];

    const displayGrades = backendGrades.map(grade => ({
        backend: grade,
        display: gradeMapping[grade as keyof typeof gradeMapping]
    }));

    const getDisplayGrade = (backendGrade: string) => {
        return gradeMapping[backendGrade as keyof typeof gradeMapping] || backendGrade;
    };

    useEffect(() => {
        dispatch(fetchStudents({ page: 0, size: 100 }));
        dispatch(fetchCourses({ page: 0, size: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (selectedStudentId) {
            dispatch(fetchStudentEnrollments(Number(selectedStudentId)))
                .catch(error => {
                    console.error('Error fetching enrollments:', error);
                    alert('Error loading enrollments. Please try again.');
                });
            dispatch(fetchStudentGPA(Number(selectedStudentId)))
                .then((action: any) => {
                    if (action.payload) {
                        setGpa(action.payload.gpa);
                    }
                })
                .catch(error => {
                    console.error('Error fetching GPA:', error);
                });
        }
    }, [dispatch, selectedStudentId]);

    useEffect(() => {
        if (user?.role === 'STUDENT' && user?.email && students.length > 0 && !selectedStudentId) {
            const currentStudent = students.find((student: any) => 
                student.email === user.email
            );
            if (currentStudent) {
                setSelectedStudentId(currentStudent.id.toString());
            }
        }
    }, [user, students, selectedStudentId]);

    const handleEnrollOpen = () => {
        if (!selectedStudentId) {
            alert('Please select a student first');
            return;
        }
        setEnrollFormData({ 
            studentId: selectedStudentId, 
            courseId: '' 
        });
        setEnrollOpen(true);
    };

    const handleGradeOpen = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setGrade(enrollment.grade || '');
        setGradeOpen(true);
    };

    const handleEnrollSubmit = async () => {
        try {
            if (!enrollFormData.studentId || !enrollFormData.courseId) {
                setSnackbar({
                    open: true,
                    message: 'Please select both student and course',
                    severity: 'warning'
                });
                return;
            }

            const result = await dispatch(enrollStudent({
                studentId: Number(enrollFormData.studentId),
                courseId: Number(enrollFormData.courseId),
            }));

            if (enrollStudent.fulfilled.match(result)) {
                setSnackbar({
                    open: true,
                    message: 'Student enrolled successfully!',
                    severity: 'success'
                });
                setEnrollOpen(false);
                if (selectedStudentId) {
                    try {
                        await dispatch(fetchStudentEnrollments(Number(selectedStudentId))).unwrap();
                    } catch (error) {
                        console.error('Error refreshing enrollments:', error);
                    }
                }
            } else {
                const error = result.payload as any;
                setSnackbar({
                    open: true,
                    message: error?.message || 'Failed to enroll student. Please try again.',
                    severity: 'error'
                });
            }
        } catch (error: any) {
            console.error('Error enrolling student:', error);
            alert(error?.message || 'Failed to enroll student. Please try again.');
        }
    };

    const handleGradeSubmit = async () => {
        if (selectedEnrollment && grade) {
            try {
                await dispatch(gradeEnrollment({
                    id: selectedEnrollment.id,
                    grade: grade,
                }));
                setSnackbar({
                    open: true,
                    message: 'Grade updated successfully!',
                    severity: 'success'
                });
                setGradeOpen(false);
                if (selectedStudentId) {
                    dispatch(fetchStudentEnrollments(Number(selectedStudentId)));
                    dispatch(fetchStudentGPA(Number(selectedStudentId)))
                        .then((action: any) => {
                            if (action.payload) {
                                setGpa(action.payload.gpa);
                            }
                        });
                }
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to update grade. Please try again.',
                    severity: 'error'
                });
            }
        }
    };

    const handleDrop = (id: number) => {
        setConfirmDialog({
            open: true,
            title: 'Drop Enrollment',
            message: 'Are you sure you want to drop this enrollment? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await dispatch(dropEnrollment(id));
                    if (selectedStudentId) {
                        await dispatch(fetchStudentEnrollments(Number(selectedStudentId)));
                        const gpaAction: any = await dispatch(fetchStudentGPA(Number(selectedStudentId)));
                        if (gpaAction.payload) {
                            setGpa(gpaAction.payload.gpa);
                        }
                    }
                    setSnackbar({
                        open: true,
                        message: 'Enrollment dropped successfully!',
                        severity: 'success'
                    });
                } catch (error) {
                    setSnackbar({
                        open: true,
                        message: 'Failed to drop enrollment. Please try again.',
                        severity: 'error'
                    });
                }
                setConfirmDialog(prev => ({ ...prev, open: false }));
            }
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Enrollments
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEnrollOpen}
                    disabled={!selectedStudentId}
                    startIcon={<AddIcon />}
                    sx={{ 
                        backgroundColor: '#2e7d32',
                        '&:hover': {
                            backgroundColor: '#1b5e20',
                        },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                    }}
                >
                    New Enrollment
                </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>
                        {user?.role === 'STUDENT' ? 'Your Account' : 'Select Student'}
                    </InputLabel>
                    <Select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        disabled={user?.role === 'STUDENT'}
                    >
                        {students.map((student: any) => (
                            <MenuItem key={student.id} value={student.id}>
                                {student.email}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {user?.role === 'STUDENT' && !selectedStudentId && students.length > 0 && (
                <Paper 
                    sx={{ 
                        p: 3, 
                        mb: 3,
                        textAlign: 'center',
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText',
                        borderRadius: 2
                    }}
                >
                    <PersonIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Student Record Not Found
                    </Typography>
                    <Typography variant="body1">
                        We couldn't find your student record using email: {user?.email}
                        <br />
                        Please contact the administrator to link your account.
                    </Typography>
                </Paper>
            )}

            {selectedStudentId && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                    {gpa !== null && (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                backgroundColor: 'primary.light',
                                color: 'white',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <GradeIcon />
                            <Typography variant="h6" component="div">
                                Current GPA: {gpa.toFixed(2)}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {selectedStudentId && (
                <>
                    <TableContainer 
                        component={Paper} 
                        sx={{ 
                            borderRadius: 2,
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course Code</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course Title</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credits</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {enrollments.map((enrollment: any) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>{enrollment.course.code}</TableCell>
                                        <TableCell>{enrollment.course.title}</TableCell>
                                        <TableCell>{enrollment.course.credits}</TableCell>
                                        <TableCell>{enrollment.grade ? getDisplayGrade(enrollment.grade) : 'Not graded'}</TableCell>
                                        <TableCell>
                                            {user?.role !== 'STUDENT' && (
                                                <IconButton onClick={() => handleGradeOpen(enrollment)}>
                                                    <GradeIcon />
                                                </IconButton>
                                            )}
                                            <IconButton onClick={() => handleDrop(enrollment.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Dialog 
                open={enrollOpen} 
                onClose={() => setEnrollOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                        color: 'white',
                        py: 3,
                        position: 'relative',
                        textAlign: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <SchoolIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                            New Enrollment
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setEnrollOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Course</InputLabel>
                        <Select
                            required
                            value={enrollFormData.courseId}
                            onChange={(e) => setEnrollFormData({
                                ...enrollFormData,
                                courseId: e.target.value,
                            })}
                            sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32',
                                },
                            }}
                        >
                            {courses
                                .filter((course: any) => 
                                    !enrollments.some(e => e.course.id === course.id))
                                .map((course: any) => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.code} - {course.title}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center', backgroundColor: '#fafafa' }}>
                    <Button 
                        onClick={() => setEnrollOpen(false)}
                        variant="outlined"
                        sx={{
                            color: '#666',
                            borderColor: '#ddd',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5',
                            },
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEnrollSubmit} 
                        variant="contained"
                        disabled={!enrollFormData.courseId}
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                            },
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                        }}
                    >
                        Enroll Student
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={gradeOpen} 
                onClose={() => setGradeOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                        color: 'white',
                        py: 3,
                        position: 'relative',
                        textAlign: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <GradeIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                            Update Grade
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setGradeOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Grade</InputLabel>
                        <Select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2e7d32',
                                },
                            }}
                        >
                            {displayGrades.map((gradeItem) => (
                                <MenuItem key={gradeItem.backend} value={gradeItem.backend}>
                                    {gradeItem.display}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center', backgroundColor: '#fafafa' }}>
                    <Button 
                        onClick={() => setGradeOpen(false)}
                        variant="outlined"
                        sx={{
                            color: '#666',
                            borderColor: '#ddd',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5',
                            },
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleGradeSubmit} 
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                            },
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                        }}
                    >
                        Update Grade
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    marginTop: '80px',
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbar.severity === 'success' ? '#2e7d32' : 
                            snackbar.severity === 'error' ? '#d32f2f' : 
                            snackbar.severity === 'warning' ? '#f57c00' : '#1976d2',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '300px',
                        fontSize: '1rem',
                    }
                }}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            />
        </Box>
    );
};

export default EnrollmentList;
