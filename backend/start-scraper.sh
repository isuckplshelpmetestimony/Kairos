#!/bin/bash

echo "================================================"
echo "🚀 Kairos Local Scraper Service"
echo "================================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $FLASK_PID $NGROK_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Kill any existing processes
pkill -f "python.*app.py" 2>/dev/null
pkill -f "ngrok" 2>/dev/null
sleep 2

# Start Flask backend
echo "Starting Flask backend on port 3000..."
cd "$(dirname "$0")"
PORT=3000 python3 app.py > /tmp/kairos-backend.log 2>&1 &
FLASK_PID=$!

# Wait for Flask to start
echo "Waiting for backend to initialize..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready"
        break
    fi
    sleep 1
done

# Check if backend is actually running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Check /tmp/kairos-backend.log"
    exit 1
fi

# Start ngrok
echo ""
echo "Starting ngrok tunnel..."
ngrok http 3000 --log=stdout > /tmp/kairos-ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get and display ngrok URL
echo ""
echo "================================================"
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "Check /tmp/kairos-ngrok.log for details"
    cleanup
fi

echo "📡 NGROK URL:"
echo "$NGROK_URL"
echo "================================================"
echo ""
echo "⚙️  To configure Render:"
echo "   1. Go to Render dashboard"
echo "   2. Select kairos-backend service"
echo "   3. Environment tab"
echo "   4. Set: SCRAPER_MODE = remote"
echo "   5. Set: SCRAPER_URL = $NGROK_URL"
echo ""
echo "✅ Local scraper is running"
echo "Press Ctrl+C to stop"
echo ""

# Keep script running
wait

