import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Paper,
    useTheme,
} from '@mui/material';
import {
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const NavButton = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
        <Button
            component={RouterLink}
            to={to}
            color="inherit"
            sx={{
                mx: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: isActive(to) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
            }}
        >
            {icon}
            {label}
        </Button>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" elevation={0}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SchoolIcon sx={{ fontSize: 32 }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                            University Course Management
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        <NavButton to="/courses" icon={<MenuBookIcon />} label="Courses" />
                        <NavButton to="/students" icon={<PeopleIcon />} label="Students" />
                        <NavButton to="/enrollments" icon={<AssignmentIcon />} label="Enrollments" />
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: 1, p: 4, width: '100%' }}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        height: 'calc(100vh - 160px)', // Adjust height to fill available space
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {children}
                </Paper>
            </Box>
            <Box 
                component="footer" 
                sx={{ 
                    py: 3, 
                    px: 2, 
                    mt: 'auto',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" align="center">
                        © 2025 University Course Management System
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
