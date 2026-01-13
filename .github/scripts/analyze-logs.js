/**
 * Log Analyzer Script
 * Analyzes telemetry logs and generates debugging reports
 */

const fs = require('fs');
const path = require('path');

// Encryption key (must match telemetry.js)
const ENCRYPTION_KEY = 'CRT_SPACESHIP_LOG_KEY_2024';

function decryptData(encryptedStr) {
    try {
        const decoded = Buffer.from(encryptedStr, 'base64').toString('binary');
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            decrypted += String.fromCharCode(charCode);
        }
        return JSON.parse(decrypted);
    } catch (e) {
        console.error('Decryption failed:', e.message);
        return null;
    }
}

function analyzeLogsFromFile(logsPath) {
    if (!fs.existsSync(logsPath)) {
        console.log('No log file found at:', logsPath);
        return { issues: [], stats: {} };
    }
    
    const encrypted = fs.readFileSync(logsPath, 'utf8');
    const logs = decryptData(encrypted);
    
    if (!logs || !Array.isArray(logs)) {
        console.log('No valid logs to analyze');
        return { issues: [], stats: {} };
    }
    
    return analyzeLogs(logs);
}

function analyzeLogs(logs) {
    const issues = [];
    const stats = {
        totalSessions: new Set(),
        browsers: {},
        devices: {},
        os: {},
        errors: [],
        performanceIssues: [],
        connectionQuality: {}
    };
    
    logs.forEach(log => {
        // Track unique sessions
        if (log.sessionId) {
            stats.totalSessions.add(log.sessionId);
        }
        
        // Analyze snapshots
        if (log.type === 'snapshot' && log.data) {
            const data = log.data;
            
            // Browser stats
            if (data.browser && data.browser.name) {
                const browser = `${data.browser.name} ${data.browser.version || ''}`.trim();
                stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
            }
            
            // Device stats
            if (data.device && data.device.model) {
                stats.devices[data.device.model] = (stats.devices[data.device.model] || 0) + 1;
            }
            
            // OS stats
            if (data.device && data.device.os) {
                stats.os[data.device.os] = (stats.os[data.device.os] || 0) + 1;
            }
            
            // Connection quality
            if (data.network && data.network.connectionQuality) {
                stats.connectionQuality[data.network.connectionQuality] = 
                    (stats.connectionQuality[data.network.connectionQuality] || 0) + 1;
            }
        }
        
        // Collect errors
        if (log.type === 'error') {
            stats.errors.push({
                message: log.message,
                data: log.data,
                timestamp: log.timestamp,
                sessionId: log.sessionId
            });
            
            issues.push({
                type: 'error',
                severity: 'high',
                description: log.message,
                details: log.data,
                occurrences: 1,
                status: 'detected'
            });
        }
        
        // Collect performance issues
        if (log.type === 'performance' && log.message === 'Low FPS detected') {
            stats.performanceIssues.push({
                avgFPS: log.data.averageFPS,
                minFPS: log.data.minFPS,
                timestamp: log.timestamp,
                sessionId: log.sessionId
            });
            
            issues.push({
                type: 'performance',
                severity: 'medium',
                description: `Low FPS detected (avg: ${log.data.averageFPS} FPS)`,
                details: log.data,
                occurrences: 1,
                status: 'detected'
            });
        }
    });
    
    // Convert Set to count
    stats.totalSessions = stats.totalSessions.size;
    
    // Deduplicate and count similar issues
    const deduplicatedIssues = deduplicateIssues(issues);
    
    return { issues: deduplicatedIssues, stats };
}

function deduplicateIssues(issues) {
    const issueMap = new Map();
    
    issues.forEach(issue => {
        const key = `${issue.type}-${issue.description}`;
        if (issueMap.has(key)) {
            const existing = issueMap.get(key);
            existing.occurrences += 1;
        } else {
            issueMap.set(key, { ...issue });
        }
    });
    
    return Array.from(issueMap.values());
}

function generateReport(analysisResult) {
    const { issues, stats } = analysisResult;
    const timestamp = new Date().toISOString();
    
    let report = `# Game Debug Analysis Report\n\n`;
    report += `**Generated:** ${timestamp}\n\n`;
    
    // Statistics Section
    report += `## 📊 Telemetry Statistics\n\n`;
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Sessions | ${stats.totalSessions || 0} |\n`;
    report += `| Total Errors | ${stats.errors?.length || 0} |\n`;
    report += `| Performance Issues | ${stats.performanceIssues?.length || 0} |\n\n`;
    
    // Browser Distribution
    if (Object.keys(stats.browsers || {}).length > 0) {
        report += `### Browser Distribution\n\n`;
        report += `| Browser | Sessions |\n`;
        report += `|---------|----------|\n`;
        Object.entries(stats.browsers).forEach(([browser, count]) => {
            report += `| ${browser} | ${count} |\n`;
        });
        report += `\n`;
    }
    
    // Device Distribution
    if (Object.keys(stats.devices || {}).length > 0) {
        report += `### Device Distribution\n\n`;
        report += `| Device | Sessions |\n`;
        report += `|--------|----------|\n`;
        Object.entries(stats.devices).forEach(([device, count]) => {
            report += `| ${device} | ${count} |\n`;
        });
        report += `\n`;
    }
    
    // OS Distribution
    if (Object.keys(stats.os || {}).length > 0) {
        report += `### Operating System Distribution\n\n`;
        report += `| OS | Sessions |\n`;
        report += `|----|----------|\n`;
        Object.entries(stats.os).forEach(([os, count]) => {
            report += `| ${os} | ${count} |\n`;
        });
        report += `\n`;
    }
    
    // Connection Quality
    if (Object.keys(stats.connectionQuality || {}).length > 0) {
        report += `### Connection Quality Distribution\n\n`;
        report += `| Quality | Sessions |\n`;
        report += `|---------|----------|\n`;
        Object.entries(stats.connectionQuality).forEach(([quality, count]) => {
            report += `| ${quality} | ${count} |\n`;
        });
        report += `\n`;
    }
    
    // Issues Section
    report += `## 🐛 Issues Detected\n\n`;
    
    if (issues.length === 0) {
        report += `✅ No issues detected in the current analysis period.\n\n`;
    } else {
        report += `| # | Type | Severity | Description | Occurrences | Status |\n`;
        report += `|---|------|----------|-------------|-------------|--------|\n`;
        issues.forEach((issue, index) => {
            const severityEmoji = issue.severity === 'high' ? '🔴' : 
                                 issue.severity === 'medium' ? '🟡' : '🟢';
            report += `| ${index + 1} | ${issue.type} | ${severityEmoji} ${issue.severity} | ${issue.description} | ${issue.occurrences} | ${issue.status} |\n`;
        });
        report += `\n`;
    }
    
    // Recommendations
    report += `## 💡 Recommendations\n\n`;
    
    const recommendations = generateRecommendations(issues, stats);
    if (recommendations.length === 0) {
        report += `- No specific recommendations at this time.\n`;
    } else {
        recommendations.forEach(rec => {
            report += `- ${rec}\n`;
        });
    }
    
    return report;
}

function generateRecommendations(issues, stats) {
    const recommendations = [];
    
    // Performance recommendations
    const perfIssues = issues.filter(i => i.type === 'performance');
    if (perfIssues.length > 0) {
        recommendations.push('Consider optimizing the game loop to improve FPS on lower-end devices');
        recommendations.push('Add adaptive quality settings based on device capabilities');
    }
    
    // Error recommendations
    const errorIssues = issues.filter(i => i.type === 'error');
    if (errorIssues.length > 0) {
        recommendations.push('Review and fix JavaScript errors affecting user experience');
        recommendations.push('Add more error boundary handling in the game code');
    }
    
    // Connection quality recommendations
    if (stats.connectionQuality?.poor > 0 || stats.connectionQuality?.fair > 0) {
        recommendations.push('Consider adding offline mode or reducing network dependency');
    }
    
    // Mobile device recommendations
    const mobileDevices = Object.keys(stats.devices || {}).filter(d => 
        d.includes('iPhone') || d.includes('Android') || d.includes('iPad')
    );
    if (mobileDevices.length > 0) {
        recommendations.push('Ensure touch controls are optimized for mobile devices');
    }
    
    return recommendations;
}

// Main execution
const logsPath = process.argv[2] || 'logs/telemetry.enc';
const outputPath = process.argv[3] || 'reports/debug-report.md';

console.log('Analyzing logs...');

// If logs file doesn't exist, create a sample analysis
let result;
if (fs.existsSync(logsPath)) {
    result = analyzeLogsFromFile(logsPath);
} else {
    console.log('No logs file found, generating sample report');
    result = { issues: [], stats: { totalSessions: 0 } };
}

const report = generateReport(result);

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, report);
console.log('Report generated:', outputPath);

// Output for GitHub Actions (using GITHUB_OUTPUT environment file)
const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
    fs.appendFileSync(outputFile, `issues_count=${result.issues.length}\n`);
    fs.appendFileSync(outputFile, `sessions_count=${result.stats.totalSessions}\n`);
}
