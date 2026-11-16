#!/bin/bash
# ========================================================
# Compilation & Execution Script for Linux/macOS
# ========================================================

echo "Compiling Java Library Management System..."

# Check if mysql-connector jar exists in current directory or lib folder
CP=".:mysql-connector-j-8.3.0.jar:lib/*"

# Compile all Java files
javac -cp "$CP" *.java

if [ $? -eq 0 ]; then
    echo "Compilation successful!"
    echo "Starting Server on http://localhost:8080 ..."
    java -cp "$CP" Main
else
    echo "Compilation failed. Please ensure mysql-connector-j.jar is in the directory."
fi
