# Screenshots Directory

This directory contains automatically captured screenshots of the game.

## Contents

Screenshots are captured during each automated update cycle:

- `start-screen-{timestamp}.png` - Game start screen
- `gameplay-{timestamp}.png` - Active gameplay
- `in-action-{timestamp}.png` - Game in action with enemies
- `mobile-view-{timestamp}.png` - Mobile viewport screenshot

## Purpose

Screenshots are captured to:
- Document visual changes in each update
- Track visual regressions
- Provide reference for bug reports
- Show game state across different viewports

## Generation

Screenshots are automatically captured by the `game-update.yml` workflow using Puppeteer.

## Note

Old screenshots may be cleaned up periodically to save repository space.
