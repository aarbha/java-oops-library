# Basic Library Management System (Core Java & MySQL)
### Designed for College OOPs Lab Practical & Viva Examination

---

## 1. Project Overview & Tech Stack
- **Language**: Core Java (JDK 8 or above). No Spring Boot, no Servlets, no Maven/Gradle.
- **Web Server**: Java's built-in `com.sun.net.httpserver.HttpServer` on port `8080`.
- **Database**: MySQL with plain JDBC (`mysql-connector-j.jar`).
- **Frontend**: Plain HTML pages with readable inline `<style>` CSS block, standard GET/POST forms, and tables.
- **File Count**: 5 Java files + 1 SQL script (strictly minimal and easy to understand).

---

## 2. File Structure
```text
library-management-system/
│
├── database.sql           # MySQL script (DB creation, tables, sample data)
├── DBConnection.java       # Plain JDBC database connection helper
├── Book.java               # Book entity, Searchable interface, method overloading
├── Person.java             # Person abstract class, FineCalculator interface, Member, StudentMember, FacultyMember
├── IssueRecord.java        # Issue record, integer-arithmetic fine calculation
├── Main.java               # Built-in HttpServer, routing, form handlers & HTML page generators
├── run.sh                  # Execution script for Linux/macOS
└── run.bat                 # Execution script for Windows
```

---

## 3. OOP Concepts Mapped to Code

| OOP Concept | Where It Is Used in Code | Explanation for Viva |
| :--- | :--- | :--- |
| **Classes & Objects** | `Book`, `Member`, `IssueRecord` | Models real-world library entities with state and behavior. |
| **Encapsulation** | All classes (`private` fields) | Private variables accessed exclusively via getters and setters. |
| **Constructors** | Parameterized constructors in all classes | Initializes object state on instantiation with `super()` chaining. |
| **Inheritance** | `Person` &rarr; `Member` &rarr; `StudentMember` / `FacultyMember` | Code reuse; derived classes extend parent attributes and methods. |
| **Polymorphism (Overriding)** | `getBorrowLimit()` & `displayInfo()` | Dynamic method dispatch: Student has a limit of 2 books; Faculty has a limit of 5 books. |
| **Polymorphism (Overloading)** | `Book.searchBook(title)` & `searchBook(title, author)` | Same method name with different parameter signatures. |
| **Abstraction** | `abstract class Person`, `interface Searchable`, `interface Borrowable` | Defines essential contracts without implementation details. |

---

## 4. Database Setup (MySQL)
1. Open MySQL Workbench or MySQL Command Line Client:
   ```bash
   mysql -u root -p
   ```
2. Run the script:
   ```sql
   source /path/to/database.sql;
   ```
3. Open `DBConnection.java` and make sure your MySQL username and password match:
   ```java
   private static final String URL = "jdbc:mysql://localhost:3306/library_db";
   private static final String USERNAME = "root";
   private static final String PASSWORD = "your_mysql_password";
   ```

---

## 5. How to Compile and Run

### Option A: From Command Line
1. Download `mysql-connector-j-8.3.0.jar` (or place any 8.x MySQL connector jar into this folder).
2. **Compile**:
   - **Linux / macOS**:
     ```bash
     javac -cp ".:mysql-connector-j-8.3.0.jar" *.java
     ```
   - **Windows**:
     ```cmd
     javac -cp ".;mysql-connector-j-8.3.0.jar" *.java
     ```
3. **Run**:
   - **Linux / macOS**:
     ```bash
     java -cp ".:mysql-connector-j-8.3.0.jar" Main
     ```
   - **Windows**:
     ```cmd
     java -cp ".;mysql-connector-j-8.3.0.jar" Main
     ```
4. Open your browser and visit: `http://localhost:8080`

### Option B: In Eclipse / IntelliJ IDEA / VS Code
1. Create a new Java Project (without build tool).
2. Copy the 5 `.java` files into the `src/` directory.
3. Add `mysql-connector-j-8.3.0.jar` as an external library:
   - **IntelliJ**: File &rarr; Project Structure &rarr; Libraries &rarr; `+` (Java) &rarr; select the JAR.
   - **Eclipse**: Right click project &rarr; Build Path &rarr; Configure Build Path &rarr; Libraries &rarr; Add External JARs &rarr; select the JAR.
   - **VS Code**: Under "JAVA PROJECTS" sidebar &rarr; Referenced Libraries &rarr; click `+` &rarr; select the JAR.
4. Run `Main.java`.

---

## 6. Viva Voce Questions & Answers
1. **Q: Why did you not use Spring Boot or Servlets?**
   - *A: Spring Boot and Servlets introduce heavy framework abstractions that hide the underlying OOP mechanics. Using core Java with `HttpServer` and plain JDBC keeps the project transparent, foundational, and fully explainable.*
2. **Q: How does dynamic polymorphism work in your borrowing quotas?**
   - *A: We declare a reference of interface type `Borrowable`. At runtime, we instantiate either a `StudentMember` or `FacultyMember`. When `borrower.getBorrowLimit()` is called, the JVM dynamically invokes the subclass implementation (2 for Students, 5 for Faculty).*
3. **Q: How are Time of Issue and Time of Return handled?**
   - *A: When an issue transaction is confirmed, the system timestamps the exact Time of Issue. When the book is returned, it stamps the Time of Return, updating the status from ISSUED to RETURNED.*
