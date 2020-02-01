import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Cell(props) {

  let className = props.cell.valid ? "normal" : "invalid";
  className += props.cell.correct ? "" : " incorrect";
  className += props.cell.locked ? " locked" : "";
  return (
    <td className={className}>
        {props.cell.locked ?
         props.cell.value :
         <input
           maxLength="1"
           size="1"
           type="text"
           value={props.cell.value === 0 ? "" : props.cell.value}
           onChange={(e) => (
             props.numInput(props.rowNum, props.colNum, e.target.value)
           )}
         />}
    </td>
  )
}

function Grid(props) {
  return (
    <div>
    <table>
    <tbody>
      {props.puzzle.map((row, rowNum) => (
        <tr key={rowNum}>
          {row.map((cell, colNum) => (
            <Cell
              key={cell.id}
              rowNum={rowNum}
              colNum={colNum}
              cell={cell}
              numInput={props.numInput}
            />))}
        </tr>
      ))}
    </tbody>
    </table>
    </div>
  )
}

function Sidebar(props) {
  return (
    <div className="Sidebar">
      <button onClick={props.display}>Display</button>
      <button onClick={props.isCorrect}>Check if correct</button>
      <button onClick={props.isValid}>Check if valid</button>
      <button onClick={props.solve}>Solve!</button>
      <button onClick={props.undo}>Undo last entry</button>
      <button onClick={props.reset}>Reset puzzle</button>
      <div>{props.puzzleWon ? <h3>Puzzle Soved!</h3> : <></>}
      </div>
    </div>
  )
}

function PuzzleContainer(props) {

  const [puzzle, setPuzzle] = useState(() => {
    let puzzle = new Array(props.dim);
    for (let row = 0; row < props.dim; row++) {
      puzzle[row] = new Array(props.dim);
      for (let col = 0; col < props.dim; col++) {
        puzzle[row][col] = {
          id: row.toString() + col.toString(),
          value: props.givens[row][col],
          solution: props.solution[row][col], 
          given: props.givens[row][col] ? true : false,
          locked: props.givens[row][col] ? true : false,
          valid: true,
          correct: true,
        };
      }
    }
    return puzzle;
  });

  const [history, setHistory] = useState([]);
  const [puzzleWon, setPuzzleWon] = useState(false);

  function undo(){
    if (history.length === 0) {
      return;
    }
    let lastMove = history[history.length - 1];

    setHistory(history.slice(0, history.length - 1));
    setPuzzle(puzzle => {
      let rowNum = lastMove.row;
      let colNum = lastMove.col;
      puzzle[rowNum][colNum].value = 0;
      puzzle[rowNum][colNum].locked = false;
      setPuzzleWon(isPuzzleWon(puzzle));
      return puzzle.slice();
    });
    validatePuzzle();
    checkPuzzle();
  }

  function reset() {
    setHistory([]);
    setPuzzle(puzzle => {
      for (let row = 0; row < props.dim; row++) {
        for (let col = 0; col < props.dim; col++) {
          if (!puzzle[row][col].given) {
            puzzle[row][col].value = 0;
            puzzle[row][col].locked = false;
          }
          puzzle[row][col].valid = true;
          puzzle[row][col].correct = true;
        }
      }
      return puzzle.slice();
    });
    setPuzzleWon(isPuzzleWon());
  }

  function isRowValid(rowNum) {
    let counts = new Array(props.dim).fill(0);
    for (let colNum = 0; colNum < props.dim; colNum++) {
      let num = puzzle[rowNum][colNum].value;
      if (num) {
        if (counts[num - 1]) {
          return false;
        }
        counts[num - 1] = 1;
      }
    }
    return true;
  }

  function isColValid(colNum) {
    let counts = new Array(props.dim).fill(0);
    for (let rowNum = 0; rowNum < props.dim; rowNum++) {
      let num = puzzle[rowNum][colNum].value;
      if (num) {
        if (counts[num - 1]) {
          return false;
        }
        counts[num - 1] = 1;
      }
    }
    return true;
  }

  function isBoxValid(boxNum) {
    let counts = new Array(props.dim).fill(0);
    for (let boxRowNum = 0; boxRowNum < props.boxHeight; boxRowNum++) {
      for (let boxColNum = 0; boxColNum < props.boxWidth; boxColNum++) {
        let rowNum = boxRowNum +
                      (props.boxHeight * Math.floor(boxNum / props.boxHeight));
        let colNum = boxColNum +
                      (props.boxWidth * (boxNum % props.boxWidth));
        let num = puzzle[rowNum][colNum].value;
        if (num) {
          if (counts[num - 1]) {
            return false;
          }
          counts[num - 1] = 1;
        }
      }
    }
    return true;
  }

  function getBoxNum(rowNum, colNum) {
    let h = Math.floor(rowNum / props.boxHeight) * props.boxHeight;
    let w = Math.floor(colNum / props.boxWidth);
    return h + w;
  }

  function validatePuzzle() {
    setPuzzle(puzzle => {
      let validRows = new Array(props.dim);
      let validCols = new Array(props.dim);
      let validBoxes = new Array(props.dim);
      for (let i = 0; i < props.dim; i++) {
        validRows[i] = isRowValid(i);
        validCols[i] = isColValid(i);
        validBoxes[i] = isBoxValid(i);
      }
      for (let rowNum = 0; rowNum < props.dim; rowNum++) {
        for (let colNum = 0; colNum < props.dim; colNum++) {
          let boxNum = getBoxNum(rowNum, colNum);
          puzzle[rowNum][colNum].valid = validRows[rowNum] &&
                                         validCols[colNum] &&
                                         validBoxes[boxNum];
        }
      }
    return puzzle.slice();
    })
  }

  function checkPuzzle() {
    setPuzzle(puzzle => {
      for (let row = 0; row < props.dim; row++) {
        for (let col = 0; col < props.dim; col++) {
          puzzle[row][col].correct = true;
          if (puzzle[row][col].value === puzzle[row][col].solution) {
            puzzle[row][col].correct = true;
            puzzle[row][col].locked = true;
          } else if (puzzle[row][col].value) {
            puzzle[row][col].correct = false;
          }
        }
      }
      return puzzle.slice();
    })
  }

  function isPuzzleWon(puzzle) {
    for (let row = 0; row < props.dim; row++) {
      for (let col = 0; col < props.dim; col++) {
        if (puzzle[row][col].value !== puzzle[row][col].solution) {
          return false;
        }
      }
    }
    return true;
  }

  function clue() {
    return;
  }

  function numInput(rowNum, colNum, val) {
    setPuzzle(puzzle => {
      puzzle[rowNum][colNum].value = Number(val);
      setPuzzleWon(isPuzzleWon(puzzle));
      return puzzle.slice();})
    setHistory(history.concat({row: rowNum, col: colNum, value: val}))
    validatePuzzle();
    checkPuzzle();
  }

  return (
    <div className="PuzzleContainer">
      <Grid
        puzzle={puzzle}
        numInput={numInput}
      />
      <Sidebar
        clue={clue}
        display={() => (console.log(puzzle))}
        isCorrect={checkPuzzle}
        isValid={validatePuzzle}
        undo={undo}
        reset={reset}
        puzzleWon={puzzleWon}
      />
    </div>
  );
}


const GIVENS = [
  [0,0,0,2,0,1,7,5,0],
  [7,1,0,0,0,3,0,4,0],
  [6,0,4,8,0,0,1,0,0],
  [5,2,0,1,0,6,3,0,4],
  [0,0,0,0,0,0,0,0,0],
  [8,0,6,3,0,7,0,9,1],
  [0,0,1,0,0,5,4,0,9],
  [0,3,0,9,0,0,0,6,7],
  [0,6,7,4,0,2,0,0,0],
];

const SOLUTION = [
  [3,9,8,2,4,1,7,5,6],
  [7,1,2,6,5,3,9,4,8],
  [6,5,4,8,7,9,1,2,3],
  [5,2,9,1,8,6,3,7,4],
  [1,7,3,5,9,4,6,8,2],
  [8,4,6,3,2,7,5,9,1],
  [2,8,1,7,6,5,4,3,9],
  [4,3,5,9,1,8,2,6,7],
  [9,6,7,4,3,2,8,1,5],
];

/* const ALMOST = [
 *   [3,9,8,2,4,1,7,5,6],
 *   [7,1,2,6,5,3,9,4,8],
 *   [6,5,4,8,7,9,1,2,3],
 *   [5,2,9,1,8,6,3,7,4],
 *   [1,7,3,5,9,4,6,8,2],
 *   [8,4,6,3,2,7,5,9,1],
 *   [2,8,1,7,6,5,4,3,9],
 *   [4,3,5,9,1,8,2,6,7],
 *   [0,6,7,4,3,2,8,1,5],
 * ]; */

const BOXWIDTH = 3;
const BOXHEIGHT = 3;

ReactDOM.render(<PuzzleContainer
                  givens={GIVENS}
                  solution={SOLUTION}
                  boxWidth={BOXWIDTH}
                  boxHeight={BOXHEIGHT}
                  dim={BOXHEIGHT * BOXWIDTH}
                />,
                document.getElementById('root'));

