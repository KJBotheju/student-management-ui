import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, Student, StudentState } from '../../store/store';
import {
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
} from './studentSlice';
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
    CircularProgress,
    Snackbar,
    Divider,
    InputAdornment,
    Chip,
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

const StudentList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { students, loading, currentPage, totalPages } = useSelector(
        (state: RootState) => state.students as StudentState
    );

    const [open, setOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Omit<Student, 'id'>>({
        indexNumber: '',
        firstName: '',
        lastName: '',
        email: '',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
    });

    useEffect(() => {
        dispatch(fetchStudents({ page: 0, size: 10 }));
    }, [dispatch]);

    const handleOpen = (student?: any) => {
        if (student) {
            setEditingStudent(student);
            setFormData(student);
        } else {
            setEditingStudent(null);
            setFormData({ indexNumber: '', firstName: '', lastName: '', email: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingStudent(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingStudent) {
                await dispatch(updateStudent({ id: editingStudent.id, student: { ...formData, id: editingStudent.id } }));
                setSnackbar({
                    open: true,
                    message: 'Student updated successfully!',
                    severity: 'success'
                });
            } else {
                await dispatch(createStudent(formData));
                setSnackbar({
                    open: true,
                    message: 'Student created successfully!',
                    severity: 'success'
                });
            }
            handleClose();
            dispatch(fetchStudents({ page: currentPage, size: 10 }));
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error saving student. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await dispatch(deleteStudent(id));
                setSnackbar({
                    open: true,
                    message: 'Student deleted successfully!',
                    severity: 'success'
                });
                dispatch(fetchStudents({ page: currentPage, size: 10 }));
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Error deleting student. Please try again.',
                    severity: 'error'
                });
            }
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(fetchStudents({ page: value - 1, size: 10 }));
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
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Students</Typography>
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
                    Add New Student
                </Button>
            </Box>

            {/* Table Container */}
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        borderRadius: 2,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Index Number</TableCell>
                                <TableCell sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>First Name</TableCell>
                                <TableCell sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Last Name</TableCell>
                                <TableCell sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ backgroundColor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box sx={{ py: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body1">No students found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student: Student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.indexNumber}</TableCell>
                                        <TableCell>{student.firstName}</TableCell>
                                        <TableCell>{student.lastName}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpen(student)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(student.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Pagination
                    count={totalPages}
                    page={currentPage + 1}
                    onChange={handlePageChange}
                    sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                />

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
                            <PersonIcon sx={{ fontSize: 28 }} />
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
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
                                label="Index Number"
                                fullWidth
                                value={formData.indexNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, indexNumber: e.target.value })
                                }
                                placeholder="e.g., ST001, 2021001"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BadgeIcon sx={{ color: '#2e7d32' }} />
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
                            
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <TextField
                                    label="First Name"
                                    fullWidth
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    placeholder="Enter first name"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: '#2e7d32' }} />
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
                                    label="Last Name"
                                    fullWidth
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastName: e.target.value })
                                    }
                                    placeholder="Enter last name"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: '#2e7d32' }} />
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
                            
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="student@university.edu"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#2e7d32' }} />
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
                            {editingStudent ? 'Update Student' : 'Create Student'}
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
            </Box>
        </Box>
    );
};

export default StudentList;
