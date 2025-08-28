# Authentication Features Added

## Overview
JWT-based authentication has been implemented with the following features:

### Authentication Components
1. **Login Page** (`/login`)
   - Username and password login
   - Remember token in localStorage
   - Redirect to dashboard after successful login
   - Show validation errors

2. **Signup Page** (`/signup`)
   - Register with username, email, password
   - Select role (Student, Instructor, Admin)
   - Password confirmation
   - Success message and redirect to login

3. **Protected Routes**
   - All main application routes require authentication
   - Automatic redirect to login if not authenticated
   - JWT token stored in localStorage

4. **User Menu**
   - User info display in header
   - Logout functionality
   - Role-based information

### Features Implemented
- ✅ JWT token authentication
- ✅ Protected routes
- ✅ Automatic token refresh handling
- ✅ User session management
- ✅ Role-based access control ready
- ✅ Responsive login/signup forms
- ✅ Error handling and validation
- ✅ Logout functionality

### API Integration
- Login endpoint: `POST /api/auth/login`
- Signup endpoint: `POST /api/auth/signup`
- Logout endpoint: `POST /api/auth/logout`
- JWT token automatically added to all API requests
- 401 errors automatically redirect to login

### How to Use
1. Start the application
2. You'll be redirected to `/login` if not authenticated
3. Sign up for a new account or use existing credentials
4. After login, you'll have access to all protected routes
5. User menu in top-right corner shows user info and logout

### Default Test Accounts
You can create accounts through the signup form with these roles:
- **Student**: Access to courses and enrollments
- **Instructor**: Access to courses, students, and enrollments
- **Admin**: Full access to all features

### Security Features
- Passwords hidden with show/hide toggle
- JWT tokens automatically expire handling
- Secure token storage in localStorage
- Automatic logout on token expiration
- CORS and request validation

The authentication system is now fully integrated with your existing course management features!
