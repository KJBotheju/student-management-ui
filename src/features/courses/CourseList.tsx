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
    Divider,
    InputAdornment,
    Chip,
    Snackbar,
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Add as AddIcon,
    School as SchoolIcon,
    Numbers as NumbersIcon,
    Groups as GroupsIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/ConfirmDialog';

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
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });
    const [formData, setFormData] = useState<Omit<Course, 'id'>>({
        code: '',
        title: '',
        credits: 2,
        capacity: 50,
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
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
            setFormData({ code: '', title: '', credits: 2, capacity: 50 });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCourse(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingCourse) {
                await dispatch(updateCourse({ id: editingCourse.id, course: { ...formData, id: editingCourse.id } }));
                setSnackbar({
                    open: true,
                    message: 'Course updated successfully!',
                    severity: 'success'
                });
            } else {
                await dispatch(createCourse(formData));
                setSnackbar({
                    open: true,
                    message: 'Course created successfully!',
                    severity: 'success'
                });
            }
            handleClose();
            dispatch(fetchCourses({ page: currentPage, size: 10 }));
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error saving course. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course?',
            onConfirm: async () => {
                try {
                    await dispatch(deleteCourse(id));
                    setSnackbar({
                        open: true,
                        message: 'Course deleted successfully!',
                        severity: 'success'
                    });
                    dispatch(fetchCourses({ page: currentPage, size: 10 }));
                } catch (error) {
                    setSnackbar({
                        open: true,
                        message: 'Error deleting course. Please try again.',
                        severity: 'error'
                    });
                }
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(fetchCourses({ page: value - 1, size: 10 }));
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            gap: 2
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                    Courses
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpen()}
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
                    disabled={loading}
                >
                    Add New Course
                </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        overflow: 'auto'
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Loading courses...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No courses found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course: Course) => (
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
                        )))}
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

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                scroll="paper"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
                        overflow: 'visible',
                        minHeight: '60vh',
                        maxHeight: '90vh',
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
                            {editingCourse ? 'Edit Course' : 'Add New Course'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
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
                <DialogContent 
                    sx={{ 
                        pt: 4, 
                        pb: 2,
                        px: 4,
                        minHeight: '400px',
                        overflow: 'auto',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 4 }}>
                        <TextField
                            label="Course Code"
                            fullWidth
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({ ...formData, code: e.target.value })
                            }
                            placeholder="e.g., AINT 44052, CSCI 44092"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Chip 
                                            label="CODE" 
                                            size="small" 
                                            sx={{ 
                                                backgroundColor: '#e8f5e8',
                                                color: '#2e7d32',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                height: '24px',
                                                marginTop: '8px',
                                                '& .MuiChip-label': {
                                                    paddingX: '8px',
                                                }
                                            }} 
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '56px',
                                    '&:hover fieldset': {
                                        borderColor: '#2e7d32',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2e7d32',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2e7d32',
                                },
                                '& .MuiInputAdornment-root': {
                                    alignItems: 'center',
                                    marginTop: '0px !important',
                                }
                            }}
                        />
                        
                        <TextField
                            label="Course Title"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Enter the full course title"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SchoolIcon sx={{ color: '#2e7d32', mt: -1 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#2e7d32',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#2e7d32',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#2e7d32',
                                },
                            }}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <TextField
                                label="Credits"
                                type="number"
                                fullWidth
                                value={formData.credits}
                                onChange={(e) =>
                                    setFormData({ ...formData, credits: Number(e.target.value) })
                                }
                                placeholder="e.g., 2"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <NumbersIcon sx={{ color: '#2e7d32' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '56px',
                                        '&:hover fieldset': {
                                            borderColor: '#2e7d32',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#2e7d32',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2e7d32',
                                    },
                                }}
                            />
                            <TextField
                                label="Capacity"
                                type="number"
                                fullWidth
                                value={formData.capacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacity: Number(e.target.value) })
                                }
                                placeholder="e.g., 50"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <GroupsIcon sx={{ color: '#2e7d32' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        height: '56px',
                                        '&:hover fieldset': {
                                            borderColor: '#2e7d32',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#2e7d32',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2e7d32',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 4, gap: 3, justifyContent: 'center', backgroundColor: '#fafafa' }}>
                    <Button 
                        onClick={handleClose}
                        variant="outlined"
                        size="large"
                        sx={{
                            color: '#666',
                            borderColor: '#ddd',
                            '&:hover': {
                                borderColor: '#999',
                                backgroundColor: '#f5f5f5',
                            },
                            borderRadius: 2,
                            px: 6,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            minWidth: '120px',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        size="large"
                        sx={{
                            background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                            },
                            borderRadius: 2,
                            px: 6,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                            minWidth: '140px',
                        }}
                    >
                        {editingCourse ? 'Update Course' : 'Create Course'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    marginTop: '80px',
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbar.severity === 'success' ? '#2e7d32' : '#d32f2f',
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
                open={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
            </Box>
        </Box>
    );
};

export default CourseList;
