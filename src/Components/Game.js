import React from "react";

const Square = (props) => {
  return (
    <button className={`square ${props.classNameProp}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
};

const Board = (props) => {
  const createClassName = (i) => {
    const [a, b, c] = props.winningSquares;
    if (!(a === null)) {
      return i === a || i === b || i === c
        ? "winning-square"
        : "not-winning-square";
    }
    return "";
  };

  const renderSquare = (i) => {
    return (
      <Square
        value={props.board[i]}
        onClick={() => props.onClick(i)}
        classNameProp={`${createClassName(i)}`}
        key={i}
      />
    );
  };

  const collectSquares = (row) => {
    let rowSquares = [];

    for (let j = 0; j < 3; j++) {
      rowSquares.push(renderSquare(row + j));
    }

    return rowSquares;
  };

  const collectRows = () => {
    let boardRow = [];

    for (let row = 0; row < 3; row++) {
      boardRow.push(
        <div className="board-row" key={row}>
          {collectSquares(row < 1 ? row : row < 2 ? row + 2 : row + 4)}
        </div>
      );
    }

    return boardRow;
  };

  return (
    <div className="board">
      {collectRows()}
      {/* <div className="board-row row-top">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row row-middle">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row row-bottom">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div> */}
    </div>
  );
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          board: Array(9).fill(null),
          location: {
            col: null,
            row: null,
          },
        },
      ],
      xIsNext: true,
      stepNumber: 0,
    };
  }

  handleClick(i) {
    const { xIsNext, stepNumber } = this.state;
    const history = this.state.history.slice(0, stepNumber + 1);
    const current = history[history.length - 1];
    const location = this.findSquareLocation(i + 1);
    const board = current.board.slice();
    if (calculateWinner(board).winner || board[i]) {
      return;
    }
    board[i] = xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          board: board,
          location: location,
        },
      ]),
      xIsNext: !xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  findSquareLocation = (index) => {
    let row, col;

    if (index < 4) {
      row = 1;
      col = index % 4;
    } else if (index < 7) {
      row = 2;
      col = (index % 7) - 3;
    } else {
      row = 3;
      col = (index % 10) - 6;
    }

    return {
      row: row,
      col: col,
    };
  };

  render() {
    const history = this.state.history;
    const { xIsNext, stepNumber } = this.state;
    const current = history[stepNumber];
    const isWin = calculateWinner(current.board);
    const { winner, winningSquares } = isWin;
    const status = winner
      ? `Winner is: ${winner}`
      : stepNumber === 9
      ? "Match draw!"
      : `Next Player: ${xIsNext ? "X" : "O"}`;

    const moves = history.map(({ location }, move) => {
      const desc = move ? "Go to move #" + move : "Go to game start";
      const { row, col } = location;
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={`${move === stepNumber ? "selected" : ""}`}
          >
            {desc}
            <span>{move ? ` (col: ${col}, row: ${row})` : ""}</span>
          </button>
        </li>
      );
    });

    return (
      <div className="game">
        <div>
          <label className={`status ${winner ? "status-winner" : ""}`}>
            {status}
          </label>
          <div className="game-board">
            <Board
              board={current.board}
              winningSquares={winningSquares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

const calculateWinner = (board) => {
  const possibleLines = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
  ];

  for (let i = 0; i < possibleLines.length; i++) {
    const [a, b, c] = possibleLines[i];

    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return {
        winner: board[a],
        winningSquares: possibleLines[i],
      };
    }
  }
  return {
    winner: null,
    winningSquares: Array(3).fill(null),
  };
};

export default Game;
