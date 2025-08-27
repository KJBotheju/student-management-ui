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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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
        if (editingStudent) {
            await dispatch(updateStudent({ id: editingStudent.id, student: { ...formData, id: editingStudent.id } }));
        } else {
            await dispatch(createStudent(formData));
        }
        handleClose();
        dispatch(fetchStudents({ page: currentPage, size: 10 }));
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await dispatch(deleteStudent(id));
            dispatch(fetchStudents({ page: currentPage, size: 10 }));
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        dispatch(fetchStudents({ page: value - 1, size: 10 }));
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
                    sx={{ backgroundColor: '#2e7d32' }}
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

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>
                        {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Index Number"
                            fullWidth
                            value={formData.indexNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, indexNumber: e.target.value })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="First Name"
                            fullWidth
                            value={formData.firstName}
                            onChange={(e) =>
                                setFormData({ ...formData, firstName: e.target.value })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="Last Name"
                            fullWidth
                            value={formData.lastName}
                            onChange={(e) =>
                                setFormData({ ...formData, lastName: e.target.value })
                            }
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} color="primary">
                            {editingStudent ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default StudentList;
