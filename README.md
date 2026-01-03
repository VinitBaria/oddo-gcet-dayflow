# Dayflow HR

Dayflow HR is a comprehensive Human Resource Management System (HRMS) designed to streamline employee management, attendance tracking, and leave management. Built with modern web technologies, it offers a robust solution for tracking workforce activity and automating administrative tasks.

## 🚀 Features

### 👥 Employee Management
-   **Directory**: View and search all employees with filtering capabilities.
-   **Profiles**: Detailed employee profiles including personal info, bank details, salary info, and documents.
-   **Lifecycle**: Onboard new employees (auto-generate credentials) and manage their status (Present, Absent, On Leave).

### ⏱️ Attendance Tracking
-   **Persistent Timer**: Global check-in/check-out timer that follows users across the application.
-   **Daily Summaries**: Aggregated view of daily work hours, start/end times, and overtime.
-   **Detailed History**: Expandable daily records to view multiple check-in/out sessions per day.
-   **Status Automation**: Employee status automatically updates based on attendance activity.

### 📅 Time Off & Leave Management
-   **Leave Requests**: Employees can request paid, sick, or unpaid leave with attachments (e.g., medical certificates).
-   **Approval Workflow**: Admins can approve or reject requests. Approved leaves automatically update employee status.
-   **Balances**: real-time tracking of leave balances (Paid, Sick, Unpaid).
-   **Calendar**: Visual calendar view of team availability and upcoming leaves.

### ⚙️ & Security
-   **Role-Based Access**: Admin and Employee roles with specific permissions.
-   **Authentication**: Secure login/signup with JWT and bcrypt.
-   **Document Management**: Upload and secure storage for employee documents and certificates.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
-   **Authentication**: JSON Web Tokens (JWT)
-   **Email**: Nodemailer (for credential delivery)
-   **File Handling**: Multer (for document uploads)

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+ recommended)
-   MongoDB (Running locally or Atlas URI)

### 1. Backend Setup
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/dayflow-hr
    JWT_SECRET=your_super_secret_key_here
    
    # Email Config (Optional but recommended)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password
    ```
4.  (Optional) Seed the database with initial data:
    ```bash
    npm run seed
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

### 2. Frontend Setup
1.  Navigate to the project root (if not already there):
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:8080`.

## 📂 Project Structure

```
dayflow-hr/
├── src/                # Frontend Source
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context (Auth, HR data)
│   ├── pages/          # Application Pages
│   ├── lib/            # Utilities & API client
│   └── types/          # TypeScript interfaces
├── server/             # Backend Source
│   ├── models/         # Mongoose Models
│   ├── routes/         # API Routes
│   ├── utils/          # Helpers (Email, Upload, ID Gen)
│   └── uploads/        # Stored user files
└── public/             # Static assets
```

## 🤝 Contribution

1.  Clone the repository.
2.  Create a fresh branch for your feature.
3.  Commit your changes.
4.  Push to the branch and open a Pull Request.

---
Built with ❤️ using Lovable & Dayflow Team.
