/**
 * Game Telemetry & Device Logging System
 * 
 * Collects device information, browser details, and internet speed
 * for debugging and optimization purposes. Data is encrypted before storage.
 */

const GameTelemetry = (function() {
    'use strict';

    // Encryption key for basic obfuscation (XOR-based encryption)
    const ENCRYPTION_KEY = 'CRT_SPACESHIP_LOG_KEY_2024';
    const LOG_STORAGE_KEY = 'crt_spaceship_logs';
    const MAX_LOGS = 100;
    const SESSION_ID = generateSessionId();

    /**
     * Generate a unique session identifier
     */
    function generateSessionId() {
        return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * XOR-based encryption for log data
     */
    function encryptData(data) {
        const jsonStr = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < jsonStr.length; i++) {
            const charCode = jsonStr.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            encrypted += String.fromCharCode(charCode);
        }
        return btoa(encrypted);
    }

    /**
     * Decrypt XOR-encrypted data
     */
    function decryptData(encryptedStr) {
        try {
            const decoded = atob(encryptedStr);
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
                decrypted += String.fromCharCode(charCode);
            }
            return JSON.parse(decrypted);
        } catch (e) {
            console.error('Failed to decrypt log data:', e);
            return null;
        }
    }

    /**
     * Get device model/platform information
     */
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceModel = 'Unknown Device';
        let deviceType = 'desktop';
        let os = 'Unknown OS';

        // Detect OS
        if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
        else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
        else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
        else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
        else if (ua.includes('Mac OS X')) {
            const match = ua.match(/Mac OS X (\d+[._]\d+)/);
            os = match ? 'macOS ' + match[1].replace('_', '.') : 'macOS';
        }
        else if (ua.includes('Android')) {
            const match = ua.match(/Android (\d+(\.\d+)?)/);
            os = match ? 'Android ' + match[1] : 'Android';
            deviceType = 'mobile';
        }
        else if (ua.includes('iPhone') || ua.includes('iPad')) {
            const match = ua.match(/OS (\d+_\d+)/);
            os = match ? 'iOS ' + match[1].replace('_', '.') : 'iOS';
            deviceType = ua.includes('iPad') ? 'tablet' : 'mobile';
        }
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('CrOS')) os = 'Chrome OS';

        // Detect device model
        if (ua.includes('iPhone')) {
            deviceModel = 'Apple iPhone';
        } else if (ua.includes('iPad')) {
            deviceModel = 'Apple iPad';
        } else if (ua.includes('Android')) {
            // Try to extract Android device model
            const match = ua.match(/;\s*([^;)]+)\s*Build/);
            if (match) {
                deviceModel = match[1].trim();
            } else {
                deviceModel = 'Android Device';
            }
        } else if (ua.includes('Mac')) {
            deviceModel = 'Apple Mac';
        } else if (ua.includes('Windows')) {
            deviceModel = 'Windows PC';
        } else if (ua.includes('Linux')) {
            deviceModel = 'Linux PC';
        }

        return {
            model: deviceModel,
            type: deviceType,
            os: os,
            userAgent: ua,
            platform: navigator.platform || 'Unknown',
            vendor: navigator.vendor || 'Unknown',
            language: navigator.language || 'en',
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === '1',
            touchPoints: navigator.maxTouchPoints || 0
        };
    }

    /**
     * Get browser information
     */
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName = 'Unknown Browser';
        let browserVersion = 'Unknown';

        // Detect browser name and version
        if (ua.includes('Firefox/')) {
            browserName = 'Firefox';
            const match = ua.match(/Firefox\/(\d+(\.\d+)?)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('Edg/')) {
            browserName = 'Microsoft Edge';
            const match = ua.match(/Edg\/(\d+(\.\d+)?)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('Chrome/')) {
            browserName = 'Google Chrome';
            const match = ua.match(/Chrome\/(\d+(\.\d+)?)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browserName = 'Safari';
            const match = ua.match(/Version\/(\d+(\.\d+)?)/);
            if (match) browserVersion = match[1];
        } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
            browserName = 'Opera';
            const match = ua.match(/(?:OPR|Opera)\/(\d+(\.\d+)?)/);
            if (match) browserVersion = match[1];
        }

        return {
            name: browserName,
            version: browserVersion,
            online: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: navigator.deviceMemory || 'Unknown',
            connectionType: getConnectionType()
        };
    }

    /**
     * Get connection type using Network Information API
     */
    function getConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false,
                type: connection.type || 'unknown'
            };
        }
        return { effectiveType: 'unknown', downlink: 0, rtt: 0, saveData: false, type: 'unknown' };
    }

    /**
     * Measure internet speed using small test downloads
     */
    async function measureInternetSpeed() {
        const speeds = {
            downloadSpeed: 0,
            latency: 0,
            connectionQuality: 'unknown'
        };

        try {
            // Use a small, cacheable resource to measure latency
            const startTime = performance.now();
            
            // Create a unique URL to bypass cache
            const testUrl = 'data:text/plain;base64,' + btoa('speed test ' + Date.now());
            
            // Measure time to create and resolve a small blob
            const blob = new Blob([new ArrayBuffer(1024 * 10)]); // 10KB test
            const reader = new FileReader();
            
            const readPromise = new Promise((resolve) => {
                reader.onloadend = () => resolve();
                reader.readAsArrayBuffer(blob);
            });
            
            await readPromise;
            const endTime = performance.now();
            
            speeds.latency = Math.round(endTime - startTime);

            // Estimate based on Network Information API if available
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                speeds.downloadSpeed = connection.downlink || 0;
                
                // Classify connection quality
                const effectiveType = connection.effectiveType;
                if (effectiveType === '4g') {
                    speeds.connectionQuality = 'excellent';
                } else if (effectiveType === '3g') {
                    speeds.connectionQuality = 'good';
                } else if (effectiveType === '2g') {
                    speeds.connectionQuality = 'fair';
                } else if (effectiveType === 'slow-2g') {
                    speeds.connectionQuality = 'poor';
                } else {
                    speeds.connectionQuality = 'unknown';
                }
            } else {
                // Fallback classification based on latency
                if (speeds.latency < 50) {
                    speeds.connectionQuality = 'excellent';
                } else if (speeds.latency < 100) {
                    speeds.connectionQuality = 'good';
                } else if (speeds.latency < 200) {
                    speeds.connectionQuality = 'fair';
                } else {
                    speeds.connectionQuality = 'poor';
                }
            }
        } catch (e) {
            console.warn('Speed test failed:', e);
        }

        return speeds;
    }

    /**
     * Get screen and display information
     */
    function getScreenInfo() {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: screen.orientation ? screen.orientation.type : 'unknown',
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    }

    /**
     * Get WebGL capabilities
     */
    function getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return { supported: false, renderer: 'Unknown', vendor: 'Unknown' };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            supported: true,
            renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            version: gl.getParameter(gl.VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
        };
    }

    /**
     * Performance metrics collection
     */
    function getPerformanceMetrics() {
        const metrics = {
            fps: 0,
            frameTime: 0,
            memory: null
        };

        // Memory info (Chrome only)
        if (performance.memory) {
            metrics.memory = {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024))
            };
        }

        return metrics;
    }

    /**
     * Log game events (errors, warnings, performance issues)
     */
    function logEvent(type, message, data = {}) {
        const logEntry = {
            sessionId: SESSION_ID,
            timestamp: new Date().toISOString(),
            type: type, // 'error', 'warning', 'performance', 'event', 'debug'
            message: message,
            data: data,
            url: window.location.href
        };

        storeLogs([logEntry]);
        return logEntry;
    }

    /**
     * Store logs in localStorage (encrypted)
     */
    function storeLogs(newLogs) {
        try {
            let existingLogs = [];
            const stored = localStorage.getItem(LOG_STORAGE_KEY);
            
            if (stored) {
                const decrypted = decryptData(stored);
                if (decrypted && Array.isArray(decrypted)) {
                    existingLogs = decrypted;
                }
            }

            // Add new logs
            existingLogs = existingLogs.concat(newLogs);

            // Keep only the latest MAX_LOGS entries
            if (existingLogs.length > MAX_LOGS) {
                existingLogs = existingLogs.slice(-MAX_LOGS);
            }

            // Encrypt and store
            const encrypted = encryptData(existingLogs);
            localStorage.setItem(LOG_STORAGE_KEY, encrypted);
        } catch (e) {
            console.error('Failed to store logs:', e);
        }
    }

    /**
     * Get all stored logs (decrypted)
     */
    function getLogs() {
        try {
            const stored = localStorage.getItem(LOG_STORAGE_KEY);
            if (stored) {
                return decryptData(stored) || [];
            }
        } catch (e) {
            console.error('Failed to retrieve logs:', e);
        }
        return [];
    }

    /**
     * Clear all stored logs
     */
    function clearLogs() {
        try {
            localStorage.removeItem(LOG_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear logs:', e);
        }
    }

    /**
     * Export logs as JSON (for workflow processing)
     */
    function exportLogs() {
        const logs = getLogs();
        return JSON.stringify(logs, null, 2);
    }

    /**
     * Create a full device snapshot for debugging
     */
    async function createDeviceSnapshot() {
        const speed = await measureInternetSpeed();
        
        const snapshot = {
            sessionId: SESSION_ID,
            timestamp: new Date().toISOString(),
            device: getDeviceInfo(),
            browser: getBrowserInfo(),
            screen: getScreenInfo(),
            webgl: getWebGLInfo(),
            performance: getPerformanceMetrics(),
            network: speed,
            gameVersion: '1.0.0'
        };

        // Log the snapshot
        logEvent('snapshot', 'Device snapshot created', snapshot);
        
        return snapshot;
    }

    /**
     * Monitor FPS and log if it drops below threshold
     */
    let fpsHistory = [];
    let lastFrameTime = performance.now();
    
    function monitorFPS() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;
        
        const fps = Math.round(1000 / delta);
        fpsHistory.push(fps);
        
        // Keep last 60 frames
        if (fpsHistory.length > 60) {
            fpsHistory.shift();
        }
        
        // Calculate average FPS
        const avgFPS = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
        
        // Log if FPS drops below 30
        if (avgFPS < 30 && fpsHistory.length >= 30) {
            logEvent('performance', 'Low FPS detected', { 
                averageFPS: avgFPS, 
                minFPS: Math.min(...fpsHistory),
                maxFPS: Math.max(...fpsHistory)
            });
            fpsHistory = []; // Reset to avoid flooding logs
        }
        
        return avgFPS;
    }

    /**
     * Capture error events globally
     */
    function setupErrorCapture() {
        window.addEventListener('error', function(event) {
            logEvent('error', event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', function(event) {
            logEvent('error', 'Unhandled Promise Rejection', {
                reason: event.reason ? event.reason.toString() : 'Unknown'
            });
        });
    }

    /**
     * Initialize telemetry on page load
     */
    async function init() {
        setupErrorCapture();
        
        // Create initial device snapshot
        const snapshot = await createDeviceSnapshot();
        
        // Log session start
        logEvent('event', 'Session started', {
            referrer: document.referrer,
            url: window.location.href
        });

        console.log('GameTelemetry initialized. Session ID:', SESSION_ID);
        
        return snapshot;
    }

    /**
     * Log game-specific events
     */
    function logGameEvent(eventName, eventData = {}) {
        return logEvent('event', eventName, eventData);
    }

    /**
     * Log performance metrics
     */
    function logPerformance(metricName, value, unit = '') {
        return logEvent('performance', metricName, { value, unit });
    }

    // Public API
    return {
        init: init,
        logEvent: logEvent,
        logGameEvent: logGameEvent,
        logPerformance: logPerformance,
        getLogs: getLogs,
        exportLogs: exportLogs,
        clearLogs: clearLogs,
        monitorFPS: monitorFPS,
        getDeviceInfo: getDeviceInfo,
        getBrowserInfo: getBrowserInfo,
        measureInternetSpeed: measureInternetSpeed,
        createDeviceSnapshot: createDeviceSnapshot,
        getSessionId: function() { return SESSION_ID; },
        encryptData: encryptData,
        decryptData: decryptData
    };
})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GameTelemetry.init());
} else {
    GameTelemetry.init();
}
