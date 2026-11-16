import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * ApiHandler.java
 * Single JSON API handler mounted at /api.
 * Routes:
 *   GET    /api/books        -> list books
 *   POST   /api/books        -> add book    {title, author, genre}
 *   DELETE /api/books/{id}   -> delete book
 *   GET    /api/members      -> list members
 *   POST   /api/members      -> add member  {name, phone, type}
 *   DELETE /api/members/{id} -> delete member
 *   GET    /api/records      -> list borrow records (denormalized)
 *   POST   /api/issue        -> issue book  {bookId, memberId}
 *   POST   /api/return       -> return book {recordId}
 *
 * Persists all data in the MySQL database via JDBC.
 */
public class ApiHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");

        String method = exchange.getRequestMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        // Path after /api
        String path = exchange.getRequestURI().getPath();
        String rel = path.startsWith("/api/") ? path.substring(4) : path.substring(3);
        // rel like "/books", "/books/5", "/members", "/members/2", "/records", "/issue", "/return"
        String[] segments = rel.split("/");
        // segments[0] is "" (leading slash) -> actual segments start at 1
        List<String> parts = new ArrayList<String>();
        for (String seg : segments) {
            if (!seg.isEmpty()) parts.add(seg);
        }

        try {
            if (parts.isEmpty()) {
                sendJson(exchange, 404, Json.object("error", "Not found"));
                return;
            }

            String resource = parts.get(0);
            String idStr = parts.size() > 1 ? parts.get(1) : null;

            if ("books".equals(resource)) {
                handleBooks(exchange, method, idStr);
            } else if ("members".equals(resource)) {
                handleMembers(exchange, method, idStr);
            } else if ("records".equals(resource)) {
                handleRecords(exchange, method);
            } else if ("issue".equals(resource)) {
                handleIssue(exchange, method);
            } else if ("return".equals(resource)) {
                handleReturn(exchange, method);
            } else {
                sendJson(exchange, 404, Json.object("error", "Not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(exchange, 500, Json.object("error", "Internal server error"));
        }
    }

    // ===== BOOKS =====

    private void handleBooks(HttpExchange ex, String method, String idStr) throws IOException {
        if ("GET".equalsIgnoreCase(method)) {
            List<String> items = new ArrayList<String>();
            Connection conn = DBConnection.getConnection();
            if (conn == null) {
                sendJson(ex, 503, Json.object("error", "Database unavailable"));
                return;
            }
            try {
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT id, title, author, genre, is_available FROM books ORDER BY id DESC");
                while (rs.next()) {
                    items.add(bookJson(rs.getInt("id"), rs.getString("title"), rs.getString("author"), rs.getString("genre"), rs.getBoolean("is_available")));
                }
                stmt.close();
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 503, Json.object("error", "Failed to fetch books"));
                return;
            } finally {
                DBConnection.close(conn);
            }
            sendJson(ex, 200, Json.array(items));
        } else if ("POST".equalsIgnoreCase(method)) {
            Map<String, Object> body = Json.parseObject(readBody(ex));
            String title = Json.getString(body, "title");
            String author = Json.getString(body, "author");
            String genre = Json.getString(body, "genre");
            if (title == null || title.trim().isEmpty() || author == null || author.trim().isEmpty()) {
                sendJson(ex, 400, Json.object("error", "Title and author are required"));
                return;
            }
            Connection conn = DBConnection.getConnection();
            if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
            try {
                PreparedStatement ps = conn.prepareStatement("INSERT INTO books (title, author, genre, is_available) VALUES (?, ?, ?, TRUE)", Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, title.trim());
                ps.setString(2, author.trim());
                ps.setString(3, genre == null || genre.trim().isEmpty() ? "General" : genre.trim());
                ps.executeUpdate();
                ResultSet keys = ps.getGeneratedKeys();
                int newId = 0;
                if (keys.next()) newId = keys.getInt(1);
                ps.close();
                String echoGenre = (genre == null || genre.trim().isEmpty()) ? "General" : genre.trim();
                sendJson(ex, 201, bookJson(newId, title.trim(), author.trim(), echoGenre, true));
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 500, Json.object("error", "Failed to add book"));
            } finally {
                DBConnection.close(conn);
            }
        } else if ("DELETE".equalsIgnoreCase(method)) {
            int id = parseIntSafe(idStr);
            if (id < 0) { sendJson(ex, 400, Json.object("error", "Invalid book id")); return; }
            Connection conn = DBConnection.getConnection();
            if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM books WHERE id = ?");
                ps.setInt(1, id);
                int rows = ps.executeUpdate();
                ps.close();
                if (rows == 0) { sendJson(ex, 404, Json.object("error", "Book not found")); return; }
                sendEmpty(ex, 204);
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 500, Json.object("error", "Failed to delete book"));
            } finally {
                DBConnection.close(conn);
            }
        } else {
            sendJson(ex, 405, Json.object("error", "Method not allowed"));
        }
    }

    // ===== MEMBERS =====

    private void handleMembers(HttpExchange ex, String method, String idStr) throws IOException {
        if ("GET".equalsIgnoreCase(method)) {
            List<String> items = new ArrayList<String>();
            Connection conn = DBConnection.getConnection();
            if (conn == null) {
                sendJson(ex, 503, Json.object("error", "Database unavailable"));
                return;
            }
            try {
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT id, name, phone, member_type FROM members ORDER BY id ASC");
                while (rs.next()) {
                    items.add(memberJson(rs.getInt("id"), rs.getString("name"), rs.getString("phone"), rs.getString("member_type")));
                }
                stmt.close();
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 503, Json.object("error", "Failed to fetch members"));
                return;
            } finally {
                DBConnection.close(conn);
            }
            sendJson(ex, 200, Json.array(items));
        } else if ("POST".equalsIgnoreCase(method)) {
            Map<String, Object> body = Json.parseObject(readBody(ex));
            String name = Json.getString(body, "name");
            String phone = Json.getString(body, "phone");
            String type = Json.getString(body, "type");
            if (name == null || name.trim().isEmpty() || phone == null || phone.trim().isEmpty()) {
                sendJson(ex, 400, Json.object("error", "Name and phone are required"));
                return;
            }
            if ("FACULTY".equalsIgnoreCase(type)) type = "FACULTY"; else type = "STUDENT";
            Connection conn = DBConnection.getConnection();
            if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
            try {
                PreparedStatement ps = conn.prepareStatement("INSERT INTO members (name, phone, member_type) VALUES (?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, name.trim());
                ps.setString(2, phone.trim());
                ps.setString(3, type);
                ps.executeUpdate();
                ResultSet keys = ps.getGeneratedKeys();
                int newId = 0;
                if (keys.next()) newId = keys.getInt(1);
                ps.close();
                sendJson(ex, 201, memberJson(newId, name.trim(), phone.trim(), type));
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 500, Json.object("error", "Failed to add member"));
            } finally {
                DBConnection.close(conn);
            }
        } else if ("DELETE".equalsIgnoreCase(method)) {
            int id = parseIntSafe(idStr);
            if (id < 0) { sendJson(ex, 400, Json.object("error", "Invalid member id")); return; }
            Connection conn = DBConnection.getConnection();
            if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
            try {
                PreparedStatement ps = conn.prepareStatement("DELETE FROM members WHERE id = ?");
                ps.setInt(1, id);
                int rows = ps.executeUpdate();
                ps.close();
                if (rows == 0) { sendJson(ex, 404, Json.object("error", "Member not found")); return; }
                sendEmpty(ex, 204);
            } catch (Exception e) {
                e.printStackTrace();
                sendJson(ex, 500, Json.object("error", "Failed to delete member"));
            } finally {
                DBConnection.close(conn);
            }
        } else {
            sendJson(ex, 405, Json.object("error", "Method not allowed"));
        }
    }

    // ===== RECORDS =====

    private void handleRecords(HttpExchange ex, String method) throws IOException {
        if (!"GET".equalsIgnoreCase(method)) {
            sendJson(ex, 405, Json.object("error", "Method not allowed"));
            return;
        }
        List<String> items = new ArrayList<String>();
        Connection conn = DBConnection.getConnection();
        if (conn == null) {
            sendJson(ex, 503, Json.object("error", "Database unavailable"));
            return;
        }
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                    "SELECT id, book_id, title, member_id, name, member_type, issue_time, return_time, status " +
                    "FROM borrow_overview ORDER BY id DESC");
            while (rs.next()) {
                String returnTime = rs.getString("return_time");
                if ("-".equals(returnTime) || "N/A".equals(returnTime)) returnTime = null;
                items.add(recordJson(rs.getInt("id"), rs.getInt("book_id"), rs.getString("title"),
                        rs.getInt("member_id"), rs.getString("name"), rs.getString("member_type"),
                        rs.getString("issue_time"), returnTime, rs.getString("status")));
            }
            stmt.close();
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(ex, 503, Json.object("error", "Failed to fetch records"));
            return;
        } finally {
            DBConnection.close(conn);
        }
        sendJson(ex, 200, Json.array(items));
    }

    // ===== ISSUE =====

    private void handleIssue(HttpExchange ex, String method) throws IOException {
        if (!"POST".equalsIgnoreCase(method)) {
            sendJson(ex, 405, Json.object("error", "Method not allowed"));
            return;
        }
        Map<String, Object> body = Json.parseObject(readBody(ex));
        int bookId = Json.getInt(body, "bookId", -1);
        int memberId = Json.getInt(body, "memberId", -1);
        if (bookId < 0 || memberId < 0) {
            sendJson(ex, 400, Json.object("error", "bookId and memberId are required"));
            return;
        }
        String timestamp = Main.getCurrentTimestamp();

        Connection conn = DBConnection.getConnection();
        if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
        try {
            // Check book exists + available
            PreparedStatement psB = conn.prepareStatement("SELECT title, is_available FROM books WHERE id = ?");
            psB.setInt(1, bookId);
            ResultSet rsB = psB.executeQuery();
            if (!rsB.next()) { sendJson(ex, 404, Json.object("error", "Book not found")); return; }
            String bookTitle = rsB.getString("title");
            if (!rsB.getBoolean("is_available")) { sendJson(ex, 409, Json.object("error", "Selected book is unavailable")); return; }
            psB.close();

            // Check member exists + quota (enforced server-side, matching Student=2 / Faculty=5)
            PreparedStatement psM = conn.prepareStatement("SELECT name, member_type FROM members WHERE id = ?");
            psM.setInt(1, memberId);
            ResultSet rsM = psM.executeQuery();
            if (!rsM.next()) { sendJson(ex, 404, Json.object("error", "Member not found")); return; }
            String memberName = rsM.getString("name");
            String memberType = rsM.getString("member_type");
            int quota = "FACULTY".equalsIgnoreCase(memberType) ? 5 : 2;
            psM.close();

            PreparedStatement psC = conn.prepareStatement("SELECT COUNT(*) FROM issue_records WHERE member_id = ? AND status = 'ISSUED'");
            psC.setInt(1, memberId);
            ResultSet rsC = psC.executeQuery();
            int current = 0;
            if (rsC.next()) current = rsC.getInt(1);
            psC.close();
            if (current >= quota) { sendJson(ex, 409, Json.object("error", "Quota reached: limit is " + quota + " books")); return; }

            // Insert + mark unavailable
            PreparedStatement ps1 = conn.prepareStatement(
                    "INSERT INTO issue_records (book_id, member_id, issue_time, return_time, status) VALUES (?, ?, ?, '-', 'ISSUED')", Statement.RETURN_GENERATED_KEYS);
            ps1.setInt(1, bookId);
            ps1.setInt(2, memberId);
            ps1.setString(3, timestamp);
            ps1.executeUpdate();
            ResultSet keys = ps1.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);
            ps1.close();

            PreparedStatement ps2 = conn.prepareStatement("UPDATE books SET is_available = FALSE WHERE id = ?");
            ps2.setInt(1, bookId);
            ps2.executeUpdate();
            ps2.close();

            sendJson(ex, 201, recordJson(newId, bookId, bookTitle, memberId, memberName, memberType, timestamp, null, "ISSUED"));
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(ex, 500, Json.object("error", "Failed to issue book"));
        } finally {
            DBConnection.close(conn);
        }
    }

    // ===== RETURN =====

    private void handleReturn(HttpExchange ex, String method) throws IOException {
        if (!"POST".equalsIgnoreCase(method)) {
            sendJson(ex, 405, Json.object("error", "Method not allowed"));
            return;
        }
        Map<String, Object> body = Json.parseObject(readBody(ex));
        int recordId = Json.getInt(body, "recordId", -1);
        if (recordId < 0) {
            sendJson(ex, 400, Json.object("error", "recordId is required"));
            return;
        }
        String timestamp = Main.getCurrentTimestamp();

        Connection conn = DBConnection.getConnection();
        if (conn == null) { sendJson(ex, 503, Json.object("error", "Database unavailable")); return; }
        try {
            // Load record from the borrow_overview view
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT book_id, title, member_id, name, member_type, status " +
                    "FROM borrow_overview WHERE id = ?");
            ps.setInt(1, recordId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) { sendJson(ex, 404, Json.object("error", "Record not found")); return; }
            int bookId = rs.getInt("book_id");
            String bookTitle = rs.getString("title");
            int memberId = rs.getInt("member_id");
            String memberName = rs.getString("name");
            String memberType = rs.getString("member_type");
            if ("RETURNED".equals(rs.getString("status"))) { sendJson(ex, 409, Json.object("error", "Book already returned")); return; }
            ps.close();

            PreparedStatement psUpd = conn.prepareStatement("UPDATE issue_records SET return_time = ?, status = 'RETURNED' WHERE id = ?");
            psUpd.setString(1, timestamp);
            psUpd.setInt(2, recordId);
            psUpd.executeUpdate();
            psUpd.close();

            PreparedStatement psB = conn.prepareStatement("UPDATE books SET is_available = TRUE WHERE id = ?");
            psB.setInt(1, bookId);
            psB.executeUpdate();
            psB.close();

            sendJson(ex, 200, recordJson(recordId, bookId, bookTitle, memberId, memberName, memberType, timestamp, timestamp, "RETURNED"));
        } catch (Exception e) {
            e.printStackTrace();
            sendJson(ex, 500, Json.object("error", "Failed to return book"));
        } finally {
            DBConnection.close(conn);
        }
    }

    // ===== HELPERS =====

    private static String bookJson(int id, String title, String author, String genre, boolean isAvailable) {
        return Json.object("id", id, "title", title, "author", author, "genre", genre, "isAvailable", isAvailable);
    }

    private static String memberJson(int id, String name, String phone, String type) {
        return Json.object("id", id, "name", name, "phone", phone, "type", type);
    }

    private static String recordJson(int id, int bookId, String bookTitle, int memberId, String memberName,
                                     String memberType, String issueTime, String returnTime, String status) {
        return Json.object("id", id, "bookId", bookId, "bookTitle", bookTitle, "memberId", memberId,
                "memberName", memberName, "memberType", memberType, "issueTime", issueTime,
                "returnTime", returnTime, "status", status);
    }

    private static String readBody(HttpExchange ex) throws IOException {
        InputStream is = ex.getRequestBody();
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[4096];
        int n;
        while ((n = is.read(buf)) != -1) bos.write(buf, 0, n);
        return bos.toString(StandardCharsets.UTF_8.name());
    }

    private static void sendJson(HttpExchange ex, int code, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchangeSetContentType(ex);
        ex.sendResponseHeaders(code, bytes.length);
        OutputStream os = ex.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static void exchangeSetContentType(HttpExchange ex) {
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
    }

    private static void sendEmpty(HttpExchange ex, int code) throws IOException {
        ex.sendResponseHeaders(code, -1);
        ex.close();
    }

    private static int parseIntSafe(String s) {
        if (s == null) return -1;
        try { return Integer.parseInt(URLDecoder.decode(s, "UTF-8")); } catch (Exception e) { return -1; }
    }
}
