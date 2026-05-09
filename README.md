# 🛣️ RoadGuard Backend

**RoadGuard AI** is an AI-powered pothole detection and reporting system. This is the **backend API server** that powers the mobile and web applications.

## 📋 What This Backend Does

- ✅ **User Authentication** - Signup/Login with JWT tokens
- ✅ **Pothole Management** - Report, verify, and track pothole repairs
- ✅ **Real-Time Updates** - WebSocket integration for live map updates
- ✅ **Location Services** - Find potholes near specific coordinates
- ✅ **Analytics** - Track statistics and repair progress
- ✅ **File Upload** - Handle pothole images
- ✅ **Notifications** - Alert users about pothole updates

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/karthik7330/roadguard-backend.git
cd roadguard-backend
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Set Up PostgreSQL Database**

**Windows/Mac/Linux:**
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a new database:
   ```bash
   createdb roadguard_db
   ```

### **Step 4: Initialize Database Schema**
```bash
psql -U postgres -d roadguard_db -f src/config/schema.sql
```

### **Step 5: Configure Environment Variables**
1. Rename `.env.example` to `.env`
2. Update with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=roadguard_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=5000
   JWT_SECRET=your_secret_key
   ```

### **Step 6: Create Uploads Directory**
```bash
mkdir uploads
```

### **Step 7: Run the Server**
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

✅ Server will start at: **http://localhost:5000**

---

## 📡 API Endpoints

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify-token` | Verify JWT token |

**Example - Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "citizen"
  }'
```

**Example - Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### **Potholes**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/potholes/report` | Report new pothole (with image) |
| GET | `/api/potholes` | Get all potholes (with filters) |
| GET | `/api/potholes/:id` | Get specific pothole |
| PATCH | `/api/potholes/:id/status` | Update pothole status |
| GET | `/api/potholes/location/nearby` | Find potholes near coordinates |
| GET | `/api/potholes/stats/summary` | Get statistics |

**Example - Report Pothole:**
```bash
curl -X POST http://localhost:5000/api/potholes/report \
  -F "image=@pothole.jpg" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "severity=high" \
  -F "description=Large pothole on Main Street" \
  -F "address=Main Street, New York" \
  -F "city=New York" \
  -F "reporterId=1"
```

**Example - Get All Potholes:**
```bash
curl http://localhost:5000/api/potholes?city=New%20York&status=reported&limit=20
```

**Example - Update Status:**
```bash
curl -X PATCH http://localhost:5000/api/potholes/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "verifiedBy": 2,
    "comment": "Repair work started"
  }'
```

---

### **Users**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user profile |
| GET | `/api/users/:id/potholes` | Get user's reported potholes |
| GET | `/api/users/:id/notifications` | Get user notifications |

---

## 🔌 Real-Time WebSocket Events

WebSocket provides real-time updates to connected clients.

### **Client Events (Listening)**
```javascript
socket.on('pothole-reported', (data) => {
  console.log('New pothole reported:', data);
  // data: { id, latitude, longitude, severity, city, timestamp }
});

socket.on('pothole-updated', (data) => {
  console.log('Pothole status updated:', data);
  // data: { id, status, city, timestamp }
});
```

### **Server Events (Emitting)**
When a pothole is reported or updated, all connected clients receive real-time notifications.

---

## 📊 Database Schema

### **Users Table**
```sql
- id (Primary Key)
- email (Unique)
- password (Hashed)
- first_name, last_name
- phone
- user_type (citizen, authority, admin)
- profile_picture
- is_active
- created_at, updated_at
```

### **Potholes Table**
```sql
- id (Primary Key)
- reporter_id (Foreign Key → users)
- latitude, longitude
- severity (low, medium, high, critical)
- description
- image_url
- status (reported, verified, in_progress, repaired, rejected)
- address, city, state, pincode
- verified_by
- created_at, updated_at
```

---

## 🧪 Testing the API

### **Test Health Check**
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "RoadGuard Backend is running",
  "timestamp": "2026-05-09T10:30:00Z"
}
```

---

## 📦 Project Structure
```
roadguard-backend/
├── src/
│   ├── index.js                 # Main server entry point
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   └── schema.sql           # Database schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── potholes.js          # Pothole endpoints
│   │   └── users.js             # User endpoints
│   └── middleware/
│       └── auth.js              # JWT verification middleware
├── uploads/                      # Uploaded pothole images
├── package.json
├── .env                          # Environment variables
├── .gitignore
└── README.md
```

---

## 🔑 Important Notes

1. **JWT Token**: Required for protected endpoints. Include in header:
   ```
   Authorization: Bearer your_jwt_token_here
   ```

2. **Image Upload**: Maximum file size is 5MB. Only image files are accepted.

3. **CORS**: Currently allowing all origins. Update in production:
   ```javascript
   cors({ origin: 'https://yourdomain.com' })
   ```

4. **Database**: Uses PostgreSQL. Ensure it's running before starting the server.

---

## 🐛 Troubleshooting

### **Error: connect ECONNREFUSED 127.0.0.1:5432**
- PostgreSQL is not running. Start it:
  ```bash
  # macOS
  brew services start postgresql
  
  # Linux
  sudo systemctl start postgresql
  
  # Windows
  Start PostgreSQL from Services
  ```

### **Error: database "roadguard_db" does not exist**
- Create the database:
  ```bash
  createdb roadguard_db
  ```

### **Error: Module not found**
- Install dependencies:
  ```bash
  npm install
  ```

---

## 📚 Next Steps

1. ✅ Backend is ready
2. 🔜 **Next**: Set up Android Mobile App
3. 🔜 **Then**: Create Web Dashboard
4. 🔜 **Finally**: Integrate ML Model

---

## 📞 Support

For issues or questions, create an issue on GitHub: https://github.com/karthik7330/roadguard-backend/issues

---

## 📄 License

MIT License - Feel free to use this for learning and development!

---

**Happy Coding! 🚀**
