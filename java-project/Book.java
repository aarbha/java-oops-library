/**
 * Book.java
 * Represents a physical Book in the library catalog.
 * Demonstrates:
 *  - Classes & Objects
 *  - Encapsulation (private fields with public getters/setters)
 *  - Constructors (multiple parameterized constructors with genre support)
 *  - Abstraction / Interface (implements Searchable)
 *  - Polymorphism / Method Overloading (multiple versions of searchBook)
 */

// OOP: Abstraction / Interface
// An interface defining the contract for any entity that can be searched by keyword
interface Searchable {
    boolean matches(String keyword);
}

// OOP: Classes and Objects
public class Book implements Searchable {

    // OOP: Encapsulation - Private fields to protect direct external modification
    private int id;
    private String title;
    private String author;
    private String genre; // e.g., "Coding", "Mathematics", "English Literature", "Science"
    private boolean isAvailable;

    // OOP: Parameterized Constructor 1 (used when creating a new book before DB assigns ID)
    public Book(String title, String author, String genre) {
        this.title = title;
        this.author = author;
        this.genre = (genre == null || genre.trim().isEmpty()) ? "General" : genre;
        this.isAvailable = true; // New book is available by default
    }

    // Overloaded Constructor for backward compatibility
    public Book(String title, String author) {
        this(title, author, "General");
    }

    // OOP: Parameterized Constructor 2 (used when retrieving complete record from database)
    public Book(int id, String title, String author, String genre, boolean isAvailable) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = (genre == null || genre.trim().isEmpty()) ? "General" : genre;
        this.isAvailable = isAvailable;
    }

    // Overloaded Constructor for backward compatibility
    public Book(int id, String title, String author, boolean isAvailable) {
        this(id, title, author, "General", isAvailable);
    }

    // OOP: Encapsulation - Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        this.isAvailable = available;
    }

    // OOP: Interface Implementation (from Searchable)
    @Override
    public boolean matches(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return true;
        }
        String q = keyword.toLowerCase();
        return this.title.toLowerCase().contains(q) 
                || this.author.toLowerCase().contains(q)
                || this.genre.toLowerCase().contains(q);
    }

    // OOP: Polymorphism - Method Overloading (Version 1: search by title only)
    public boolean searchBook(String titleQuery) {
        if (titleQuery == null || titleQuery.trim().isEmpty()) {
            return true;
        }
        return this.title.toLowerCase().contains(titleQuery.toLowerCase());
    }

    // OOP: Polymorphism - Method Overloading (Version 2: search by both title and author)
    public boolean searchBook(String titleQuery, String authorQuery) {
        boolean titleMatch = (titleQuery == null || titleQuery.trim().isEmpty())
                || this.title.toLowerCase().contains(titleQuery.toLowerCase());
        boolean authorMatch = (authorQuery == null || authorQuery.trim().isEmpty())
                || this.author.toLowerCase().contains(authorQuery.toLowerCase());
        return titleMatch && authorMatch;
    }

    // OOP: Polymorphism - Method Overloading (Version 3: search by title, author, and genre)
    public boolean searchBook(String titleQuery, String authorQuery, String genreQuery) {
        boolean base = searchBook(titleQuery, authorQuery);
        boolean genreMatch = (genreQuery == null || genreQuery.trim().isEmpty() || "All".equalsIgnoreCase(genreQuery))
                || this.genre.equalsIgnoreCase(genreQuery);
        return base && genreMatch;
    }

    // Displays book details in a readable string format
    public String displayInfo() {
        return "Book #" + id + ": \"" + title + "\" by " + author + " [" + genre + "] - " + (isAvailable ? "Available" : "Issued");
    }
}
