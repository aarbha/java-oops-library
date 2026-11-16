import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Json.java
 * Minimal hand-rolled JSON helpers (no external libraries).
 * Handles flat objects/arrays — enough for the Library Management System API.
 */
public class Json {

    // Escape a string for JSON output
    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                case '\b': sb.append("\\b");  break;
                case '\f': sb.append("\\f");  break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    // Quote a string value
    public static String quote(String s) {
        return "\"" + escape(s) + "\"";
    }

    // Build a JSON object from key-value pairs.
    // Values: String -> quoted, Integer/Boolean -> raw, null -> null
    public static String object(Object... kv) {
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < kv.length; i += 2) {
            if (i > 0) sb.append(",");
            sb.append(quote((String) kv[i])).append(":");
            Object v = kv[i + 1];
            if (v == null) sb.append("null");
            else if (v instanceof String) sb.append(quote((String) v));
            else sb.append(v.toString());
        }
        sb.append("}");
        return sb.toString();
    }

    // Build a JSON array from a list of JSON strings
    public static String array(List<String> jsonItems) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < jsonItems.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(jsonItems.get(i));
        }
        sb.append("]");
        return sb.toString();
    }

    // Parse a flat JSON object body into a Map<String,Object>.
    // Values: numbers -> Integer, true/false -> Boolean, strings -> String
    // Returns empty map on null/blank/invalid input.
    public static Map<String, Object> parseObject(String body) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        if (body == null) return map;
        String s = body.trim();
        if (s.length() < 2 || s.charAt(0) != '{') return map;
        int i = 1;
        int n = s.length();
        while (i < n) {
            while (i < n && (s.charAt(i) == ',' || Character.isWhitespace(s.charAt(i)))) i++;
            if (i >= n || s.charAt(i) == '}') break;
            if (s.charAt(i) != '"') break;
            // parse key
            int keyStart = ++i;
            StringBuilder keySb = new StringBuilder();
            while (i < n && s.charAt(i) != '"') {
                if (s.charAt(i) == '\\') i++;
                keySb.append(s.charAt(i));
                i++;
            }
            i++; // skip closing quote
            String key = keySb.toString();
            while (i < n && s.charAt(i) != ':') i++;
            i++; // skip colon
            while (i < n && Character.isWhitespace(s.charAt(i))) i++;
            if (i >= n) break;
            char c = s.charAt(i);
            if (c == '"') {
                // string value
                i++;
                StringBuilder valSb = new StringBuilder();
                while (i < n && s.charAt(i) != '"') {
                    if (s.charAt(i) == '\\') {
                        i++;
                        char esc = s.charAt(i);
                        switch (esc) {
                            case 'n': valSb.append('\n'); break;
                            case 'r': valSb.append('\r'); break;
                            case 't': valSb.append('\t'); break;
                            case 'b': valSb.append('\b'); break;
                            case 'f': valSb.append('\f'); break;
                            case 'u':
                                if (i + 4 < n) {
                                    String hex = s.substring(i + 1, i + 5);
                                    valSb.append((char) Integer.parseInt(hex, 16));
                                    i += 4;
                                }
                                break;
                            default: valSb.append(esc);
                        }
                    } else {
                        valSb.append(s.charAt(i));
                    }
                    i++;
                }
                i++; // skip closing quote
                map.put(key, valSb.toString());
            } else if (c == 't' || c == 'f') {
                boolean val = (c == 't');
                while (i < n && s.charAt(i) != ',' && s.charAt(i) != '}') i++;
                map.put(key, val);
            } else if (c == 'n') {
                while (i < n && s.charAt(i) != ',' && s.charAt(i) != '}') i++;
                map.put(key, null);
            } else {
                // number
                int numStart = i;
                while (i < n && s.charAt(i) != ',' && s.charAt(i) != '}') i++;
                String numStr = s.substring(numStart, i).trim();
                try {
                    map.put(key, Integer.parseInt(numStr));
                } catch (NumberFormatException e) {
                    try {
                        map.put(key, Double.parseDouble(numStr));
                    } catch (NumberFormatException ignored) {
                        map.put(key, numStr);
                    }
                }
            }
        }
        return map;
    }

    // Helper to get a String field from parsed map
    public static String getString(Map<String, Object> map, String key) {
        Object v = map.get(key);
        return v == null ? null : v.toString();
    }

    // Helper to get an int field from parsed map (returns defaultValue if absent)
    public static int getInt(Map<String, Object> map, String key, int defaultValue) {
        Object v = map.get(key);
        if (v instanceof Integer) return (Integer) v;
        if (v instanceof String) {
            try { return Integer.parseInt((String) v); } catch (NumberFormatException ignored) {}
        }
        return defaultValue;
    }
}
