import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
    fetchStudentEnrollments,
    enrollStudent,
    gradeEnrollment,
    dropEnrollment,
    fetchStudentGPA,
} from './enrollmentSlice';
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
    TextField,
    IconButton,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Grade as GradeIcon } from '@mui/icons-material';
import { fetchStudents } from '../students/studentSlice';
import { fetchCourses } from '../courses/courseSlice';

const EnrollmentList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { enrollments, loading } = useSelector((state: RootState) => state.enrollments);
    const { students } = useSelector((state: RootState) => state.students);
    const { courses } = useSelector((state: RootState) => state.courses);

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
            dispatch(fetchStudentEnrollments(Number(selectedStudentId)));
            dispatch(fetchStudentGPA(Number(selectedStudentId)))
                .then((action: any) => {
                    if (action.payload) {
                        setGpa(action.payload.gpa);
                    }
                });
        }
    }, [dispatch, selectedStudentId]);

    const handleEnrollOpen = () => {
        setEnrollFormData({ studentId: '', courseId: '' });
        setEnrollOpen(true);
    };

    const handleGradeOpen = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setGrade(enrollment.grade || '');
        setGradeOpen(true);
    };

    const handleEnrollSubmit = async () => {
        await dispatch(enrollStudent({
            studentId: Number(enrollFormData.studentId),
            courseId: Number(enrollFormData.courseId),
        }));
        setEnrollOpen(false);
        if (selectedStudentId) {
            dispatch(fetchStudentEnrollments(Number(selectedStudentId)));
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

    const handleDrop = async (id: number) => {
        if (window.confirm('Are you sure you want to drop this enrollment?')) {
            await dispatch(dropEnrollment(id));
            if (selectedStudentId) {
                dispatch(fetchStudentEnrollments(Number(selectedStudentId)));
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Enrollments
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
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

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Course Code</TableCell>
                                    <TableCell>Course Title</TableCell>
                                    <TableCell>Credits</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Actions</TableCell>
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
                            value={enrollFormData.courseId}
                            onChange={(e) => setEnrollFormData({
                                ...enrollFormData,
                                courseId: e.target.value,
                            })}
                        >
                            {courses.map((course: any) => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEnrollOpen(false)}>Cancel</Button>
                    <Button onClick={handleEnrollSubmit} color="primary">
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
        </>
    );
};

export default EnrollmentList;
