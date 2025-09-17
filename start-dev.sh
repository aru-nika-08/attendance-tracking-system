#!/bin/bash

echo "Starting Attendance Tracker Development Environment..."

echo ""
echo "Starting Backend (Spring Boot)..."
cd springapp && mvn spring-boot:run &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 10

echo ""
echo "Starting Frontend (React)..."
cd ../attendance-tracker && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait


