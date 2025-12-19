/**
 * Screenshot Capture Script
 * Captures screenshots of the game for documentation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots(url, outputDir) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for desktop
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Capture start screen
    console.log('Capturing start screen...');
    await page.screenshot({
        path: path.join(outputDir, `start-screen-${timestamp}.png`),
        fullPage: false
    });
    
    // Click start button to begin game
    try {
        await page.click('#start-btn');
        await new Promise(r => setTimeout(r, 2000)); // Wait for game to initialize
        
        // Capture gameplay
        console.log('Capturing gameplay...');
        await page.screenshot({
            path: path.join(outputDir, `gameplay-${timestamp}.png`),
            fullPage: false
        });
        
        // Wait a bit more for action
        await new Promise(r => setTimeout(r, 3000));
        
        // Capture in-action screenshot
        console.log('Capturing in-action...');
        await page.screenshot({
            path: path.join(outputDir, `in-action-${timestamp}.png`),
            fullPage: false
        });
        
    } catch (e) {
        console.log('Could not interact with game:', e.message);
    }
    
    // Capture mobile viewport
    await page.setViewport({ width: 375, height: 812 }); // iPhone X dimensions
    await page.reload({ waitUntil: 'networkidle0' });
    
    console.log('Capturing mobile view...');
    await page.screenshot({
        path: path.join(outputDir, `mobile-view-${timestamp}.png`),
        fullPage: false
    });
    
    await browser.close();
    console.log('Screenshots saved to:', outputDir);
    
    return {
        desktop: `start-screen-${timestamp}.png`,
        gameplay: `gameplay-${timestamp}.png`,
        action: `in-action-${timestamp}.png`,
        mobile: `mobile-view-${timestamp}.png`
    };
}

// Main execution
const gameUrl = process.argv[2] || 'file://' + path.resolve(__dirname, '../../index.html');
const outputDir = process.argv[3] || 'screenshots';

captureScreenshots(gameUrl, outputDir)
    .then(files => {
        console.log('Captured files:', files);
        process.exit(0);
    })
    .catch(err => {
        console.error('Screenshot capture failed:', err);
        process.exit(1);
    });
