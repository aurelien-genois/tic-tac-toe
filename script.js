// Todo improve general style
// Todo replace X and O by clean cross / circle
// Todo some animation (sumbol apparition, fade form disapearance, fade gameBoard apparition, ...)

// players factory
const player = (name, marker) => {
  let _points = 0;
  let _isRobot = false;
  const getName = () => name;
  const setName = (newName) => {
    name = newName;
  };
  const getMarker = () => marker;
  const getPoints = () => _points;
  const addPoints = () => {
    _points++;
  };
  const isAi = () => _isRobot;
  const setAi = () => {
    _isRobot = true;
  };
  return {
    getName,
    setName,
    getMarker,
    getPoints,
    addPoints,
    isAi,
    setAi,
  };
};
const player1 = player('Player 1', 'X');
const player2 = player('Player 2', 'O');

// GameBoard module
const gameBoard = (() => {
  let _arr = ['', '', '', '', '', '', '', '', ''];

  const getArr = () => _arr;

  const setCell = (cellIndex, cellValue) => {
    _arr[cellIndex] = cellValue;
  };

  const reset = () => {
    _arr = ['', '', '', '', '', '', '', '', ''];
  };

  return { getArr, setCell, reset };
})();

// game logic module
const playController = (() => {
  let _player1moves = [];
  let _player2moves = [];
  let _precPlayer = 'none';
  let _isGameOver = false;
  const _winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const _getRandomEmptyCellId = () => {
    let emptyCellsId = []; // array for Id of empty cells
    gameBoard.getArr().map((x, i) => {
      if (x == '') {
        emptyCellsId.push(i);
      }
    });
    // random index number among the empty cells array
    const randomCellId = Math.floor(Math.random() * (emptyCellsId.length - 1));
    return emptyCellsId[randomCellId];
  };

  const _checkWin = (playerMoves, currentPlayer) => {
    // deep comparison because arr.includes() only works for shallow comparison,
    let winningCondition = [];
    _isGameOver = _winConditions.some((cond) => {
      if (cond.every((condCell) => playerMoves.includes(condCell))) {
        winningCondition = [...cond];
        return true;
      }
    });
    if (gameBoard.getArr().every((cell) => cell !== '') && !_isGameOver) {
      _isGameOver = 'tie'; // truthy value
    }
    if (_isGameOver) {
      // if game is over, displayResult
      currentPlayer.addPoints();
      displayDOMController.displayResult(
        _isGameOver,
        currentPlayer,
        winningCondition,
      );
    } else {
      // if game is not over, hightlight the new current player
      displayDOMController.highlightCurrPlayer();
    }
  };

  const _setAMove = (cell, cellId, currentPlayer, currentPlayerMoves) => {
    displayDOMController.displayMove(cell, currentPlayer.getMarker());
    gameBoard.setCell(cellId, currentPlayer.getMarker());
    currentPlayerMoves.push(+cellId);
    _checkWin(currentPlayerMoves, currentPlayer);
  };

  const _playAMove = (cell, cellId) => {
    switch (_precPlayer) {
      case 'none':
      case player2.getMarker(): // player1 turn
        _setAMove(cell, cellId, player1, _player1moves);
        _precPlayer = player1.getMarker();
        if (player2.isAi()) {
          // if other player ai, play aiPlay()
          displayDOMController.toggleGameBoardMask();
          setTimeout(function () {
            displayDOMController.toggleGameBoardMask();
            aiPlay();
          }, 500);
        }
        break;
      case player1.getMarker(): // player2 turn
        _setAMove(cell, cellId, player2, _player2moves);
        _precPlayer = player2.getMarker();
        if (player1.isAi()) {
          // if other player ai, play aiPlay()
          displayDOMController.toggleGameBoardMask();
          setTimeout(function () {
            displayDOMController.toggleGameBoardMask();
            aiPlay();
          }, 500);
        }
        break;
    }
  };

  const humanPlay = (e) => {
    if (
      !e.target.classList.contains('fa-sun') &&
      !e.target.classList.contains('fa-moon') &&
      !_isGameOver
    ) {
      // if cell empty and game not over
      _playAMove(e.target, e.target.id);
    }
  };

  const aiPlay = () => {
    const randomCellId = _getRandomEmptyCellId();
    const randomCell = displayDOMController.getGameBoardCells()[randomCellId];
    if (randomCellId !== undefined && !_isGameOver) {
      // if cell empty and game not over
      _playAMove(randomCell, randomCellId);
    }
  };

  const newRound = () => {
    gameBoard.reset();
    _player1moves = [];
    _player2moves = [];
    _precPlayer = 'none';
    _isGameOver = false;
    displayDOMController.initGameBoardToDom();
  };

  return { humanPlay, aiPlay, newRound };
})();

// DOM display module
const displayDOMController = ((doc) => {
  const _game = doc.querySelector('#game');
  const _gameInfos = doc.querySelector('#game-infos');
  const _gameBoardGrid = doc.querySelector('#game-board');
  const _winDescription = doc.querySelector('#win-description');
  const _score1Text = doc.querySelector('#score1');
  const _score2Text = doc.querySelector('#score2');
  const _player1Text = doc.querySelector('#player1');
  const _player2Text = doc.querySelector('#player2');
  const _restartButton = doc.querySelector('#restart-button');
  const _gameBoardMask = doc.querySelector('#game-board-mask');
  const _roundResults = doc.querySelector('#round-results');
  _restartButton.addEventListener('click', playController.newRound);

  // home form
  const _home = doc.querySelector('#home');
  const _homeForm = doc.querySelector('#home-form');
  _homeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    player1.setName(
      _homeForm.querySelector('#player-name-1').value ||
        _homeForm.querySelector('#player-name-1').placeholder,
    );
    player2.setName(
      _homeForm.querySelector('#player-name-2').value ||
        _homeForm.querySelector('#player-name-2').placeholder,
    );
    _player1Text.textContent = player1.getName();
    _player2Text.textContent = player2.getName();
    if (_homeForm.querySelector('#robot-1').checked) {
      console.log('1 is AI');
      player1.setAi(); // define player1 as a AI
      _gameInfos.querySelector('#player1-display').classList.add('robot-color');
    } else {
      _gameInfos.querySelector('#player1-display').classList.add('human-color');
    }
    if (_homeForm.querySelector('#robot-2').checked) {
      console.log('2 is AI');
      player2.setAi(); // define player2 as a AI
      _gameInfos.querySelector('#player2-display').classList.add('robot-color');
    } else {
      _gameInfos.querySelector('#player2-display').classList.add('human-color');
    }
    initGameBoardToDom(); // first init
    _gameBoardMask.querySelector('p').style.display = 'none';
    _home.style.display = 'none';
    _gameInfos.style.display = 'block';
  });

  const _createCell = (id, colIndex, rowIndex) => {
    let cell = doc.createElement('p');
    cell.classList.add('game-cells', 'fa');
    cell.setAttribute('id', id);
    cell.style.gridColumn = colIndex;
    cell.style.gridRow = rowIndex;
    return cell;
  };

  const initGameBoardToDom = () => {
    let cellId = 0;
    let cellColl = 1;
    let cellRow = 1;
    if ([..._player2Text.classList].includes('current-player-name')) {
      // reset the highlight to the player1Text if stills on the player2Text
      _player1Text.classList.add('current-player-name');
      _player2Text.classList.remove('current-player-name');
    }
    _winDescription.textContent = '';
    while (_gameBoardGrid.firstChild) {
      _gameBoardGrid.removeChild(_gameBoardGrid.firstChild);
    }
    gameBoard.getArr().map((x, xI) => {
      switch (xI) {
        case 3:
        case 6:
          // reset coll & change row at the cell 4th (3) and 7th (6)
          cellColl = 1;
          ++cellRow;
          break;
      }
      let gameCell = _createCell(cellId++, cellColl++, cellRow);
      gameCell.addEventListener('click', playController.humanPlay);
      _gameBoardGrid.appendChild(gameCell);
    });
    if (player1.isAi()) {
      playController.aiPlay(player1);
    }
    toggleGameBoardMask(); // remove the mask
    _restartButton.style.display = 'none';
    _gameBoardMask.style.cursor = 'wait';
  };

  const _populateRoundResults = (winsCellsIds) => {
    if (_roundResults.childElementCount >= 4) {
      _roundResults.lastElementChild.style.opacity = 0;
      _roundResults.lastElementChild.style.marginRight = '-9rem';
      setTimeout(function () {
        _roundResults.lastElementChild.remove();
      }, 1000);
    }
    const currGameBoardGrid = _gameBoardGrid.cloneNode(true);
    currGameBoardGrid.classList.add('round-results-grids');
    currGameBoardGrid.id = '';
    winsCellsIds.map((id) => {
      currGameBoardGrid.childNodes[id].style.color = 'green';
    });
    _roundResults.prepend(currGameBoardGrid);
  };

  const displayResult = (gameOverCheck, winnerPlayer, winingCellsIds) => {
    toggleGameBoardMask();
    _gameBoardMask.style.cursor = 'default';
    _restartButton.style.display = 'block';
    if (gameOverCheck === 'tie') {
      _winDescription.textContent = "It's a Tie!!";
    } else {
      _winDescription.textContent = winnerPlayer.getName() + ' wins the round!';
      _score1Text.textContent = player1.getPoints();
      _score2Text.textContent = player2.getPoints();
    }
    _populateRoundResults(winingCellsIds);
  };

  const highlightCurrPlayer = () => {
    _player1Text.classList.toggle('current-player-name');
    _player2Text.classList.toggle('current-player-name');
  };

  const displayMove = (thisCell, marker) => {
    switch (marker) {
      case 'X':
        thisCell.classList.add('fa-sun');
        break;
      case 'O':
        thisCell.classList.add('fa-moon');
        break;
    }
  };

  const getGameBoardCells = () => [
    ..._gameBoardGrid.querySelectorAll('.game-cells'),
  ];

  const toggleGameBoardMask = () => {
    _gameBoardMask.classList.toggle('visible');
  };

  return {
    initGameBoardToDom,
    displayResult,
    getGameBoardCells,
    highlightCurrPlayer,
    displayMove,
    toggleGameBoardMask,
  };
})(document);
