# College Department Website

A responsive and dynamic web application built for the **Computer Science and Engineering Department** at P.V.P. Institute of Technology.  
The website provides department details, faculty information, student resources, notices, and more in an organized and user-friendly interface.

---

## 🚀 Features
- Responsive design for desktop and mobile
- Faculty and staff profiles
- Notices and announcements
- Gallery and events section
- Contact form for inquiries
- Secure authentication system (if applicable)

---

## 📂 Project Structure
src/
├── models/ # Database models (User, etc.)
├── routes/ # Express route handlers
├── public/ # Static assets (CSS, JS, images)
├── uploads/ # Uploaded files
├── views/ # EJS templates / frontend views
└── server.js # Main server file

yaml
Copy code

---

## ⚙️ Installation

1. **Clone the repository**

   git clone https://github.com/your-username/college-dept-website.git
   cd college-dept-website
Install dependencies


npm install
Install nodemon globally (if not already installed)


npm install -g nodemon
Or add it as a dev dependency:



npm install --save-dev nodemon
Set up environment variables
Create a .env file in the root directory and add:

env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY="AIzaSyBwoJs5ghP1eoBz1YTbrWQrdH-E5amnmZo"


🖥️ Usage Guide
Start the server with Nodemon
nodemon src/server.js
This will automatically restart the server whenever you make changes to your code.


Visit in browser
http://localhost:5000


🛠️ Built With
Node.js & Express.js – Backend framework


MongoDB – Database

EJS / HTML, CSS, JS – Frontend

Bootstrap / Tailwind (if used) – Styling

Nodemon – Development server auto-restart
