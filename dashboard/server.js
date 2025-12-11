// server.js - Dashboard backend server

const express = require('express');
const axios = require('axios');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Context Broker configuration
const CONTEXT_BROKER_URL = 'http://localhost:1026';
const ROBOT_ID = 'urn:ngsi-ld:Robot:robot001';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API endpoint to get robot state
app.get('/api/robot/state', async (req, res) => {
    try {
        const response = await axios.get(
            `${CONTEXT_BROKER_URL}/ngsi-ld/v1/entities/${ROBOT_ID}`,
            {
                headers: {
                    'Accept': 'application/ld+json'
                }
            }
        );
        
        // Transform NGSI-LD format to simpler format for frontend
        const robotData = transformNGSIData(response.data);
        res.json(robotData);
        
    } catch (error) {
        console.error('Error fetching robot state:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch robot state',
            details: error.message 
        });
    }
});

// API endpoint to get historical data (if implemented)
app.get('/api/robot/history', async (req, res) => {
    // This would require a time-series database
    // For now, return mock data
    res.json({
        battery: generateHistoricalData(24),
        position: generatePositionHistory(24)
    });
});

// Transform NGSI-LD format to frontend-friendly format
function transformNGSIData(ngsildData) {
    return {
        id: ngsildData.id,
        type: ngsildData.type,
        name: ngsildData.name?.value || 'Robot',
        position: {
            x: ngsildData.position?.value?.coordinates?.[0] || 0,
            y: ngsildData.position?.value?.coordinates?.[1] || 0,
            theta: ngsildData.theta?.value || 0
        },
        velocity: ngsildData.velocity?.value || { linear: 0, angular: 0 },
        battery: ngsildData.battery?.value || 0,
        status: ngsildData.status?.value || 'unknown',
        currentTask: ngsildData.currentTask?.value || 'none',
        lastSpeech: ngsildData.lastSpeech?.value || '',
        obstacles: ngsildData.obstacles?.value || [],
        lastUpdate: ngsildData.lastUpdate?.value?.['@value'] || new Date().toISOString()
    };
}

// Generate mock historical data for demo
function generateHistoricalData(hours) {
    const data = [];
    const now = Date.now();
    
    for (let i = hours; i >= 0; i--) {
        data.push({
            timestamp: new Date(now - i * 3600000).toISOString(),
            value: 100 - (hours - i) * 2 + Math.random() * 5
        });
    }
    
    return data;
}

function generatePositionHistory(hours) {
    const data = [];
    const now = Date.now();
    
    for (let i = hours; i >= 0; i--) {
        const angle = (i / hours) * 2 * Math.PI;
        data.push({
            timestamp: new Date(now - i * 3600000).toISOString(),
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        });
    }
    
    return data;
}

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard server running at http://localhost:${PORT}`);
    console.log(`📡 Connected to Context Broker: ${CONTEXT_BROKER_URL}`);
});

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('✓ New WebSocket connection');
    
    // Send initial data
    fetchAndSendRobotState(ws);
    
    // Send updates every 500ms
    const interval = setInterval(() => {
        fetchAndSendRobotState(ws);
    }, 500);
    
    ws.on('close', () => {
        console.log('✗ WebSocket connection closed');
        clearInterval(interval);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(interval);
    });
});

async function fetchAndSendRobotState(ws) {
    try {
        const response = await axios.get(
            `${CONTEXT_BROKER_URL}/ngsi-ld/v1/entities/${ROBOT_ID}`,
            {
                headers: { 'Accept': 'application/ld+json' },
                timeout: 2000
            }
        );
        
        const robotData = transformNGSIData(response.data);
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'robot_update',
                data: robotData,
                timestamp: new Date().toISOString()
            }));
        }
    } catch (error) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to fetch robot state'
            }));
        }
    }
}

console.log('🤖 Robot Digital Twin Dashboard');
console.log('================================');
console.log(`HTTP Server: http://localhost:${PORT}`);
console.log(`WebSocket: ws://localhost:${PORT}`);
console.log(`Context Broker: ${CONTEXT_BROKER_URL}`);