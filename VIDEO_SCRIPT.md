# Dayflow HR - Complete Demo Script (Signup to End)

## **OPENING & SIGNUP (0:00 - 1:00)**

**[Screen: Browser opening to localhost:3000]**

"Hello! Today I'm going to show you Dayflow HR, a complete human resources management system. Let's start from the very beginning - setting up a new company account.

**[Navigate to signup page]**

Here's our signup page where a company administrator creates their account. I'll fill this out for a fictional company called 'TechFlow Solutions'.

**[Fill out form while speaking]**
- Company Name: 'TechFlow Solutions'
- First Name: 'Alex'
- Last Name: 'Manager' 
- Email: 'alex@techflow.com'
- Phone: '+1-555-0123'
- Password: [typing]
- Confirm Password: [typing]

Now I'll upload a company logo... **[upload a sample image]** Perfect! 

Notice how clean and professional this form is. When I click 'Sign Up'...

**[Click Sign Up, show loading state]**

The system is processing our registration. Behind the scenes, it's creating the admin account, generating a unique employee ID, and setting up the company profile.

**[Show success and redirect to login]**

Great! Registration successful. The system has automatically generated login credentials and sent them via email. Let's check the server console to see this in action.

**[Show server console with email logs]**

Perfect! You can see the welcome email was sent with the login credentials. The first user automatically becomes an admin with full system access."

---

## **ADMIN LOGIN & DASHBOARD (1:00 - 1:45)**

**[Screen: Login page]**

"Now let's log in with our admin credentials. I'll use the employee ID that was generated - notice we don't use email for login, but the unique employee ID for better security.

**[Login with generated credentials]**

And here we are! This is the admin dashboard - the command center for our HR operations.

**[Navigate around dashboard]**

Look at this clean, modern interface. We can see:
- Total employees: Currently just me as the admin
- Today's attendance statistics
- Leave requests pending approval
- Quick access to all major functions

The sidebar gives us access to everything we need: Employee Directory, Attendance tracking, Leave Management, and Settings. This dashboard updates in real-time, so as employees check in and out, or submit requests, everything updates automatically."

---

## **ADDING EMPLOYEES (1:45 - 2:45)**

**[Screen: Navigate to Employees]**

"Let's add our first employee. I'll click on 'Employees' in the sidebar, then 'Add Employee'.

**[Open employee dialog]**

Here's our employee creation form. This is where the magic happens - let me add a software engineer to our team.

**[Fill out form while explaining]**
- First Name: 'Sarah'
- Last Name: 'Johnson'
- Email: 'sarah@techflow.com'
- Phone: '+1-555-0124'
- Job Title: 'Senior Software Engineer'
- Department: 'Engineering' - notice we have 12 pre-configured departments
- Role: 'Employee' - this defaults to employee, not admin
- Join Date: Today's date

**[Submit form]**

When I click 'Add Employee', watch what happens...

**[Show loading, then success]**

Excellent! The system has automatically:
- Generated a unique employee ID for Sarah
- Created a secure random password
- Sent her login credentials via email
- Set up her leave balances with 15 paid days, 10 sick days
- Added her to our employee directory

**[Show server console]**

Look at the server logs - you can see Sarah's employee ID was generated as 'TESA20250001' and her credentials were emailed successfully. This is completely automated - no manual work required!"

---

## **EMPLOYEE EXPERIENCE (2:45 - 3:30)**

**[Screen: Logout and login as employee]**

"Now let's see what Sarah experiences. I'll log out and log in using her credentials.

**[Login with Sarah's employee ID and password]**

Perfect! Notice how different Sarah's dashboard looks compared to the admin view. As an employee, she sees:
- Her personal attendance status
- Her leave balances clearly displayed
- Quick check-in and check-out buttons
- Her recent attendance history

She doesn't have access to other employees' data or admin functions - the system enforces proper role-based security.

**[Demonstrate check-in]**

Let me show you the attendance feature. When Sarah clicks 'Check In'...

**[Click check-in]**

Boom! The system records her check-in time, updates her status to 'Present', and starts tracking her work hours. This timestamp is precise and tamper-proof."

---

## **LEAVE REQUEST WORKFLOW (3:30 - 4:15)**

**[Screen: Navigate to Time Off]**

"Now let's see the leave management system. Sarah wants to request some time off for a vacation.

**[Navigate to leave request form]**

Here's the leave request interface. Sarah can see her current balances and submit new requests.

**[Fill out leave request]**
- Leave Type: 'Paid Leave'
- Start Date: Next Monday
- End Date: Next Friday  
- Reason: 'Family vacation'

**[Submit request]**

Request submitted! Now let's switch back to the admin view to see the approval process.

**[Logout and login as admin]**

Back in the admin dashboard, I can see there's now 1 pending leave request. Let me go to the Leave Management section.

**[Navigate to leave management]**

Here's Sarah's request. As an admin, I can see all the details and either approve or reject it. I'll approve this request.

**[Click approve]**

Approved! The system automatically:
- Deducted 5 days from Sarah's paid leave balance
- Updated her status for those dates
- Sent her an email notification
- Updated all relevant reports

This entire workflow is seamless and automated."

---

## **SYSTEM CONFIGURATION (4:15 - 4:45)**

**[Screen: Navigate to Settings]**

"Let's look at the system configuration options. In the Settings section, administrators can customize everything to match their company policies.

**[Show different settings sections]**

We can configure:
- Company information and branding
- Working hours - currently set to 8 hours per day
- Overtime policies with 1.5x multiplier
- Default leave allocations for new employees
- Department management - add or remove departments as needed
- Email notification preferences

**[Show department management]**

For example, if we need to add a new department like 'Data Science', I can simply add it here, and it becomes available immediately for new employees.

**[Add new department]**

There we go! The system is completely flexible and adapts to any company's needs."

---

## **ATTENDANCE REPORTING (4:45 - 5:15)**

**[Screen: Navigate to Attendance]**

"Finally, let's look at the attendance tracking and reporting capabilities.

**[Show attendance overview]**

The attendance module provides comprehensive insights:
- Real-time attendance status for all employees
- Detailed work hour calculations
- Overtime tracking and reporting
- Historical attendance data
- Export capabilities for payroll integration

**[Show individual employee record]**

For each employee, we can see their complete attendance history, total hours worked, and any overtime earned. This data is crucial for payroll processing and performance management.

The system also handles different time zones, break times, and complex scheduling scenarios that modern companies need."

---

## **CONCLUSION (5:15 - 5:30)**

**[Screen: Return to dashboard overview]**

"And that's Dayflow HR in action! We've seen the complete employee lifecycle - from company setup and automated employee onboarding, to daily attendance tracking, comprehensive leave management, and flexible system configuration.

Key highlights:
- Automated employee ID generation and credential management
- Role-based security with admin and employee views
- Real-time attendance tracking with precise timestamps
- Complete leave workflow with automatic balance management
- Flexible configuration to match any company's policies
- Professional email notifications throughout the system

This system eliminates manual HR processes, reduces errors, and provides the insights modern companies need to manage their workforce effectively.

Thank you for watching this demonstration of Dayflow HR!"

---

## **PREPARATION CHECKLIST:**

### **Before Recording:**
1. **Clear Database:**
   ```bash
   cd dayflow-hr/server
   npm run seed
   ```

2. **Start Both Servers:**
   ```bash
   # Terminal 1
   cd dayflow-hr/server && npm run dev
   
   # Terminal 2  
   cd dayflow-hr && npm run dev
   ```

3. **Prepare Sample Logo:** Have a small company logo image ready to upload

4. **Browser Setup:** Clean Chrome browser, no extensions visible, good zoom level

### **Demo Data:**
- **Company:** TechFlow Solutions
- **Admin:** Alex Manager, alex@techflow.com
- **Employee:** Sarah Johnson, sarah@techflow.com, Senior Software Engineer
- **Department:** Engineering
- **Leave Request:** 5 days paid leave for family vacation

### **Key Points to Emphasize:**
- Automated processes (ID generation, email sending)
- Role-based security differences
- Real-time updates and notifications
- Professional UI/UX design
- Complete workflow automation
- System flexibility and configuration options