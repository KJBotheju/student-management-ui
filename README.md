# University Course Management System - Frontend

A modern React-based frontend application for managing university courses, students, and enrollments. Built with TypeScript, Material-UI, and Redux Toolkit.

## 🚀 Features

- **Role-Based Access Control**: Different interfaces for Students, Instructors, and Administrators
- **Course Management**: Create, view, update, and delete courses (Admin/Instructor only)
- **Student Management**: Manage student records and information (Admin/Instructor only)
- **Enrollment System**: Handle course enrollments and grading
- **Authentication**: Secure login/signup with JWT tokens
- **Responsive Design**: Mobile-friendly interface with Material-UI components
- **Real-time Updates**: Dynamic data updates with Redux state management

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Build Tool**: Create React App

### User Roles
- **Student**: View own enrollments, drop courses, view grades
- **Instructor**: Manage courses, grade students, view all enrollments
- **Admin**: Full system access, manage users, courses, and students

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 8080

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd student-management-ui

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

#### `npm test`
Launches the test runner in interactive watch mode

#### `npm run build`
Builds the app for production to the `build` folder

#### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App configuration

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and run the entire application stack
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the application
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: http://localhost:5432

### Build Docker Image Only

```bash
# Build the Docker image
docker build -t student-management-ui .

# Run the container
docker run -p 3000:80 student-management-ui
```

### Docker Configuration

The application uses a multi-stage Docker build:
1. **Build Stage**: Uses Node.js to build the React application
2. **Production Stage**: Uses Nginx to serve the built application

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_APP_NAME=University Course Management
```

### API Configuration

Update the API base URL in `src/services/api.ts` if needed:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```
### Role-Based Features

| Feature | Student | Instructor | Admin |
|---------|---------|------------|-------|
| View Own Enrollments | ✅ | ✅ | ✅ |
| Drop Own Courses | ✅ | ✅ | ✅ |
| View All Students | ❌ | ✅ | ✅ |
| Manage Courses | ❌ | ✅ | ✅ |
| Grade Students | ❌ | ✅ | ✅ |
| Enroll Students | ❌ | ✅ | ✅ |

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Serve with a static server
npx serve -s build
```

### Docker Production Deployment

```bash
# Build production image
docker build -t student-management-ui:prod .

# Run with environment variables
docker run -p 80:80 \
  -e REACT_APP_API_BASE_URL=https://your-api-domain.com/api \
  student-management-ui:prod
```

### Docker Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check container logs
docker-compose logs student-management-ui
```

## 📝 API Endpoints

The frontend connects to the following backend endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/courses` - Fetch courses
- `GET /api/students` - Fetch students
- `GET /api/enrollments/by-student/{id}` - Student enrollments
- `POST /api/enrollments/enroll` - Enroll student
- `DELETE /api/enrollments/{id}` - Drop enrollment