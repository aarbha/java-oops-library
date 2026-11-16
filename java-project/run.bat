@echo off
REM ========================================================
REM Compilation & Execution Script for Windows
REM ========================================================

echo Compiling Java Library Management System...

REM Compile all Java files with mysql connector in classpath
javac -cp ".;mysql-connector-j-8.3.0.jar;lib\*" *.java

if %ERRORLEVEL% EQU 0 (
    echo Compilation successful!
    echo Starting Server on http://localhost:8080 ...
    java -cp ".;mysql-connector-j-8.3.0.jar;lib\*" Main
) else (
    echo Compilation failed. Please ensure mysql-connector-j.jar is in this folder.
)
pause
