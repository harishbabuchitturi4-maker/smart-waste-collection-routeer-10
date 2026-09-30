@echo off
title Smart Waste Collection Router - Team 10
color 0b

echo ===============================================================================
echo            SMART WASTE COLLECTION ROUTER (TEAM 10)
echo            AI + ADSA (Unit 2) + OOPJ + Python Regression
echo ===============================================================================
echo.

:: Detect Java JDK (checks local tools\jdk-17 first, then system path)
set "JAVA_CMD=java"
set "JAVAC_CMD=javac"

if exist "%~dp0tools\jdk-17\bin\java.exe" (
    set "JAVA_CMD=%~dp0tools\jdk-17\bin\java.exe"
    set "JAVAC_CMD=%~dp0tools\jdk-17\bin\javac.exe"
)

echo [1/3] Compiling Java Source Files...
if not exist "%~dp0java\bin" mkdir "%~dp0java\bin"

dir /s /b "%~dp0java\src\*.java" > "%~dp0java\sources.txt"
"%JAVAC_CMD%" -d "%~dp0java\bin" @"%~dp0java\sources.txt"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java compilation failed!
    del "%~dp0java\sources.txt"
    pause
    exit /b %ERRORLEVEL%
)
del "%~dp0java\sources.txt"
echo [OK] Java source compiled successfully.
echo.

echo [2/3] Running Java Pipeline (AI + ADSA + OOPJ + Python Bridge)...
"%JAVA_CMD%" -cp "%~dp0java\bin" Main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java execution encountered an issue.
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo ===============================================================================
echo  Choose an action:
echo  [1] Launch Interactive Web Visualizer Dashboard (Browser)
echo  [2] Run Verification & Unit Test Suite
echo  [3] Exit
echo ===============================================================================
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" (
    echo Launching web dashboard at http://localhost:8000 ...
    python "%~dp0run_server.py"
) else if "%choice%"=="2" (
    echo.
    echo Running Java & Python Test Suites...
    "%JAVA_CMD%" -cp "%~dp0java\bin" test.SystemTest
    python "%~dp0python\test_predictor.py"
    pause
) else (
    echo Exiting. Have a great day!
)
