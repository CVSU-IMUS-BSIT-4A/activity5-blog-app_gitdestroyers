# Activity 5: Blog Platform

A full-stack blog platform built with React (Vite) and NestJS, featuring user authentication, post management, comments, likes, notifications, and edit history tracking.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Key Features](#key-features)
- [Development](#development)

## 🎯 Overview

This is a modern blog platform that allows users to:
- Create, read, update, and delete blog posts
- Comment on posts and interact with comments
- Like/dislike posts and comments
- Receive real-time notifications for interactions
- View edit history for posts and comments
- Manage user profiles with avatar uploads
- Switch between light and dark themes

The application consists of two main components:
- **Frontend**: React application built with Vite, TypeScript, and Tailwind CSS
- **Backend**: RESTful API built with NestJS, TypeORM, and SQLite

## Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 5.4.9** - Build tool and dev server
- **TypeScript 5.4.5** - Type safety
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **React Router DOM 6.27.0** - Client-side routing
- **Axios 1.12.2** - HTTP client
- **Radix UI** - Accessible component primitives
- **Sonner** - Toast notifications
- **next-themes** - Theme management

### Backend
- **NestJS 11.1.6** - Progressive Node.js framework
- **TypeORM 0.3.27** - Object-Relational Mapping
- **SQLite 5.1.7** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Swagger** - API documentation
- **Passport** - Authentication middleware

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected routes
- Password hashing with bcrypt

### Post Management
- Create, read, update, and delete posts
- Pagination support
- Post edit history tracking
- Author attribution

### Comments System
- Add, edit, and delete comments on posts
- Comment edit history tracking
- Nested comments display
- Author attribution

### Social Features
- Like/dislike posts
- Like/dislike comments
- Real-time like counts
- User interaction tracking

### Notifications
- Real-time notifications for:
  - New comments on your posts
  - Likes on your posts
  - Replies to your comments
- Unread notification count
- Mark as read/unread functionality
- Notification management

### User Profile
- User profile management
- Avatar upload and display
- Bio editing
- Profile settings
- Account deletion

### UI/UX Features
- Dark/light theme toggle
- Responsive design
- Toast notifications
- Loading states
- Error handling
- Form validation

## Project Structure

```
Activity5/
├── backend/
│   └── blog-api/
│       ├── src/
│       │   ├── auth/              # Authentication module
│       │   ├── users/             # User management
│       │   ├── posts/             # Post CRUD operations
│       │   ├── comments/          # Comment management
│       │   ├── likes/             # Like/dislike functionality
│       │   ├── notifications/     # Notification system
│       │   ├── entities/          # TypeORM entities
│       │   ├── config/            # Configuration files
│       │   ├── app.module.ts      # Main application module
│       │   └── main.ts            # Application entry point
│       ├── uploads/               # File uploads directory
│       ├── blog.db                # SQLite database
│       └── package.json
│
└── frontend/
    └── blog-ui/
        ├── src/
        │   ├── components/        # React components
        │   │   ├── ui/           # Reusable UI components
        │   │   ├── AuthPage.tsx  # Authentication page
        │   │   ├── PostsPage.tsx # Main feed page
        │   │   ├── Post.tsx      # Individual post view
        │   │   ├── Profile.tsx   # User profile page
        │   │   └── ...
        │   ├── hooks/            # Custom React hooks
        │   ├── lib/              # Utility functions
        │   ├── api.ts            # API client functions
        │   ├── App.tsx           # Main app component
        │   └── main.tsx          # Application entry point
        └── package.json
```

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Git** (for cloning the repository)

## Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd Activity5
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend/blog-api
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../../frontend/blog-ui
   npm install
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend/blog-api
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The backend server will start on **http://localhost:3005**

3. Access the API documentation:
   - Swagger UI: **http://localhost:3005/docs**

### Start the Frontend Application

1. Navigate to the frontend directory:
   ```bash
   cd frontend/blog-ui
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend application will start on **http://localhost:5184**

3. Open your browser and navigate to **http://localhost:5184**

### Build for Production

**Frontend:**
```bash
cd frontend/blog-ui
npm run build
npm run preview  # Preview the production build
```

**Backend:**
The backend runs in development mode. For production, you would typically use a process manager like PM2 or deploy to a cloud service.

## 📚 API Documentation

The API documentation is available via Swagger UI when the backend server is running:

**http://localhost:3005/docs**

### Main API Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

#### Posts
- `GET /posts` - Get all posts (with pagination)
- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post (requires authentication)
- `PATCH /posts/:id` - Update a post (requires authentication)
- `DELETE /posts/:id` - Delete a post (requires authentication)
- `GET /posts/:id/history` - Get edit history for a post

#### Comments
- `POST /comments` - Create a comment (requires authentication)
- `PATCH /comments/:id` - Update a comment (requires authentication)
- `DELETE /comments/:id` - Delete a comment (requires authentication)
- `GET /comments/:id/history` - Get edit history for a comment

#### Likes
- `POST /likes/toggle` - Toggle like/dislike on a post
- `GET /likes/post/:postId` - Get like counts for a post
- `GET /likes/post/:postId/user/:userId` - Get user's like status
- `POST /likes/comment/toggle` - Toggle like/dislike on a comment
- `GET /likes/comment/:commentId` - Get like counts for a comment

#### Users
- `GET /users/:id` - Get user information
- `PATCH /users/:id` - Update user information (requires authentication)
- `POST /users/:id/avatar` - Upload user avatar (requires authentication)
- `DELETE /users/:id` - Delete user account (requires authentication)

#### Notifications
- `GET /notifications` - Get user's notifications (requires authentication)
- `GET /notifications/unread-count` - Get unread notification count
- `POST /notifications/mark-all-read` - Mark all notifications as read
- `POST /notifications/:id/read` - Mark notification as read
- `POST /notifications/:id/unread` - Mark notification as unread
- `POST /notifications/:id/delete` - Delete a notification

### Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄 Database Schema

The application uses SQLite with TypeORM. Key entities include:

### User
- `id` - Primary key
- `email` - Unique email address
- `name` - User's name
- `password` - Hashed password
- `bio` - User biography (optional)
- `avatar` - Avatar file path (optional)
- `created_at` - Account creation timestamp

### Post
- `id` - Primary key
- `title` - Post title
- `content` - Post content
- `author` - Reference to User
- `created_at` - Post creation timestamp

### Comment
- `id` - Primary key
- `text` - Comment text
- `post` - Reference to Post
- `author` - Reference to User
- `created_at` - Comment creation timestamp

### Like
- `id` - Primary key
- `post` - Reference to Post
- `user` - Reference to User
- `isLike` - Boolean (true for like, false for dislike)

### CommentLike
- `id` - Primary key
- `comment` - Reference to Comment
- `user` - Reference to User
- `isLike` - Boolean (true for like, false for dislike)

### Notification
- `id` - Primary key
- `type` - Notification type
- `recipient` - Reference to User (who receives the notification)
- `actor` - Reference to User (who triggered the notification)
- `post` - Reference to Post (optional)
- `comment` - Reference to Comment (optional)
- `read` - Boolean (read/unread status)
- `created_at` - Notification creation timestamp

### PostHistory
- `id` - Primary key
- `postId` - Reference to Post
- `editorId` - Reference to User who made the edit
- `previousTitle` - Previous title
- `previousContent` - Previous content
- `newTitle` - New title
- `newContent` - New content
- `editedAt` - Edit timestamp

### CommentHistory
- `id` - Primary key
- `commentId` - Reference to Comment
- `editorId` - Reference to User who made the edit
- `previousContent` - Previous content
- `newContent` - New content
- `editedAt` - Edit timestamp

##  Key Features

### 1. Authentication System
- Secure user registration and login
- JWT tokens stored in localStorage
- Protected routes with authentication guards
- Password validation and hashing

### 2. Post Management
- Rich post creation with title and content
- Character limits (120 for title, 2000 for content)
- Post editing with history tracking
- Post deletion (author only)
- Pagination support

### 3. Comments System
- Add comments to posts
- Edit and delete comments (author only)
- Comment edit history
- Like/dislike comments

### 4. Social Interactions
- Like/dislike posts
- Like/dislike comments
- Real-time like count updates
- Visual feedback for user's like status

### 5. Notifications
- Real-time notification system
- Unread notification badge
- Notification types:
  - New comment on your post
  - Like on your post
  - Like on your comment
- Mark as read/unread functionality

### 6. Edit History
- Track all edits to posts and comments
- View complete edit history
- See who made changes and when
- Compare previous and new versions

### 7. User Profile
- Profile page with user information
- Avatar upload and display
- Bio editing
- Account settings
- Account deletion

### 8. Theme Support
- Light and dark mode
- Theme persistence across sessions
- Smooth theme transitions

## 💻 Development

### Frontend Development

The frontend uses:
- **Vite** for fast HMR (Hot Module Replacement)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Router** for navigation
- Custom hooks for state management

### Backend Development

The backend uses:
- **NestJS** modular architecture
- **TypeORM** for database operations
- **SQLite** for development database
- **Swagger** for API documentation
- **JWT** for authentication

### Environment Configuration

**Backend:**
- Port: `3005`
- Database: SQLite (`blog.db`)
- JWT Secret: Configured in auth module
- File uploads: `uploads/` directory

**Frontend:**
- Port: `5184`
- API Base URL: `http://localhost:3005`
- Token storage: `localStorage` (key: `a5_token`)

### Code Structure

- **Components**: React functional components with hooks
- **Hooks**: Custom React hooks for reusable logic
- **API Client**: Centralized API functions in `api.ts`
- **Entities**: TypeORM entities for database models
- **DTOs**: Data Transfer Objects for validation
- **Guards**: Authentication guards for protected routes

## Notes

- The SQLite database (`blog.db`) is created automatically on first run
- File uploads are stored in `backend/blog-api/uploads/`
- JWT tokens are stored in browser localStorage
- The application uses CORS for cross-origin requests
- All API endpoints include validation via class-validator

##  Troubleshooting

### Backend Issues
- Ensure port 3005 is not in use
- Check that SQLite database file is writable
- Verify all dependencies are installed

### Frontend Issues
- Ensure port 5184 is not in use
- Check that the backend server is running
- Verify API base URL matches backend port
- Clear browser localStorage if authentication issues occur

### Database Issues
- Delete `blog.db` to reset the database
- Ensure TypeORM synchronize is enabled for development


