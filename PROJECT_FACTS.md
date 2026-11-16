# PROJECT_FACTS.md

Project: Library Management System (Java OOPs Library Management System Lab)
Database course: CSC2131 (DBMS Lab)
Authors: Abhibhava Singhal (2502502153), Aaryan Bhatia (2502052128)
Guide: Dr Gyanendra Kumar, Manipal University Jaipur
Generated from the actual code in `C:\Users\aar_b\OneDrive\Desktop\OOPS`.

Every fact below was verified by reading source files or running commands against the live system. Items that do not exist are marked `NOT PRESENT`.

---

## A. PROJECT IDENTITY

### 1. Project name / title and description

App title shown in the UI navbar: **Library Management System** (`src/App.tsx`).
Page `<title>` in `index.html:6`: `Java OOPs Library Management System Lab`.
`metadata.json` name: `Java OOPs Library Management System Lab`.

Description: A web-based library circulation system. It maintains a multi-genre book catalog (Coding, Mathematics, English Literature, Science, General), registers members as STUDENT (borrow limit 2) or FACULTY (borrow limit 5), and handles issue/return transactions with timestamps. Data persists in a MySQL database. The frontend is a React single-page app; the backend is a Core Java HTTP server using plain JDBC. There is no framework (no Spring, no Servlets, no ORM).

### 2. Domain / problem and main features

Domain: academic institution library circulation and catalog management.

Main features found in code (`src/App.tsx` + `ApiHandler.java`):
- Multi-genre book catalog: list, search/filter by title/author/genre, add, delete.
- Member registration: name + phone + type (STUDENT/FACULTY), delete.
- Issue a book to a member with quota enforcement (Student=2, Faculty=5).
- Return a book, updating record status and book availability.
- Borrow records view with issue time and return time (or null while issued).
- Status badges: Available / Borrowed.
- Sign-in dialog that stores a display name in browser `localStorage` (no real authentication).

### 3. Tech stack

- Languages: Java (backend), TypeScript + React (frontend), SQL (MySQL).
- Frontend framework: React 19.0.1 + Vite 8.3.0 + Tailwind CSS 4.3.3 (`@tailwindcss/vite`), lucide-react icons.
- Backend: Core Java, `com.sun.net.httpserver.HttpServer` (built-in, port 8080), plain JDBC.
- Database: MySQL 8.0.46, InnoDB, utf8mb4.
- DB driver: `mysql-connector-j-8.3.0.jar` (MySQL Connector/J 8.3.0), class `com.mysql.cj.jdbc.Driver`.
- No build tool for Java (plain `javac`); Node/npm for frontend.

### 4. Application type and how front end talks to database

Web app (browser-based SPA). The React frontend never connects to MySQL directly. It calls REST endpoints under `/api` (Vite proxy forwards to `http://localhost:8080`), which `ApiHandler.java` handles by opening JDBC connections to MySQL. In "local demo mode" (backend unreachable), the frontend falls back to in-memory React state.

---

## B. SYSTEM REQUIREMENTS

### 5. Exact versions

| Item | Value | Source |
|---|---|---|
| OS | Microsoft Windows 11 Home Single Language, 64-bit, version 10.0.26200 | `Get-CimInstance Win32_OperatingSystem` |
| JDK | Java 24.0.2 (Java SE Runtime Environment build 24.0.2+12-54, HotSpot 64-Bit Server VM) | `java -version` |
| Node.js | v24.11.1 | `node -v` |
| npm | 11.6.2 | `npm -v` |
| MySQL server | 8.0.46 | `SELECT VERSION();` |
| MySQL connector/driver | mysql-connector-j-8.3.0 (8.3.0) | jar filename `java-project/mysql-connector-j-8.3.0.jar` |
| DB client tools installed | MySQL Workbench 8.0, MySQL Shell 8.0 | `C:\Program Files\MySQL` listing |
| Browser | NOT DETECTABLE from project | — |
| IDE/editor | NOT PRESENT (no `.vscode`, `.idea`, or Eclipse project files found) | glob over project root |

### 6. External dependencies

`package.json` (root) — dependencies:
```json
{
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jszip": "^3.4.1",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.28.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  }
}
```

Java side has no build file (no pom.xml / build.gradle). The only external jar is `java-project/mysql-connector-j-8.3.0.jar` (2,495,536 bytes).

Note: `express`, `dotenv`, `@google/genai`, `jszip`, `motion` are listed in `package.json` but are not imported anywhere in `src/` (unused dependencies).

### 7. Hardware

- CPU: AMD Ryzen AI 7 350 w/ Radeon 860M, 8 cores / 16 logical processors.
- RAM: 15.1 GB total physical.
- Disk: C: drive 474.5 GB total, 233.1 GB free.
- Minimum requirements: not documented in the project; the report claims "Memory footprint remains under 45 MB during runtime" (unverified — no measurement was taken in this session).

---

## C. DATABASE DESIGN

### 8. Database name and storage engine

Database: `library_db`. Storage engine: **InnoDB** for all tables. Collation: `utf8mb4_0900_ai_ci`. (From `information_schema.TABLES` query and `SHOW CREATE TABLE` output.)

### 9. Complete DDL

`database.sql` (verbatim):

```sql
-- ========================================================
-- DATABASE SCRIPT FOR COLLEGE LIBRARY MANAGEMENT SYSTEM
-- Course: Object-Oriented Programming (OOP) Lab
-- Database: MySQL
-- ========================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- 1. Books Table (Supports Multiple Genres: English Literature, Mathematics, Coding, Science)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre VARCHAR(50) DEFAULT 'General',
    is_available BOOLEAN DEFAULT TRUE
);

-- 2. Members Table (Supports Student and Faculty Member Classifications)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    member_type VARCHAR(20) DEFAULT 'STUDENT'
);

-- 3. Issue Records Table with Time of Issue and Time of Return
CREATE TABLE IF NOT EXISTS issue_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    issue_time VARCHAR(40) NOT NULL,
    return_time VARCHAR(40) DEFAULT '-',
    status VARCHAR(20) DEFAULT 'ISSUED',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Seed Books across multiple academic genres
INSERT INTO books (title, author, genre, is_available) VALUES 
('Introduction to Java Programming', 'Daniel Liang', 'Coding', TRUE),
('Head First Java', 'Kathy Sierra', 'Coding', FALSE),
('Clean Code: A Handbook of Agile Craftsmanship', 'Robert C. Martin', 'Coding', TRUE),
('Data Structures and Algorithms in Java', 'Robert Lafore', 'Coding', TRUE),
('Higher Engineering Mathematics', 'Dr. B. S. Grewal', 'Mathematics', TRUE),
('Discrete Mathematics & Its Applications', 'Kenneth H. Rosen', 'Mathematics', FALSE),
('Linear Algebra Done Right', 'Sheldon Axler', 'Mathematics', TRUE),
('The Great Gatsby', 'F. Scott Fitzgerald', 'English Literature', FALSE),
('The Catcher in the Rye', 'J. D. Salinger', 'English Literature', FALSE),
('To Kill a Mockingbird', 'Harper Lee', 'English Literature', TRUE),
('Pride and Prejudice', 'Jane Austen', 'English Literature', TRUE),
('University Physics with Modern Physics', 'Hugh D. Young', 'Science', TRUE),
('Concepts of Physics', 'Dr. H. C. Verma', 'Science', TRUE),
('The Lean Startup', 'Eric Ries', 'Coding', FALSE);

-- Seed Members
INSERT INTO members (name, phone, member_type) VALUES 
('Rahul Sharma', '9876543210', 'STUDENT'),
('Priya Verma', '9123456780', 'STUDENT'),
('Dr. S. K. Gupta', '9811223344', 'FACULTY'),
('Ananya Deshmukh', '9820011223', 'STUDENT');

-- Seed Borrow Records with Time of Issue and Time of Return
INSERT INTO issue_records (book_id, member_id, issue_time, return_time, status) VALUES 
(2, 1, '2026-10-20 09:30 AM', '-', 'ISSUED'),
(6, 2, '2026-10-20 11:15 AM', '-', 'ISSUED'),
(8, 3, '2026-10-20 02:45 PM', '-', 'ISSUED'),
(9, 4, '2026-10-21 08:00 AM', '-', 'ISSUED'),
(14, 1, '2026-10-21 10:20 AM', '-', 'ISSUED');
```

Views added to `database.sql` (verbatim):

```sql
-- 4. View: JOINs all three tables so the Java backend can just SELECT * FROM borrow_overview
CREATE OR REPLACE VIEW borrow_overview AS
SELECT ir.id,
       ir.book_id,
       b.title,
       ir.member_id,
       m.name,
       m.member_type,
       ir.issue_time,
       ir.return_time,
       ir.status
FROM issue_records ir
JOIN books b   ON ir.book_id   = b.id
JOIN members m ON ir.member_id = m.id;

-- 5. View: Member borrowing summary (how many books each member currently holds)
CREATE OR REPLACE VIEW member_summary AS
SELECT m.id,
       m.name,
       m.phone,
       m.member_type,
       COUNT(ir.id) AS total_borrowed,
       SUM(CASE WHEN ir.status = 'ISSUED' THEN 1 ELSE 0 END) AS active_holds
FROM members m
LEFT JOIN issue_records ir ON ir.member_id = m.id
GROUP BY m.id, m.name, m.phone, m.member_type;
```

`SHOW CREATE TABLE` outputs (from live MySQL, verbatim):

```text
CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `author` varchar(100) NOT NULL,
  `genre` varchar(50) DEFAULT 'General',
  `is_available` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

```text
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `member_type` varchar(20) DEFAULT 'STUDENT',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

```text
CREATE TABLE `issue_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `member_id` int NOT NULL,
  `issue_time` varchar(40) NOT NULL,
  `return_time` varchar(40) DEFAULT '-',
  `status` varchar(20) DEFAULT 'ISSUED',
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `issue_records_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `issue_records_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

No indexes, triggers, stored procedures, functions, or CHECK constraints exist (verified via `information_schema` and `SHOW CREATE`).

### 10. Table/column reference

**books**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT, NOT NULL | Book id |
| title | VARCHAR(150) | NOT NULL | Book title |
| author | VARCHAR(100) | NOT NULL | Author name |
| genre | VARCHAR(50) | DEFAULT 'General' | Genre (Coding, Mathematics, English Literature, Science, General) |
| is_available | TINYINT(1) (BOOLEAN) | DEFAULT 1 (TRUE) | Availability flag |

**members**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT, NOT NULL | Member id |
| name | VARCHAR(100) | NOT NULL | Member name |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| member_type | VARCHAR(20) | DEFAULT 'STUDENT' | STUDENT or FACULTY |

**issue_records**
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT, NOT NULL | Record id |
| book_id | INT | NOT NULL, FK -> books(id) | Issued book |
| member_id | INT | NOT NULL, FK -> members(id) | Borrower |
| issue_time | VARCHAR(40) | NOT NULL | Issue timestamp (string, format `yyyy-MM-dd hh:mm a`) |
| return_time | VARCHAR(40) | DEFAULT '-' | Return timestamp or '-' sentinel |
| status | VARCHAR(20) | DEFAULT 'ISSUED' | ISSUED or RETURNED |

### 11. Foreign keys and referential actions

- `issue_records.book_id` -> `books.id`: `ON DELETE CASCADE`, `ON UPDATE` not specified (defaults to RESTRICT/NO ACTION).
- `issue_records.member_id` -> `members.id`: `ON DELETE CASCADE`, `ON UPDATE` not specified (defaults to RESTRICT/NO ACTION).

### 12. Relationships and cardinality

- books 1:N issue_records (one book can appear in many issue records over time; at any moment a book is either available or issued).
- members 1:N issue_records (one member can borrow many books).
- No M:N junction/associative table. `issue_records` is a transaction/child table, not a pure junction (it carries issue_time, return_time, status).
- Participation: issue_records.book_id and issue_records.member_id are NOT NULL (mandatory). books and members can exist with zero issue_records (optional participation, demonstrated by LEFT JOIN in `member_summary`).

### 13. Functional dependencies and normal form

**books**: FD: id -> title, author, genre, is_available. PK is `id` (single attribute). All non-key attributes depend on the whole key. **3NF / BCNF.** Deliberate denormalisation: `is_available` is derived from issue_records status but stored for fast reads.

**members**: FD: id -> name, phone, member_type. PK `id`. **3NF / BCNF.** (member_type is a plain VARCHAR with no separate lookup table — a minor 3NF consideration, but no transitive dependency on a non-key attribute.)

**issue_records**: FD: id -> book_id, member_id, issue_time, return_time, status. PK `id`. **3NF / BCNF.** Deliberate denormalisation: `status` and `return_time` are mutable state derived from events; stored for query speed. `issue_time`/`return_time` are VARCHAR(40) strings, not temporal types (a design limitation).

No partial or transitive dependencies exist; all tables are in 1NF (atomic columns, no repeating groups), 2NF, 3NF, and BCNF.

### 14. Row counts

| Table | Count | Source |
|---|---|---|
| books | 14 | `SELECT COUNT(*)` |
| members | 4 | `SELECT COUNT(*)` |
| issue_records | 7 | `SELECT COUNT(*)` (5 seed + 2 from earlier live test round-trips) |

### 15. ER diagram

NOT PRESENT — no diagram file/image exists in the project. Only two images exist: `public/assets/aistudio/desktop_85bf147a.webp` (banner) and `public/assets/aistudio/Screenshot_2026-10-22_221211_c19b6c0f.png` (a screenshot of a report template, not an ER diagram).

Entity/attribute/relationship list for drawing one:
- Entity **Book**: id (PK), title, author, genre, is_available.
- Entity **Member**: id (PK), name, phone, member_type.
- Entity **IssueRecord**: id (PK), book_id (FK), member_id (FK), issue_time, return_time, status.
- Relationship Book 1:N IssueRecord (ON DELETE CASCADE).
- Relationship Member 1:N IssueRecord (ON DELETE CASCADE).

---

## D. SQL OPERATIONS

### 16. Seed data and current table contents

Seed INSERT statements are in `database.sql` lines 40-69 (verbatim, see section 9 above).

Current `books` (14 rows):
```text
id  title                                              author                  genre               is_available
1   Introduction to Java Programming                   Daniel Liang            Coding              1
2   Head First Java                                    Kathy Sierra            Coding              0
3   Clean Code: A Handbook of Agile Craftsmanship      Robert C. Martin        Coding              1
4   Data Structures and Algorithms in Java             Robert Lafore           Coding              1
5   Higher Engineering Mathematics                     Dr. B. S. Grewal        Mathematics         1
6   Discrete Mathematics & Its Applications           Kenneth H. Rosen        Mathematics         0
7   Linear Algebra Done Right                          Sheldon Axler           Mathematics         1
8   The Great Gatsby                                   F. Scott Fitzgerald     English Literature  0
9   The Catcher in the Rye                             J. D. Salinger          English Literature  0
10  To Kill a Mockingbird                              Harper Lee              English Literature  1
11  Pride and Prejudice                                Jane Austen             English Literature  1
12  University Physics with Modern Physics              Hugh D. Young           Science             1
13  Concepts of Physics                                Dr. H. C. Verma         Science             1
14  The Lean Startup                                   Eric Ries               Coding              0
```

Current `members` (4 rows):
```text
id  name                phone        member_type
1   Rahul Sharma        9876543210   STUDENT
2   Priya Verma         9123456780   STUDENT
3   Dr. S. K. Gupta     9811223344   FACULTY
4   Ananya Deshmukh     9820011223   STUDENT
```

Current `issue_records` (7 rows):
```text
id  book_id  member_id  issue_time            return_time           status
1   2        1          2026-10-20 09:30 AM   -                     ISSUED
2   6        2          2026-10-20 11:15 AM  -                     ISSUED
3   8        3          2026-10-20 02:45 PM  -                     ISSUED
4   9        4          2026-10-21 08:00 AM  -                     ISSUED
5   14       1          2026-10-21 10:20 AM  -                     ISSUED
6   3        2          2026-10-25 01:57 pm  2026-10-25 02:01 pm  RETURNED
7   3        4          2026-10-25 07:38 pm  2026-10-25 07:38 pm  RETURNED
```

### 17. Every UPDATE the app performs

In `ApiHandler.java`:
- `handleIssue` (~line 336): `UPDATE books SET is_available = FALSE WHERE id = ?` (marks book unavailable on issue).
- `handleReturn` (~line 383): `UPDATE issue_records SET return_time = ?, status = 'RETURNED' WHERE id = ?` (stamps return).
- `handleReturn` (~line 389): `UPDATE books SET is_available = TRUE WHERE id = ?` (restores availability on return).

All use `PreparedStatement` with `?` placeholders.

### 18. Every DELETE the app performs

In `ApiHandler.java`:
- `handleBooks` (DELETE branch): `DELETE FROM books WHERE id = ?` (cascades to `issue_records` via FK).
- `handleMembers` (DELETE branch): `DELETE FROM members WHERE id = ?` (cascades to `issue_records` via FK).

No other DELETEs. Cascade tables: `issue_records` (both FKs have `ON DELETE CASCADE`).

### 19. Every SELECT the app uses

In `ApiHandler.java`:
- `handleBooks` GET: `SELECT id, title, author, genre, is_available FROM books ORDER BY id DESC`
- `handleMembers` GET: `SELECT id, name, phone, member_type FROM members ORDER BY id ASC`
- `handleRecords` GET: `SELECT id, book_id, title, member_id, name, member_type, issue_time, return_time, status FROM borrow_overview ORDER BY id DESC` (view = INNER JOIN of all 3 tables)
- `handleIssue`: `SELECT title, is_available FROM books WHERE id = ?`
- `handleIssue`: `SELECT name, member_type FROM members WHERE id = ?`
- `handleIssue`: `SELECT COUNT(*) FROM issue_records WHERE member_id = ? AND status = 'ISSUED'`
- `handleIssue` INSERT: `INSERT INTO issue_records (...) VALUES (?,?,?,'-','ISSUED')`
- `handleReturn`: `SELECT book_id, title, member_id, name, member_type, status FROM borrow_overview WHERE id = ?`

Aggregate `COUNT`/`SUM`/`GROUP BY` exist only inside the `member_summary` view (defined in SQL, not called by Java). Subqueries, HAVING, LIKE: **NOT PRESENT** (search/filter is client-side in `App.tsx`).

### 20. Transaction logic

NOT PRESENT. Grep for `setAutoCommit`, `commit(`, `rollback`, `START TRANSACTION`, `ROLLBACK` in `java-project` returned zero matches. `handleIssue` and `handleReturn` each perform two separate auto-committed writes (INSERT/UPDATE issue_records + UPDATE books). If the second statement fails, data can be left inconsistent.

### 21. Constraint-violation tests (run against live DB, all inside `START TRANSACTION ... ROLLBACK`)

Test 1 — duplicate primary key:
```sql
START TRANSACTION;
INSERT INTO library_db.books (id, title, author, genre, is_available) VALUES (1, 'Dup Book', 'Dup Author', 'Coding', TRUE);
ROLLBACK;
```
Result: `ERROR 1062 (23000) at line 2: Duplicate entry '1' for key 'books.PRIMARY'`

Test 2 — foreign key violation (non-existent book_id):
```sql
START TRANSACTION;
INSERT INTO library_db.issue_records (book_id, member_id, issue_time, return_time, status) VALUES (9999, 1, '2026-10-25 08:00 AM', '-', 'ISSUED');
ROLLBACK;
```
Result: `ERROR 1452 (23000) at line 2: Cannot add or update a child row: a foreign key constraint fails (library_db.issue_records, CONSTRAINT issue_records_ibfk_1 FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE)`

Test 3 — invalid member_type value (no CHECK constraint exists):
```sql
START TRANSACTION;
INSERT INTO library_db.members (name, phone, member_type) VALUES ('Test Alien', '9999999999', 'ALIEN');
ROLLBACK;
```
Result: no error — the row was accepted because there is **no CHECK constraint or ENUM** on `member_type`. Row count remained 4 after ROLLBACK (verified). This is a real limitation: invalid member types can be stored.

### 22. Cascade delete demonstration (transaction + ROLLBACK)

```sql
START TRANSACTION;
SELECT COUNT(*) AS before_records FROM library_db.issue_records;   -- 7
SELECT COUNT(*) AS before_books   FROM library_db.books;            -- 14
DELETE FROM library_db.books WHERE id = 2;
SELECT COUNT(*) AS after_delete_books    FROM library_db.books;     -- 13
SELECT COUNT(*) AS after_delete_records  FROM library_db.issue_records; -- 6 (record id=1 for book 2 removed)
ROLLBACK;
SELECT COUNT(*) AS after_rollback_books    FROM library_db.books;   -- 14 (restored)
SELECT COUNT(*) AS after_rollback_records  FROM library_db.issue_records; -- 7 (restored)
```
Conclusion: deleting a book cascades to `issue_records` (one record removed), and ROLLBACK fully restored both tables.

### 23. Business logic computed in code

Quota enforcement in `ApiHandler.handleIssue` (~lines 300-322): `quota = "FACULTY".equalsIgnoreCase(memberType) ? 5 : 2`; active count = `SELECT COUNT(*) FROM issue_records WHERE member_id = ? AND status = 'ISSUED'`; if `current >= quota` → HTTP 409 "Quota reached: limit is N books".

Frontend `App.tsx`: `getMemberBorrowLimit(type)` returns 5 for FACULTY else 2; `getActiveIssuedCountForMember(memberId)` filters records; used for UI pre-checks and the "X / Y Borrowed" badge. Timestamps generated by `Main.getCurrentTimestamp()` using `SimpleDateFormat("yyyy-MM-dd hh:mm a")`.

No billing, fines, discounts, or date arithmetic exist. No overdue logic.

---

## E. APPLICATION / FRONT END

### 24. Project folder tree (excluding node_modules, dist, .git)

```text
OOPS/
├── .gitignore
├── .vercel/                  (Vercel deploy config + README)
├── .vercel.zip
├── index.html                (SPA entry point, title + fonts)
├── metadata.json             (AI Studio app metadata)
├── package.json              (npm scripts + deps)
├── package-lock.json
├── PROJECT_REPORT.md         (lab report template, 179 lines)
├── README.md                 (AI Studio run/deploy instructions)
├── tsconfig.json
├── vite.config.ts            (Vite + /api proxy to :8080)
├── public/
│   └── assets/aistudio/
│       ├── desktop_85bf147a.webp   (banner image)
│       └── Screenshot_2026-10-22_221211_c19b6c0f.png (report template screenshot)
├── src/
│   ├── main.tsx              (React root render)
│   ├── App.tsx               (entire UI + API client, 1275 lines)
│   └── index.css
└── java-project/
    ├── database.sql           (DDL + seeds + views)
    ├── DBConnection.java      (JDBC connection helper)
    ├── Main.java              (HttpServer bootstrap, port 8080)
    ├── ApiHandler.java        (routing + all DB operations, ~451 lines)
    ├── Json.java              (hand-rolled JSON helpers)
    ├── Book.java              (entity + Searchable, overloads) — unused by API
    ├── Person.java            (Person/Member/StudentMember/FacultyMember) — unused by API
    ├── IssueRecord.java       (entity) — unused by API
    ├── README.md              (lab README)
    ├── run.bat / run.sh       (compile+run scripts)
    ├── VIVA_QUESTIONS.md      (viva Q&A)
    ├── mysql-connector-j-8.3.0.jar
    ├── server.log / server.err (runtime logs)
    └── *.class                (compiled output)
```

### 25. Architecture and layers

- UI layer: `src/App.tsx` (React components, forms, tables, modals).
- API client layer: `apiGet`/`apiSend` fetch helpers in `App.tsx` (lines ~99-114).
- Transport: Vite dev proxy `/api` → `http://localhost:8080` (`vite.config.ts:20-23`).
- Controller layer: `Main.java` (creates `HttpServer`, binds `/api` context) + `ApiHandler.java` (routing + request handling).
- Data access: inline JDBC in `ApiHandler` (no separate DAO class) via `DBConnection.getConnection()`.
- Database: MySQL `library_db`.

Note: `Book.java`, `Person.java`, `IssueRecord.java` define entity classes with OOP features but are **not used** by `ApiHandler` (which builds JSON directly from `ResultSet`). They exist for the lab/viva demonstration.

### 26. Database connection code

`DBConnection.java` (verbatim relevant lines):

```java
private static final String URL = System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true");
private static final String USERNAME = System.getenv().getOrDefault("DB_USERNAME", "root");
private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "password");
```

Driver load: `Class.forName("com.mysql.cj.jdbc.Driver")`. Credentials are read from environment variables `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`, with defaults. No `.env` file exists in the project (`.env*` is gitignored). Real password redacted: `********`.

### 27. Data-access layer

There is no separate DAO class; all SQL is inline in `ApiHandler.java` methods (`handleBooks`, `handleMembers`, `handleRecords`, `handleIssue`, `handleReturn`). Every dynamic value uses `PreparedStatement` with `?` placeholders. No string-concatenated SQL was found (grep for `executeQuery(`/`executeUpdate(` with non-literal args returned only literal fragments + `?` placeholders).

Representative method — `handleIssue` (issue flow, ~lines 290-348) is shown in section 19/20. Representative read — `handleRecords`:

```java
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(
        "SELECT id, book_id, title, member_id, name, member_type, issue_time, return_time, status " +
        "FROM borrow_overview ORDER BY id DESC");
```

### 28. API routes

Base: `http://localhost:8080`. All routes mounted under `/api`.

| Method | Path | Purpose | DB effect | Success response |
|---|---|---|---|---|
| GET | /api/books | List books (newest first) | SELECT books | 200 JSON array |
| POST | /api/books | Add a book | INSERT books | 201 JSON book object |
| DELETE | /api/books/{id} | Delete a book | DELETE books (cascade records) | 204 No Content |
| GET | /api/members | List members | SELECT members | 200 JSON array |
| POST | /api/members | Register member | INSERT members | 201 JSON member object |
| DELETE | /api/members/{id} | Delete member | DELETE members (cascade records) | 204 No Content |
| GET | /api/records | List borrow records | SELECT borrow_overview | 200 JSON array |
| POST | /api/issue | Issue a book | INSERT issue_records + UPDATE books | 201 JSON record |
| POST | /api/return | Return a book | UPDATE issue_records + UPDATE books | 200 JSON record |

Error status codes returned: 400 (bad input), 404 (not found), 405 (method not allowed), 409 (conflict: unavailable book / quota reached / already returned), 500 (server error), 503 (database unavailable). CORS: `Access-Control-Allow-Origin: *`, OPTIONS preflight handled.

Request/response JSON example (issue):
Request: `{"bookId":3,"memberId":4}`
Response: `{"id":7,"bookId":3,"bookTitle":"Clean Code: A Handbook of Agile Craftsmanship","memberId":4,"memberName":"Ananya Deshmukh","memberType":"STUDENT","issueTime":"2026-10-25 07:38 pm","returnTime":null,"status":"ISSUED"}`

### 29. Front-end

`src/App.tsx` (1275 lines) — single component `App`. Three tabs: Books, Active Members, Issue/Return. Five modals: Add Book, Register Member, Issue Book, Confirm Return, Sign In. Layout: Tailwind utility classes, slate colour scheme (slate-900 primary, slate-50 backgrounds, slate-200 borders), `rounded-[4px]` (minimal rounding), responsive `sm:/md:` breakpoints, max-width `max-w-6xl` container. Icons from `lucide-react`. Status badges: "Available" with check icon / "Borrowed" with clock icon.

### 30. Input validation and error handling

Client side (`App.tsx`): required HTML attributes on form inputs; quota pre-check before issuing; `getActiveIssuedCountForMember` checks. Server side (`ApiHandler`): null/empty checks on title/author/name/phone; id parsing via `parseIntSafe`; quota re-check on server; 409 on conflicts. Errors surfaced as toast notifications (`notify`). Backend errors logged via `e.printStackTrace()` to stderr; HTTP 500/503 returned to client.

### 31. Security features present and absent

Present: parameterised queries (PreparedStatement) everywhere; CORS headers; server-side quota enforcement; DB errors not leaked in 500 responses (generic message).

Absent: no authentication/authorisation (Sign In only stores a display name in `localStorage`); no password hashing; no role-based access control; no input sanitising beyond trim; no HTTPS; no CSRF protection; CORS is `*` (permissive); no rate limiting.

### 32. CLI/console menu

NOT PRESENT. The backend is an HTTP server, not a CLI. The only console output is the startup banner (section 34).

### 33. Other notable implementation details

- `HttpServer.setExecutor(null)` → uses the default executor.
- No connection pooling; each request calls `DBConnection.getConnection()` (new `DriverManager` connection) and closes it in `finally`.
- No logging framework; uses `System.out.println` and `e.printStackTrace()`.
- Config: no config files; ports/credentials are hardcoded defaults overridable via env vars (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).
- Frontend has a "local demo mode" fallback (in-memory state) when the backend is unreachable.
- `run.bat` references a `lib\*` classpath entry that does not exist (harmless on Windows).

---

## F. RESULTS AND SCREENSHOTS

### 34. Build and run commands + startup output

MySQL (must be running first):
```
net start MySQL80
```

Backend (from `java-project/`):
```
javac -cp ".;mysql-connector-j-8.3.0.jar" *.java
java -cp ".;mysql-connector-j-8.3.0.jar" Main
```
Or run `run.bat`.

Frontend (from project root):
```
npm install
npm run dev
```
(Vite on port 3000, proxy /api → :8080.)

Startup output (from `server.log`, verbatim):
```text
==================================================
 College Library Management System (OOPs Lab)
 JSON API server running at: http://localhost:8080
 Persistence mode: MySQL
==================================================
```
Then open `http://localhost:3000`.

### 35. Workflow walkthroughs (from code)

- Add book: Books tab → "Add Book" → fill Title/Author/Genre → Save → POST /api/books → book appears at top of list; persisted in MySQL.
- Register member: Active Members tab → "Register Member" → name/phone/type → Register → POST /api/members.
- Issue book: Issue/Return tab (or "Issue" on a book row) → select book + member → Confirm Issue → POST /api/issue → record created, book marked unavailable; toast "Issued at <timestamp>".
- Return book: Issue/Return tab or member card → "Return" → confirm → POST /api/return → record marked RETURNED, book available; toast "Returned at <timestamp>".
- Delete book/member: trash icon → DELETE endpoint → cascades to issue_records.
- Search/filter: client-side by genre buttons + title/author text inputs (no backend search).

### 36. Screenshots to take

App side:
1. Books tab with full catalog and availability badges.
2. Books tab with genre filter + search active.
3. Add Book modal filled in.
4. Active Members tab showing member cards with "X / Y Borrowed".
5. Register Member modal.
6. Issue/Return tab with issue form + return list.
7. Confirm Return modal.
8. Sign In modal.

DB side (MySQL Workbench):
9. Schema navigator showing `library_db` with tables books, members, issue_records and views.
10. `books` table data grid.
11. `members` table data grid.
12. `issue_records` table data grid.
13. `borrow_overview` view result.
14. `SHOW CREATE TABLE` output for each table.
15. Constraint violation error (duplicate PK / FK) — capture the error dialog.
16. Cascade delete before/after.

### 37. Existing images in project

- `public/assets/aistudio/desktop_85bf147a.webp` (banner, used in app header)
- `public/assets/aistudio/Screenshot_2026-10-22_221211_c19b6c0f.png` (screenshot of a report template — not an ER diagram)
- Same two files copied into `dist/assets/aistudio/` after build.

---

## G. TESTING, LIMITATIONS, FUTURE WORK

### 38. Existing tests

NOT PRESENT. No test files, no test framework. `package.json` scripts: `dev`, `build`, `preview`, `clean`, `lint` (which runs `tsc --noEmit`). No JUnit/TestNG on Java side.

### 39. Known limitations, bugs, TODOs

Grep for `TODO|FIXME|HACK|XXX` in `src/` and `java-project/` returned no matches.

Limitations identified from code:
- Timestamps stored as VARCHAR(40) strings, not DATETIME (no date arithmetic possible).
- No transactions (issue/return are two separate auto-committed statements).
- No UNIQUE constraints (duplicate phone/name possible) and no CHECK constraints (invalid member_type accepted — see test 3).
- `member_summary` view exists but is never queried by the application.
- `Book.java`, `Person.java`, `IssueRecord.java` entity classes are not used by the API (dead code).
- Frontend "local demo mode" duplicates seed data in React state; diverges from DB if backend is offline.
- `run.bat` references a non-existent `lib\*` classpath entry.
- Unused npm dependencies: `express`, `dotenv`, `@google/genai`, `jszip`, `motion`.
- `package.json` name is `react-example` (not the project title).
- Report template claims memory under 45 MB and other figures that were not measured.

### 40. Missing features / future enhancements (from project report + code)

- Barcode/RFID scanning integration.
- Overdue email/SMS alerts (ScheduledExecutorService + JavaMail).
- Multi-branch inter-library loan.
- Digital e-book/PDF catalog entries.
- Authentication/roles, password hashing.
- Proper date types, transactions, UNIQUE/CHECK constraints.
- Unit/integration test suite.
- Connection pooling.

---

## H. CONSISTENCY CHECKS

### 41. AUTO_INCREMENT

Yes — all three tables have `AUTO_INCREMENT` on their PK (`id`), confirmed by `SHOW CREATE TABLE` output (e.g. `` `id` int NOT NULL AUTO_INCREMENT ``). `books` currently at AUTO_INCREMENT=15, `members`=5, `issue_records`=8.

### 42. IF NOT EXISTS

Yes — `database.sql` uses `CREATE DATABASE IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS` for all three tables, and `CREATE OR REPLACE VIEW`. Verified in the file.

### 43. Column names in docs vs DDL

Yes — the entity descriptions in `PROJECT_REPORT.md` (`id, title, author, genre, is_available` / `id, name, phone, member_type` / `id, book_id, member_id, issue_time, return_time, status`) match the DDL exactly.

### 44. Join/aggregate/subquery claims

- INNER JOIN: **yes** — `borrow_overview` view joins all 3 tables; used by `handleRecords` and `handleReturn`.
- Aggregates (COUNT/SUM/GROUP BY): **yes but only in the unused `member_summary` view** — not called by the app.
- Subqueries: **NOT PRESENT**.
- HAVING: **NOT PRESENT**.
- LIKE/search: **NOT PRESENT in SQL** — search/filter is client-side JavaScript in `App.tsx`.

### 45. HTTP verbs/routes in docs vs code

Mismatch found. `PROJECT_REPORT.md:115` states handlers process `/books`, `/members`, `/issue-return` and "render server-authoritative HTML templates". Actual routes are `/api/books`, `/api/members`, `/api/records`, `/api/issue`, `/api/return` returning JSON. Also `java-project/README.md` claims "5 Java files" and "Plain HTML pages with standard GET/POST forms" and a `FineCalculator` interface — none of these match the actual 7 `.java` files, JSON API, and absence of `FineCalculator`.

### 46. Sample data values in docs vs DB

Mismatch found: `PROJECT_REPORT.md` (Results section) cites timestamp `2026-10-22 10:20 AM`, but the DB contains `2026-10-21 10:20 AM` (record id 5). Book/member IDs and counts in the report match the DB (14 books, 4 members, 5 seed records + 2 test records).

### 47. Things that behave differently from their name/comments

- `Person.java` contains `Member`, `StudentMember`, `FacultyMember` classes (there is no `Member.java` file), yet `VIVA_QUESTIONS.md` Q6 refers to "`Member.java`".
- `member_summary` view is defined but never queried by the application.
- `Book.java`/`Person.java`/`IssueRecord.java` entity classes are not used by `ApiHandler` (which reads `ResultSet` directly).
- `package.json` name `react-example` vs app title "Library Management System".
- `run.bat` references `lib\*` which does not exist.
- Frontend "Sign In" does not authenticate — it only stores a display name in `localStorage`.
- `handleBooks` POST response previously echoed `""` for empty genre instead of `"General"` (fixed during this session).

---

## I. REFERENCES

Libraries, frameworks, tools and standards actually used, with official documentation URLs:

- Java SE 24 — https://docs.oracle.com/en/java/javase/24/
- JDBC (java.sql) — https://docs.oracle.com/en/java/javase/24/docs/api/java.sql/java/sql/package-summary.html
- com.sun.net.httpserver.HttpServer — https://docs.oracle.com/en/java/javase/24/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html
- MySQL 8.0 Reference Manual — https://dev.mysql.com/doc/refman/8.0/en/
- MySQL Connector/J 8.3 — https://dev.mysql.com/doc/connector-j/en/
- React 19 — https://react.dev/
- Vite 8 — https://vite.dev/guide/
- Tailwind CSS 4 — https://tailwindcss.com/docs
- TypeScript 7 — https://www.typescriptlang.org/docs/
- lucide-react — https://lucide.dev/guide/packages/lucide-react
- Node.js — https://nodejs.org/docs/latest/api/
- npm — https://docs.npmjs.com/
- MySQL Workbench — https://dev.mysql.com/doc/workbench/en/

---

## GAPS

- IDE/editor and browser versions could not be determined from the project (no IDE config files, no browser detection).
- No ER diagram file exists; entity/attribute/relationship list provided in section 15.
- The "45 MB memory footprint" claim in `PROJECT_REPORT.md` was not measured.
- No automated tests exist (section 38).
- `member_summary` view and entity classes exist in code but are unused by the running application.
- `ON UPDATE` referential action is not specified on either foreign key (defaults to RESTRICT/NO ACTION).
- No UNIQUE or CHECK constraints exist on any table.
