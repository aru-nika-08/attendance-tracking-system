@echo off
echo Starting Attendance Tracker Development Environment...

echo.
echo Starting Backend (Spring Boot)...
start "Backend" cmd /k "cd springapp && mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo Starting Frontend (React)...
start "Frontend" cmd /k "cd attendance-tracker && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul


