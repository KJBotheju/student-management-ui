import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
} from '@mui/material';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        University Course Management
                    </Typography>
                    <Button color="inherit" component={RouterLink} to="/courses">
                        Courses
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/students">
                        Students
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/enrollments">
                        Enrollments
                    </Button>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            </Container>
        </>
    );
};

export default Layout;
