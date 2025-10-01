# 📌 Autonomous Campus Guide

## 1. Introduction
The **Autonomous Campus Guide** is a robotic assistant that combines **speech recognition**, **Large Language Models (LLMs)**, **navigation AI**, and **contextual data sources** (maps, FAQs, events) to support students and visitors with navigation and campus information.

---

## 2. Actors & Roles
- **Primary Actor**: Student, newcomer, visitor  
- **System**: Robot assistant (speech recognition, LLM, navigation AI)  
- **Supporting Systems**:
  - **Context Broker (FIWARE NGSI-LD)** → indoor maps, building coordinates  
  - **FAQ Knowledge Base** → structured campus data (cafeteria, events, etc.)  
  - **MCP Servers** → modular AI services (LLM, NavAI, VLM)  
  - **n8n Automation** → orchestrates workflows (update FAQs, fetch events)  

---

## 3. System Workflow (Technology Translation)

### 1. Voice Input
- **Hardware**: Robot microphone  
- **Software**: Whisper, Vosk, Google Speech API  

### 2. LLM Processing
- **Execution**: Local (Jetson Nano) or cloud MCP server  
- **Tasks**:  
  - Detects intent → *navigation / FAQ / small talk*  
  - Queries Context Broker or FAQ DB  

### 3. Workflow Orchestration
- FIWARE ROS Agent bridges **robot ↔ Context Broker**  
- MCP Servers run modular services (**LLM, NavAI, VLM**)  
- n8n handles external integrations (**events, news feeds**)  

### 4. Response Generation
- **Navigation** → NavAI converts path into step-by-step guidance  
- **FAQ** → DB/n8n returns structured info  
- **Small Talk** → LLM generates natural dialogue  

### 5. Voice Output
- **TTS Engines**: Coqui TTS, eSpeak, Amazon Polly  
- **Output**: Robot speakers + optional LCD display  

---

## 4. Role of VLM (Vision-Language Models)
- Identify landmarks visually → *“Cafeteria is the building with red doors”*  
- Confirm destination → *“Here’s the robotics lab entrance”*  
- Aid localization by matching live camera view with the map  

---

## 5. Deployment Modes
- **Fixed Robot (Info Desk)** → stationary, provides voice guidance  
- **Mobile Escort (future)** → physically guides students through halls  

---

## 6. Value
- **Practical** → Easy navigation and info access  
- **Engaging** → Conversational and human-like interaction  
- **Modular** → MCP allows independent upgrades of LLM, NavAI, VLM  
- **Scalable** → FIWARE + n8n enable event/news integration  

---
