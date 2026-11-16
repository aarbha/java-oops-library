/**
 * Person.java
 * Demonstrates:
 *  - OOP: Abstraction (Abstract class Person and Interface Borrowable)
 *  - OOP: Inheritance (Member extends Person, StudentMember & FacultyMember extend Member)
 *  - OOP: Encapsulation (Private fields with public getters/setters)
 *  - OOP: Parameterized Constructors (super calls)
 *  - OOP: Polymorphism (Method Overriding for getBorrowLimit and displayInfo)
 */

// OOP: Abstraction / Interface
// Interface defining the borrowing contract for academic members
interface Borrowable {
    int getBorrowLimit();
    boolean canBorrow(int currentBorrowedCount);
}

// OOP: Abstraction / Abstract Class
// Base class for any person in the college system
public abstract class Person {

    // OOP: Encapsulation - Private fields protected from outside direct access
    private int id;
    private String name;
    private String phone;

    // OOP: Parameterized Constructor for Person base class
    public Person(int id, String name, String phone) {
        this.id = id;
        this.name = name;
        this.phone = phone;
    }

    public Person(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // OOP: Abstraction - Abstract methods that derived classes MUST implement
    public abstract String getRole();

    public String displayInfo() {
        return "ID: " + id + ", Name: " + name + ", Phone: " + phone;
    }
}

// OOP: Inheritance - Member extends Person and implements Borrowable
class Member extends Person implements Borrowable {

    private String memberType;

    public Member(int id, String name, String phone, String memberType) {
        super(id, name, phone);
        this.memberType = memberType;
    }

    public Member(String name, String phone, String memberType) {
        super(name, phone);
        this.memberType = memberType;
    }

    public String getMemberType() { return memberType; }
    public void setMemberType(String memberType) { this.memberType = memberType; }

    @Override
    public String getRole() {
        return memberType;
    }

    @Override
    public int getBorrowLimit() {
        return 3;
    }

    @Override
    public boolean canBorrow(int currentBorrowedCount) {
        return currentBorrowedCount < getBorrowLimit();
    }

    @Override
    public String displayInfo() {
        return super.displayInfo() + ", Type: " + memberType + " (Borrow Limit: " + getBorrowLimit() + " books)";
    }
}

// OOP: Inheritance - StudentMember inherits from Member
class StudentMember extends Member {

    public StudentMember(int id, String name, String phone) {
        super(id, name, phone, "STUDENT");
    }

    // OOP: Polymorphism - Method Overriding: Student borrowing limit is 2 books
    @Override
    public int getBorrowLimit() {
        return 2;
    }

    @Override
    public String displayInfo() {
        return "[Student] " + super.displayInfo();
    }
}

// OOP: Inheritance - FacultyMember inherits from Member
class FacultyMember extends Member {

    public FacultyMember(int id, String name, String phone) {
        super(id, name, phone, "FACULTY");
    }

    // OOP: Polymorphism - Method Overriding: Faculty borrowing limit is 5 books
    @Override
    public int getBorrowLimit() {
        return 5;
    }

    @Override
    public String displayInfo() {
        return "[Faculty] " + super.displayInfo();
    }
}
