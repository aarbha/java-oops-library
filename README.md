

# Library Management System

A web-based college library app: it keeps a catalog of books across genres (Coding, Mathematics, English Literature, Science, General), registers members as students or faculty, and handles issue/return of books with quota limits (2 books for students, 5 for faculty). The frontend is a React single-page app, the backend is a Core Java HTTP server (no frameworks) that talks to a MySQL database over JDBC, and borrow records store the time of issue and time of return.

**Live demo:** https://java-oops-library.vercel.app

**GitHub:** https://github.com/aarbha/java-oops-library

> The deployed demo serves the frontend only and falls back to built-in sample data ("local demo mode"). Running the full app with live MySQL persistence requires the local backend — see below.



## Run Locally

**Prerequisites:** Node.js, JDK, MySQL

1. Create the database: import `java-project/database.sql` into MySQL (creates `library_db` with tables, views and seed data).
2. Install dependencies:
   `npm install`
3. Start the backend (from `java-project/`, MySQL must be running):
   `run.bat`
4. Start the frontend:
   `npm run dev`
5. Open http://localhost:3000 (the API runs at http://localhost:8080).

