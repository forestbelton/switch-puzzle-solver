import { ChangeEvent, useState, MouseEvent } from "react";
import memoizedPuzzle from "./puzzle.json";

type PuzzleMove = {
  xy: number[] | null;
  steps: number;
};

const ALL_PUZZLE_MOVES: Record<string, PuzzleMove> = memoizedPuzzle;

enum Mode {
  EDITING = "EDITING",
  SOLVING = "SOLVING",
}

type BoardCell = 0 | 1;

type BoardRow = [BoardCell, BoardCell, BoardCell];

type Board = [BoardRow, BoardRow, BoardRow];

const EMPTY_BOARD: Board = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

const encode = (board: Board): number => {
  let out = 0;
  for (let y = 2; y >= 0; y--) {
    for (let x = 2; x >= 0; x--) {
      out = (out << 1) | board[y][x];
    }
  }
  return out;
};

const toggle = (
  board: Board,
  x: number,
  y: number,
  neighbors: boolean = false
): Board => {
  const newBoard: Board = [[...board[0]], [...board[1]], [...board[2]]];
  if (!neighbors) {
    newBoard[y][x] = (1 - newBoard[y][x]) as BoardCell;
    return newBoard;
  }
  for (let y1 = 0; y1 <= 2; y1++) {
    for (let x1 = 0; x1 <= 2; x1++) {
      newBoard[y1][x1] = isNeighbor(x, y, x1, y1)
        ? ((1 - newBoard[y1][x1]) as BoardCell)
        : newBoard[y1][x1];
    }
  }
  return newBoard;
};

const isNeighbor = (x0: number, y0: number, x1: number, y1: number): boolean =>
  (x0 == x1 && Math.abs(y0 - y1) <= 1) || (y0 == y1 && Math.abs(x0 - x1) <= 1);

function App() {
  const [mode, setMode] = useState(Mode.EDITING);
  const [board, setBoard] = useState(EMPTY_BOARD);

  const onModeChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setMode(ev.target.value as Mode);
  };

  let nextCell: PuzzleMove | null = null;
  if (mode === Mode.SOLVING) {
    const encoded = encode(board);
    nextCell = ALL_PUZZLE_MOVES[encoded];
    if (nextCell.steps === 0) {
      nextCell = null;
    }
  }

  const onCellChange = (ev: ChangeEvent<HTMLInputElement>) => {
    if (
      typeof ev.target.dataset.x === "undefined" ||
      typeof ev.target.dataset.y === "undefined"
    ) {
      return;
    }

    const x = parseInt(ev.target.dataset.x, 0);
    const y = parseInt(ev.target.dataset.y, 0);

    if (
      mode === Mode.SOLVING &&
      (nextCell === null ||
        nextCell.xy === null ||
        nextCell.xy[0] !== x ||
        nextCell.xy[1] !== y)
    ) {
      return;
    }

    setBoard(toggle(board, x, y, mode === Mode.SOLVING));
  };

  const onResetBoard = (ev: MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    setBoard(EMPTY_BOARD);
    setMode(Mode.EDITING);
  };

  let grid = [];
  for (let y = 0; y < 3; ++y) {
    const row = [];
    for (let x = 0; x < 3; ++x) {
      const hint =
        nextCell !== null &&
        nextCell.xy !== null &&
        x === nextCell.xy[0] &&
        y === nextCell.xy[1];

      row.push(
        <input
          key={x}
          type="checkbox"
          checked={board[y][x] == 1}
          data-x={x}
          data-y={y}
          onChange={onCellChange}
          style={{
            outline: `8px solid ${hint ? "green" : "transparent"}`,
          }}
        />
      );
    }
    grid.push(<div key={y}>{...row}</div>);
  }

  return (
    <div>
      <h1>Switch Puzzle Solver</h1>
      <div className="App-modeSelect">
        <b>Mode:</b>
        <label htmlFor="mode-editing">Editing</label>
        <input
          type="radio"
          id="mode-editing"
          name="mode"
          value="EDITING"
          onChange={onModeChange}
          checked={mode === "EDITING"}
        />
        <label htmlFor="mode-solving">Solving</label>
        <input
          type="radio"
          id="mode-solving"
          name="mode"
          value="SOLVING"
          onChange={onModeChange}
          checked={mode === "SOLVING"}
        />
      </div>
      <div className="App-board">{...grid}</div>
      <button type="button" onClick={onResetBoard}>
        Reset
      </button>
    </div>
  );
}

export default App;
