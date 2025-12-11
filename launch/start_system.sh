#!/bin/bash

echo "🚀 Starting Robot Digital Twin System"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Start Context Broker
echo -e "${BLUE}Starting Context Broker...${NC}"
cd ~/robot_project/server
sudo docker-compose up -d
sleep 3

# Check if Context Broker is running
if curl -s http://localhost:1026/version > /dev/null; then
    echo -e "${GREEN}✓ Context Broker running${NC}"
else
    echo "✗ Context Broker failed to start"
    exit 1
fi

# Source ROS2
source /opt/ros/humble/setup.bash
source ~/robot_project/ros2_ws/install/setup.bash

# Start ROS2 nodes in new terminal windows
echo -e "${BLUE}Starting ROS2 nodes...${NC}"

# Function to run command in new terminal
run_in_terminal() {
    gnome-terminal --tab --title="$1" -- bash -c "source /opt/ros/humble/setup.bash; source ~/robot_project/ros2_ws/install/setup.bash; $2; exec bash"
}

# Start NGSI Agent
run_in_terminal "NGSI Agent" "ros2 run ngsi_agent agent"
sleep 2

# Start Test Publisher (simulates robot)
run_in_terminal "Test Publisher" "ros2 run robot_core test_publisher"
sleep 1

# Start Dashboard
echo -e "${BLUE}Starting Dashboard...${NC}"
gnome-terminal --tab --title="Dashboard" -- bash -c "cd ~/robot_project/dashboard && node server.js; exec bash"
sleep 2

echo ""
echo -e "${GREEN}✓ System started successfully!${NC}"
echo ""
echo "Access points:"
echo "  Dashboard: http://localhost:3000"
echo "  Context Broker: http://localhost:1026"
echo ""
echo "To stop the system, run: ./stop_system.sh"