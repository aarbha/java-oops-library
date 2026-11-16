/**
 * IssueRecord.java
 * Represents the transaction record of an issued or returned book.
 * Demonstrates:
 *  - Classes & Objects
 *  - Encapsulation (private fields with public getters/setters)
 *  - Parameterized Constructors
 *  - Timestamps for Time of Issue and Time of Return
 */

// OOP: Classes and Objects
public class IssueRecord {

    // OOP: Encapsulation - Private fields
    private int id;
    private int bookId;
    private String bookTitle;
    private int memberId;
    private String memberName;
    private String memberType;
    private String issueTime;   // Timestamp when book was issued
    private String returnTime;  // Timestamp when book was returned (or "Pending")
    private String status;      // "ISSUED" or "RETURNED"

    // Parameterized Constructor for a new book issue
    public IssueRecord(int bookId, int memberId, String issueTime) {
        this.bookId = bookId;
        this.memberId = memberId;
        this.issueTime = (issueTime == null || issueTime.isEmpty()) ? "N/A" : issueTime;
        this.returnTime = "-";
        this.status = "ISSUED";
    }

    // Parameterized Constructor for loading complete record from database
    public IssueRecord(int id, int bookId, String bookTitle, int memberId, 
                       String memberName, String memberType, String issueTime, 
                       String returnTime, String status) {
        this.id = id;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.memberId = memberId;
        this.memberName = memberName;
        this.memberType = memberType;
        this.issueTime = issueTime;
        this.returnTime = returnTime;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBookId() { return bookId; }
    public void setBookId(int bookId) { this.bookId = bookId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public int getMemberId() { return memberId; }
    public void setMemberId(int memberId) { this.memberId = memberId; }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

    public String getMemberType() { return memberType; }
    public void setMemberType(String memberType) { this.memberType = memberType; }

    public String getIssueTime() { return issueTime; }
    public void setIssueTime(String issueTime) { this.issueTime = issueTime; }

    public String getReturnTime() { return returnTime; }
    public void setReturnTime(String returnTime) { this.returnTime = returnTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String displayInfo() {
        return "Record #" + id + ": [" + bookTitle + "] -> " + memberName 
                + " | Issued: " + issueTime + " | Returned: " + returnTime 
                + " | Status: " + status;
    }
}
