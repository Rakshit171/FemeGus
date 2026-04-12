@echo off
echo Starting Portfolio Local Server...
echo.
echo 1. Open your browser to: http://localhost:5500
echo 2. Press Ctrl+C in this window to stop the server when done.
echo.
python -m http.server 5500
pause
