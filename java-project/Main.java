import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Main.java
 * Pure Core Java Library Management System for College OOP Lab — JSON API server.
 * Zero external web frameworks (built-in com.sun.net.httpserver.HttpServer only).
 *
 * Serves a JSON API consumed by the React frontend:
 *   GET    /api/books        POST /api/books        DELETE /api/books/{id}
 *   GET    /api/members      POST /api/members      DELETE /api/members/{id}
 *   GET    /api/records      POST /api/issue        POST /api/return
 *
 * Persistence: MySQL via JDBC (required).
 */
public class Main {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        // MySQL is the required persistence layer — fail fast if it is not reachable.
        Connection probe = DBConnection.getConnection();
        if (probe == null) {
            System.out.println("==================================================");
            System.out.println(" College Library Management System (OOPs Lab)");
            System.out.println(" Persistence error: MySQL database is not reachable.");
            System.out.println(" Start the local MySQL server and load the schema before starting the server.");
            System.out.println("==================================================");
            return;
        }
        DBConnection.close(probe);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api", new ApiHandler());
        server.setExecutor(null);

        System.out.println("==================================================");
        System.out.println(" College Library Management System (OOPs Lab)");
        System.out.println(" JSON API server running at: http://localhost:" + PORT);
        System.out.println(" Persistence mode: MySQL");
        System.out.println("==================================================");

        server.start();
    }

    public static String getCurrentTimestamp() {
        return new SimpleDateFormat("yyyy-MM-dd hh:mm a").format(new Date());
    }
}
