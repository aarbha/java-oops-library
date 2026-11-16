import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection.java
 * Small helper class to manage MySQL database connectivity using plain JDBC.
 * Simple and easy to explain in viva.
 */
public class DBConnection {

    // Database connection parameters (override via DB_URL / DB_USERNAME / DB_PASSWORD env vars if needed)
    private static final String URL = System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true");
    private static final String USERNAME = System.getenv().getOrDefault("DB_USERNAME", "root");
    private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "password");

    /**
     * Obtains and returns a new Connection to the MySQL database.
     * Loads the MySQL JDBC driver class and uses DriverManager.
     * 
     * @return Connection object if successful, null if failed
     */
    public static Connection getConnection() {
        Connection conn = null;
        try {
            // Load the MySQL JDBC Driver class
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Establish the connection
            conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
        } catch (ClassNotFoundException e) {
            System.out.println("[DB Error] MySQL JDBC Driver not found. Did you add mysql-connector-j.jar to your classpath?");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("[DB Error] Could not connect to MySQL database: " + e.getMessage());
            e.printStackTrace();
        }
        return conn;
    }

    /**
     * Safely closes an open database connection.
     * Prevents resource leaks in simple JDBC code.
     * 
     * @param conn Connection object to close
     */
    public static void close(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
