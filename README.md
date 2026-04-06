# DP Learning Lab

An interactive web app that teaches dynamic programming visually. Watch recursion trees build up, see where the wasted work is, then flip on memoization and watch it collapse.

## What it does

Each problem walks you through the same progression:

1. **See brute force** — step through a recursion tree and spot the duplicate calls (red nodes)
2. **Turn on memoization** — watch branches get pruned and a memo table fill up in real time
3. **Learn the vocabulary** — concepts like "overlapping subproblems" appear after you've already seen what they mean
4. **Write the code** — solve it yourself in JS or Python with instant test feedback

## Problems

- Fibonacci Numbers
- Climbing Stairs
- Grid Paths
- Coin Change
- 0/1 Knapsack

## Running locally

Requires [Bun](https://bun.sh):

```bash
bun install
bun dev
```

Then open http://localhost:5173.

## Stack

- React + TypeScript
- Tailwind CSS v4
- Vite
- CodeMirror (code editor)
- Pyodide (Python execution in browser, loaded on demand)

## Project structure

```
src/
  components/     UI components (TreeLesson, RecursionTree, CodePanel, etc.)
  problems/       Tree builders for each DP problem
  problems/configs/  Problem configs (code, test cases, concept text)
  engine/         Code execution (Web Worker for JS, Pyodide for Python)
```
