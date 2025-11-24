# Setting Up the Wiki on GitHub

This repository includes wiki documentation in the `/wiki` folder. To make it accessible as a GitHub Wiki, follow these steps:

## Option 1: Enable GitHub Wiki and Upload

1. **Enable Wiki** in your repository:
   - Go to repository Settings
   - Scroll down to "Features"
   - Check "Wikis"

2. **Clone the Wiki repository**:
   ```bash
   git clone https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-.wiki.git
   cd 3-Bad-day-24-CRT-SPACESHIP-.wiki
   ```

3. **Copy wiki files**:
   ```bash
   cp -r ../3-Bad-day-24-CRT-SPACESHIP-/wiki/* .
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add comprehensive wiki documentation"
   git push origin master
   ```

## Option 2: Manual Wiki Page Creation

1. Go to the Wiki tab in your GitHub repository
2. Click "Create the first page"
3. Copy content from `wiki/Home.md` and paste it
4. Click "Save Page"
5. Repeat for each wiki page:
   - Game-Mechanics.md
   - Code-Architecture.md
   - Performance-Tuning.md
   - Sound-Effects.md
   - Visual-Effects.md
   - Adding-Features.md

## Wiki Pages Included

- **Home**: Main wiki landing page with navigation
- **Game Mechanics**: Detailed gameplay mechanics documentation
- **Code Architecture**: Technical implementation details
- **Performance Tuning**: Optimization guide for different devices
- **Sound Effects**: Web Audio API and procedural audio documentation
- **Visual Effects**: CRT aesthetic and rendering pipeline
- **Adding Features**: Guide for extending the game

## Accessing the Wiki

Once set up, the wiki will be available at:
https://github.com/anacondy/3-Bad-day-24-CRT-SPACESHIP-/wiki

## Note

The wiki files are also available in this repository's `/wiki` folder for offline reference and version control.
