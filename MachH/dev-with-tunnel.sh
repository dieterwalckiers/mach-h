#!/bin/bash

# Development script with ngrok tunnel for Mollie webhook testing
# This script starts the dev server and creates an ngrok tunnel

echo "🚀 Starting development environment with webhook tunnel..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null
then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   npm install -g ngrok"
    echo "   or visit: https://ngrok.com/download"
    exit 1
fi

# Start dev server in background
echo "📦 Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for dev server to start
echo "⏳ Waiting for dev server to start..."
sleep 5

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 5173 &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | sed 's/"public_url":"//')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $DEV_PID
    kill $NGROK_PID
    exit 1
fi

echo ""
echo "✅ Development environment ready!"
echo "=================================="
echo "Local URL: http://localhost:5173"
echo "Public URL: $NGROK_URL"
echo "Webhook URL: $NGROK_URL/webhook/mollie"
echo ""
echo "📝 Add this to your .env.local:"
echo "   MOLLIE_WEBHOOK_URL=$NGROK_URL/webhook/mollie"
echo ""
echo "Or set it temporarily:"
echo "   export MOLLIE_WEBHOOK_URL=$NGROK_URL/webhook/mollie"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================="

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $DEV_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 0
}

# Set up trap to handle Ctrl+C
trap cleanup INT

# Keep script running
wait