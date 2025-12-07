# 📁 ShareX

### **Role-Based & Link-Based Secure File Sharing**

This project provides a secure platform for authenticated users to
upload, view, share, and download files with **strong access control**
It supports:

## 🚀 Features

- 🔐 **JWT Authentication**
- 📤 **File Upload with Validation**
- 👥 **Share With Users**
- 🔗 **Share via Link**
- 🚫 **Restrict Specific Users**
- 🌐 **Anyone With The Link (Public Link)**
- 📅 **Expiring Links**
- 💾 **Session-based Login Persistence**
- ⚡ **React + Node.js + Express + MongoDB Stack**
- 👁️ **View Files**
- 🧾 **Audit Logs (Track Access & Actions)**
- 🗑️ **Delete Files**


## 🚀 Features

### ✔ **Secure Authentication**

-   Login using JWT\
-   Token stored in sessionStorage

### ✔ **File Upload**

-   Validate file type + size\
-   Only logged-in users can upload

### ✔ **Share With Specific Users**

Owner can allow selected users to access or download the file.

### ✔ **Share via Link**

Owner can create a shareable link with: - Allowed users - Restricted
users - Anyone with the link - Expiration time


# 📦 Installation

```bash
# Clone the repository
git clone https://github.com/itsmohitnamdeo/ShareX.git

## Backend Setup

    cd backend
    npm install

Create `.env`:

    MONGO_URI=mongodb://localhost:27017/securefiles
    JWT_SECRET=your_jwt_secret
    BASE_URL=http://localhost:3000
    PORT=5000

Start backend:

    npm run dev

## Frontend Setup

    cd frontend
    npm install

Create `.env`:

    REACT_APP_API_BASE=http://localhost:4000/api

Start frontend:

    npm start

------------------------------------------------------------------------

# 📁 Important Backend Endpoints

### Auth

`POST /api/auth/login`

### Files

`POST /api/files/upload`\
`GET /api/files`\
`GET /api/files/:id/download`

### Share With Users

`POST /api/files/:id/share`

### Create Share Link

`POST /api/files/:id/link`\
`GET /api/files/link/:token`


------------------------------------------------------------------------

# 🧪 Example Link Workflow

Allowed: userA, userB\
Restricted: userC\
Public: true

  User    Access   Reason
  ------- -------- -------------
  userA   ✔        Allowed
  userB   ✔        Allowed
  userC   ❌       Restricted


------------------------------------------------------------------------

# 🛡 Security Highlights

-   Strong backend enforcement\
-   No direct file access\
-   Expiring tokens\
-   Prevents unauthorized downloads

------------------------------------------------------------------------

# 🏁 Conclusion

This system replicates Google Drive--like secure sharing with: ✔ Strong
access rules\
✔ User + Link permissions\
✔ Secure backend\
✔ Clean frontend UI

------------------------------------------------------------------------

## images



------------------------------------------------------------------------

## Contact

If you have any questions, suggestions, or need assistance related to the MicroTools, feel free to reach out to Me.

- MailId - namdeomohit198@gmail.com
- Mob No. - 9131552292
- Portfolio : https://itsmohitnamdeo.github.io
- Linkedin : https://www.linkedin.com/in/mohit-namdeo