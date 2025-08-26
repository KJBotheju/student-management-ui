import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const StudentList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { students, loading, currentPage, totalPages } = useSelector(
        (state: RootState) => state.students
    );

    const [open, setOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [formData, setFormData] = useState({
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
            await dispatch(updateStudent({ id: editingStudent.id, student: formData }));
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

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Students
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add New Student
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Index Number</TableCell>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
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
        </>
    );
};

export default StudentList;
