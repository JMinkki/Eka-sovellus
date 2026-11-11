# Cube Twist

A 3D twisty-cube puzzle (2×2 to 5×5) that runs in the browser. Open `index.html` in any modern browser.

- Drag a face to turn a layer; drag empty space to rotate the view; scroll to zoom.
- Keys: U D L R F B M E S (Shift = counter-clockwise), Ctrl+Z to undo.
- Scramble starts a timed solve; best times are saved per cube size.

## Solver

- **Solve** solves the cube from whatever position it is in and animates the solution.
  - 3×3: two-phase (Kociemba-style) algorithm, about 20 moves. The first solve builds lookup tables (under a second).
  - 2×2: optimal solution (11 moves or fewer).
  - 4×4 and 5×5: replays your turns since the last reset backwards (no true solver yet).
- **Hint** marks the next move on the cube: the layer to turn is outlined and a ring of arrows shows the direction. It disappears when you make a turn.
- **Start from**: type a position as moves (e.g. `R U R' U' F2`, or `2R` for an inner layer on bigger cubes) and press Apply.
