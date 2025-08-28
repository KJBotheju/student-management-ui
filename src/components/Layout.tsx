import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Paper,
    useTheme,
    Menu,
    MenuItem,
    IconButton,
    Avatar,
} from '@mui/material';
import {
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    AccountCircle,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store/store';
import { logout } from '../features/auth/authSlice';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isActive = (path: string) => location.pathname === path;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
    };

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
                        <SchoolIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                            University Course Management
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NavButton to="/courses" icon={<MenuBookIcon />} label="Courses" />
                        <NavButton to="/students" icon={<PeopleIcon />} label="Students" />
                        <NavButton to="/enrollments" icon={<AssignmentIcon />} label="Enrollments" />
                        
                        {/* User Menu */}
                        <Box sx={{ ml: 2 }}>
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <AccountCircle sx={{ fontSize: 32 }} />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        minWidth: 200,
                                    }
                                }}
                            >
                                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Welcome
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {user?.username || 'User'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user?.role || 'Role'}
                                    </Typography>
                                </Box>
                                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                                    <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box 
                component="main"
                sx={{ 
                    flex: 1,
                    p: 4,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}
            >
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {children}
                    </Box>
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
