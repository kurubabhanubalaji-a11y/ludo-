# 🎲 Ludo Master (4 Colors Edition)

A modern, responsive, feature-packed Ludo board game built with HTML5, CSS3, and JavaScript featuring the four custom requested colors: **Purple**, **Green**, **Yellow**, and **Black**.

---

## 🎨 The 4 Player Colors

- **Purple (Top-Left Base)**: Starting square at row 7, col 2.
- **Green (Top-Right Base)**: Starting square at row 2, col 9.
- **Yellow (Bottom-Right Base)**: Starting square at row 9, col 14.
- **Black (Bottom-Left Base)**: Starting square at row 14, col 7.

---

## 🚀 How to Run & Play

### Option 1: Double-click or Run the Launcher Script
In your terminal:
```bash
cd ~/Desktop/ludo
./run_game.sh
```

### Option 2: Open directly in your Web Browser
Simply open `index.html` in any web browser (Firefox, Chrome, Edge, Safari):
```bash
xdg-open ~/Desktop/ludo/index.html
# or
firefox ~/Desktop/ludo/index.html
```

### Option 3: Local Python HTTP Server
```bash
cd ~/Desktop/ludo
python3 -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## ✨ Features

- **Accurate 15×15 International Ludo Grid**: Complete with 52 perimeter steps, 4 colored home stretches of 5 squares each, 4 home bases, and the converging center home finish zone.
- **Authentic Rules & Mechanics**:
  - Roll a **6** to bring pawns out from the base to your starting square.
  - Rolling a **6** gives a **Bonus Roll** (three consecutive 6's forfeits turn).
  - Capturing an opponent's token sends it back to base and awards a **Bonus Roll**.
  - Reaching Home awards a **Bonus Roll**.
  - **8 Safe Stars (★)**: 4 player start squares + 4 intermediate star squares where pawns cannot be captured.
  - Exact roll required to enter the Center Home.
- **3D Animated Rolling Dice**: Real CSS 3D cube with dot pips that spins realistically on roll.
- **Step-by-Step Hopping Token Animations**: Smooth animated movement tile by tile with hop sound effects.
- **Multi-Pawn Stacking**: Clean clustering when multiple tokens share a safe square or track tile.
- **Integrated AI Bots**: Intelligent decision-making prioritizing captures, finishing home, escaping threats, and unlocking base pawns.
- **Flexible Game Modes**:
  - **Solo**: You (Purple) vs 3 AI Bots (Green, Yellow, Black)
  - **Pass & Play**: 4 Human players on the same screen
  - **2 Players**: Purple vs Yellow (head-to-head)
  - **Bot Battle**: Watch all 4 AI bots play against each other
- **Built-in Web Audio API**: Realistic synthesized sound effects for dice rolls, token hops, captures, safe stars, and win fanfare without external audio files.
- **Celebration Effects**: Confetti canvas burst and podium modal upon victory.
- **Keyboard Shortcuts**:
  - `Space`: Roll dice
  - `Rules` / `Player Settings` / `Speed (1x / 2x)` / `Sound Toggle` buttons in header.

---

## 📁 File Structure

```
~/Desktop/ludo/
├── index.html       # Game structure, modals, 3D dice, and HUD
├── style.css        # Responsive styling, board grid, 3D animations, color themes
├── game.js          # Game logic engine, AI algorithms, sound synthesizer, animations
├── run_game.sh      # 1-click executable launcher script
└── README.md        # Documentation and rules
```
# ludo-
# ludo-
