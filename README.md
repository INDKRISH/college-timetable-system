# College Timetable Management System (CTMS)

A comprehensive web-based timetable management system for colleges with role-based access for Admins, Teachers, and Students.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview statistics and quick actions
- **Timetable Management**: Generate clash-free timetables automatically
- **Teacher Management**: Add, edit, and manage teacher information
- **Course Management**: Manage courses and their assignments
- **Change Request Processing**: Review and approve/reject teacher requests
- **Reports**: Export and print timetables

### Teacher Features  
- **Personal Timetable**: View assigned teaching schedule
- **Change Requests**: Submit requests for schedule modifications
- **Request History**: Track status of submitted requests

### Student Features
- **Timetable Viewing**: View class schedules by branch, semester, and year
- **No Login Required**: Easy access for students
- **Print Friendly**: Easy printing of timetables

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: JWT tokens
- **Scheduling**: Custom algorithm (OR-Tools integration ready)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd college-timetable-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Database Setup

**Create Database:**
```sql
CREATE DATABASE college_timetable;
```

**Import Schema:**
```bash
mysql -u root -p college_timetable < database/init.sql
```

**Import Sample Data:**
```bash
mysql -u root -p college_timetable < database/sample_data.sql
```

### 4. Environment Configuration

Create `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_timetable
JWT_SECRET=your-super-secret-key-change-in-production
PORT=3000
```

### 5. Start the Application
```bash
# From backend directory
npm start

# For development with auto-restart
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 👤 Demo Credentials

### Admin Login
- **Username**: admin
- **Password**: admin123

### Teacher Login  
- **Username**: teacher1
- **Password**: pass123

### Student Access
- No login required
- Select Branch, Semester, and Year to view timetable

## 📁 Project Structure

```
college-timetable-system/
├── backend/
│   ├── app.js                 # Main application entry
│   ├── package.json
│   ├── config/
│   │   ├── database.js        # Database configuration
│   │   └── auth.js           # JWT configuration
│   ├── models/               # Database models (if using ORM)
│   ├── routes/               # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── admin.js          # Admin routes
│   │   ├── teacher.js        # Teacher routes
│   │   ├── student.js        # Student routes
│   │   └── timetable.js      # Timetable routes
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   └── utils/
│       ├── scheduler.js      # Timetable generation logic
│       └── validation.js     # Input validation
├── frontend/
│   └── public/
│       ├── login.html        # Login page
│       ├── admin.html        # Admin dashboard
│       ├── teacher.html      # Teacher dashboard
│       ├── student.html      # Student timetable view
│       ├── css/
│       │   └── styles.css    # Application styles
│       └── js/
│           ├── common.js     # Common utilities
│           ├── login.js      # Login functionality
│           ├── admin.js      # Admin dashboard logic
│           ├── teacher.js    # Teacher dashboard logic
│           └── student.js    # Student page logic
├── database/
│   ├── init.sql             # Database schema
│   └── sample_data.sql      # Sample data for demo
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/teachers` - Get all teachers
- `POST /api/admin/teachers` - Add new teacher
- `PUT /api/admin/teachers/:id` - Update teacher
- `DELETE /api/admin/teachers/:id` - Delete teacher
- `GET /api/admin/change-requests` - Get change requests
- `PUT /api/admin/change-requests/:id` - Process change request

### Teacher Routes
- `GET /api/teacher/timetable` - Get teacher's timetable
- `POST /api/teacher/change-request` - Submit change request
- `GET /api/teacher/change-requests` - Get teacher's requests

### Student Routes
- `GET /api/student/branches` - Get all branches
- `GET /api/student/timetable/:branch/:semester/:year` - Get timetable

### Timetable Routes
- `POST /api/timetable/generate` - Generate new timetable
- `GET /api/timetable` - Get timetable data

## 🎯 Scheduling Algorithm

The current implementation uses a simple greedy algorithm that:

1. **Enforces Hard Constraints**:
   - No teacher conflicts (one class per teacher per slot)
   - No room conflicts (one class per room per slot)  
   - No batch conflicts (one class per batch per slot)
   - Room capacity matches batch size
   - Respects teacher availability

2. **Optimizes Soft Constraints**:
   - Minimizes teacher gaps between classes
   - Distributes classes evenly across the week
   - Reduces room changes for teachers and batches

**Future Enhancement**: The system is designed to easily integrate Google OR-Tools CP-SAT solver for advanced constraint programming.

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. **Set Environment Variables**
2. **Build and Start**:
```bash
npm start
```

3. **Use Process Manager** (recommended):
```bash
npm install -g pm2
pm2 start app.js --name "ctms"
```

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Database Schema

Key tables include:
- **users**: Authentication data
- **teachers**: Teacher information  
- **courses**: Course details
- **batches**: Student groups/sections
- **rooms**: Classroom information
- **time_slots**: Available time periods
- **scheduled_classes**: Generated timetable
- **change_requests**: Teacher change requests

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing (bcrypt)
- Input validation and sanitization
- SQL injection protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues  
3. Create a new issue with detailed information

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - User authentication and role management
  - Basic timetable generation
  - CRUD operations for core entities
  - Change request system

## 🎯 Future Enhancements

- [ ] CSV import/export functionality
- [ ] Advanced constraint programming with OR-Tools
- [ ] Real-time notifications
- [ ] Mobile responsive improvements  
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-semester support
- [ ] Room booking system
- [ ] Integration with existing college systems

---

**Happy Scheduling! 📅✨**
