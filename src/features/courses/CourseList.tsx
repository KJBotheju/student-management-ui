import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
} from './courseSlice';

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
    Pagination,
    Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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

const CourseList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { courses, loading, currentPage, totalPages } = useSelector(
        (state: RootState) => state.courses as CourseState
    );

    const [open, setOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState<Omit<Course, 'id'>>({
        code: '',
        title: '',
        credits: 3,
        capacity: 50,
    });

    useEffect(() => {
        dispatch(fetchCourses({ page: 0, size: 10 }));
    }, [dispatch]);

    const handleOpen = (course?: any) => {
        if (course) {
            setEditingCourse(course);
            setFormData(course);
        } else {
            setEditingCourse(null);
            setFormData({ code: '', title: '', credits: 3, capacity: 50 });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCourse(null);
    };

    const handleSubmit = async () => {
        if (editingCourse) {
            await dispatch(updateCourse({ id: editingCourse.id, course: { ...formData, id: editingCourse.id } }));
        } else {
            await dispatch(createCourse(formData));
        }
        handleClose();
        dispatch(fetchCourses({ page: currentPage, size: 10 }));
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            await dispatch(deleteCourse(id));
            dispatch(fetchCourses({ page: currentPage, size: 10 }));
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(fetchCourses({ page: value - 1, size: 10 }));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Courses
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen()}
                    sx={{ backgroundColor: '#2e7d32' }}
                >
                    Add New Course
                </Button>
            </Box>
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
                        <TableRow sx={{ backgroundColor: '#2e7d32' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credits</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Capacity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course: Course) => (
                            <TableRow key={course.id}>
                                <TableCell>{course.code}</TableCell>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell>{course.capacity}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(course)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(course.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={totalPages}
                    page={currentPage + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{ 
                        '& .MuiPaginationItem-root': {
                            color: '#2e7d32',
                            '&.Mui-selected': {
                                backgroundColor: '#2e7d32',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#1b5e20',
                                },
                            },
                        },
                    }}
                />
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Code"
                        fullWidth
                        value={formData.code}
                        onChange={(e) =>
                            setFormData({ ...formData, code: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Credits"
                        type="number"
                        fullWidth
                        value={formData.credits}
                        onChange={(e) =>
                            setFormData({ ...formData, credits: Number(e.target.value) })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Capacity"
                        type="number"
                        fullWidth
                        value={formData.capacity}
                        onChange={(e) =>
                            setFormData({ ...formData, capacity: Number(e.target.value) })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">
                        {editingCourse ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CourseList;
