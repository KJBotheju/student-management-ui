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
    AlertColor,
} from '@mui/material';
import { 
    Delete as DeleteIcon, 
    Grade as GradeIcon,
    Add as AddIcon 
} from '@mui/icons-material';
import Notification from '../../components/Notification';
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
    
    // Notification state
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as AlertColor
    });
    
    // Confirmation dialog state
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

    const grades = ['A_PLUS', 'A', 'A_MINUS', 'B_PLUS', 'B', 'B_MINUS', 
                   'C_PLUS', 'C', 'C_MINUS', 'D_PLUS', 'D', 'E'];

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
                alert('Please select both student and course');
                return;
            }

            const result = await dispatch(enrollStudent({
                studentId: Number(enrollFormData.studentId),
                courseId: Number(enrollFormData.courseId),
            }));

            if (enrollStudent.fulfilled.match(result)) {
                setEnrollOpen(false);
                if (selectedStudentId) {
                    try {
                        await dispatch(fetchStudentEnrollments(Number(selectedStudentId))).unwrap();
                    } catch (error) {
                        console.error('Error refreshing enrollments:', error);
                        // Don't show alert here as the enrollment was successful
                    }
                }
            } else {
                const error = result.payload as any;
                alert(error?.message || 'Failed to enroll student. Please try again.');
            }
        } catch (error: any) {
            console.error('Error enrolling student:', error);
            alert(error?.message || 'Failed to enroll student. Please try again.');
        }
    };

    const handleGradeSubmit = async () => {
        if (selectedEnrollment && grade) {
            await dispatch(gradeEnrollment({
                id: selectedEnrollment.id,
                grade: grade,
            }));
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
                        // Refresh GPA after dropping enrollment
                        const gpaAction: any = await dispatch(fetchStudentGPA(Number(selectedStudentId)));
                        if (gpaAction.payload) {
                            setGpa(gpaAction.payload.gpa);
                        }
                    }
                    setNotification({
                        open: true,
                        message: 'Enrollment dropped successfully',
                        severity: 'success'
                    });
                } catch (error) {
                    setNotification({
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
                >
                    New Enrollment
                </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>Select Student</InputLabel>
                    <Select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        {students.map((student: any) => (
                            <MenuItem key={student.id} value={student.id}>
                                {student.indexNumber} - {student.firstName} {student.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {gpa !== null && selectedStudentId && (
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

            {selectedStudentId && (
                <>
                    {gpa !== null && (
                        <Typography variant="h6" gutterBottom>
                            Current GPA: {gpa.toFixed(2)}
                        </Typography>
                    )}
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEnrollOpen}
                        sx={{ mb: 2 }}
                    >
                        New Enrollment
                    </Button>

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
                                        <TableCell>{enrollment.grade || 'Not graded'}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleGradeOpen(enrollment)}>
                                                <GradeIcon />
                                            </IconButton>
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

            {/* Enroll Dialog */}
            <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)}>
                <DialogTitle>New Enrollment</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Course</InputLabel>
                        <Select
                            required
                            value={enrollFormData.courseId}
                            onChange={(e) => setEnrollFormData({
                                ...enrollFormData,
                                courseId: e.target.value,
                            })}
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
                <DialogActions>
                    <Button onClick={() => setEnrollOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleEnrollSubmit} 
                        color="primary"
                        disabled={!enrollFormData.courseId}
                    >
                        Enroll
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Grade Dialog */}
            <Dialog open={gradeOpen} onClose={() => setGradeOpen(false)}>
                <DialogTitle>Update Grade</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Grade</InputLabel>
                        <Select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                        >
                            {grades.map((g) => (
                                <MenuItem key={g} value={g}>
                                    {g.replace('_', ' ')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGradeOpen(false)}>Cancel</Button>
                    <Button onClick={handleGradeSubmit} color="primary">
                        Update Grade
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Component */}
            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            />

            {/* Confirmation Dialog */}
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
