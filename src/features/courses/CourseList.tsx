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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CourseList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { courses, loading, currentPage, totalPages } = useSelector(
        (state: RootState) => state.courses
    );

    const [open, setOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [formData, setFormData] = useState({
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
            await dispatch(updateCourse({ id: editingCourse.id, course: formData }));
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
            <Typography variant="h4" gutterBottom>
                Courses
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add New Course
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Credits</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
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
            <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />

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
