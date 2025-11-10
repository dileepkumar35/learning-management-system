# Quick Start Guide

Get the LMS up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## 1. Clone the Repository

```bash
git clone https://github.com/dileepkumar35/learning-management-system.git
cd learning-management-system
```

## 2. Start the Application

### Option A: Production Mode

```bash
docker-compose up --build
```

### Option B: Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Wait for the services to start (this may take a few minutes on first run).

## 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 4. Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Register" 
3. Fill in the form:
   - Name: Your name
   - Email: your@email.com
   - Password: password123
   - Role: Choose "Instructor" to create courses, or "Student" to enroll

## 5. Try It Out

### As an Instructor:

1. After logging in, click "Create Course"
2. Fill in course details and click submit
3. Add modules to your course
4. Add lessons to modules
5. Create quizzes for lessons
6. Publish your course

### As a Student:

1. After logging in, browse available courses
2. Click on a course to view details
3. Click "Enroll in Course"
4. Access lessons from the course detail page
5. Complete lessons and take quizzes
6. View your progress on the dashboard

## 6. Stop the Application

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

## Testing the API

### Using curl:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }'

# Login (save the token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get all courses
curl http://localhost:5000/api/courses
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 27017 are already in use, you can:

1. Stop the conflicting service
2. Or modify the port mappings in `docker-compose.yml`

### MongoDB Connection Issues

If the backend can't connect to MongoDB:

1. Wait a few more seconds for MongoDB to fully start
2. Check logs: `docker-compose logs mongo`
3. Restart services: `docker-compose restart`

### Frontend Not Loading

1. Clear browser cache
2. Check if backend is running: http://localhost:5000/health
3. Check browser console for errors

### Can't Login

1. Make sure you're using the correct email/password
2. Check backend logs: `docker-compose logs backend`
3. Verify MongoDB is running: `docker-compose ps`

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Review [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute

## Need Help?

Open an issue on GitHub if you encounter any problems!

---

**Happy Learning! 📚**
