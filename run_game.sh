#!/usr/bin/env bash
# Launcher script for Ludo Master

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================="
echo "   🎲 Starting Ludo Master Game...        "
echo "=========================================="
echo "Colors: Purple, Green, Yellow, Black"
echo "Opening in your default browser..."

if command -v xdg-open > /dev/null; then
    xdg-open "$DIR/index.html" &
elif command -v firefox > /dev/null; then
    firefox "$DIR/index.html" &
elif command -v google-chrome > /dev/null; then
    google-chrome "$DIR/index.html" &
else
    echo "Starting local Python web server at http://localhost:8080 ..."
    python3 -m http.server 8080
fi
