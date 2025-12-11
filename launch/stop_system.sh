#!/bin/bash

echo "🛑 Stopping Robot Digital Twin System"

# Stop Docker containers
cd ~/robot_project/server
sudo docker-compose down

# Kill ROS2 nodes
pkill -f "ros2 run"
pkill -f "node server.js"

echo "✓ System stopped"