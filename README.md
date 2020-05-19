# Best Treasure Path Calculator
Creation of a TSP-Solver for Atlas. Created by [Globy](https://github.com/LudovicLemaire) then upgraded by [Simonsays095](https://github.com/Simonsays095). Accessible at [globy.dev](https://globy.dev/treasurePath).

## How to use
Simply click on the node you need to go (or add them directly in the Select), starting by the one you will start from.
Remember that start/end point is the same.

The calculator works whatever the size of the map (capped to 15x15 as in official, as no unofficial go higher, but can go higher if you want to).

**Preview**

![screenshot](https://raw.githubusercontent.com/LudovicLemaire/TSP-solver/master/git_images/TSP-Solver.gif)


## Overview
The calcultor finds the shortest path to travel between multiple points, in a flat torus world (if you go to the top of the map, you will be teleported to the bottom (same for East/West)).

The calculation is an Heuristic Local Search, mixed with Monte Carlo algo.

Calculations are made with JS, while UI is made with ReactJs and rSuite/materialUi (graphic component library for button, slider, notification and such). The path is draw with Canvas.

Calculation take around 70ms for 100 points, and less than a second for 225 points.

The calculation doesn't always give the actual best solution, but a really close one. The margin is ~4% from the best solution.
