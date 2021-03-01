// players factory
const player = (name, marker) => {
    let _points = 0;
    const getName = () => name;
    const getMarker = () => marker;
    const getPoints = () => _points;
    const addPoints = () => {
        _points++;
    };
    return { getName, getMarker, getPoints, addPoints};
}
const player1 = player('Player 1', 'X');
const player2 = player('Player 2', 'O'); // or AI

// GameBoard
const gameBoard = (() => {
    let _arr = ['','','','','','','','',''];
    const getArr = () => _arr;
    const setCell = (cellIndex, cellValue) => {
        _arr[cellIndex] = cellValue;  
    };
    const reset = () => {
        _arr = ['','','','','','','','',''];
    };

    return { getArr, setCell, reset};
})();

// TODO module for AI

// game play logic
const playController = (() => {
    let _player1plays = [];
    let _player2plays = [];
    let _turnCounter = 0;
    let _isGameOver = false;
    const _winStates = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ]; 
    // deep comparison because arr.includes() only works for shallow comparison,
    const _checkWin = (playerPlays, currentPlayer) => {
        _isGameOver = _winStates.some(e => e.every(o => playerPlays.includes(o)));
        if(gameBoard.getArr().every(x => x !== "") && !_isGameOver) {
            _isGameOver = 'tie'; // truthy value
        }
        displayDOMController.displayResult(_isGameOver, currentPlayer);
      };
    
    const _updateCell = (cell, currentPlayer, currentPlayerPlays) => {
        cell.textContent = currentPlayer.getMarker();
        gameBoard.setCell(cell.id, currentPlayer.getMarker())
        currentPlayerPlays.push(+cell.id);
        _checkWin(currentPlayerPlays.sort((a,b) => a - b), currentPlayer);
    };
    const checkCell = (e) => {
        if(!e.target.textContent && !_isGameOver) { // if cell empty
            if ((_turnCounter % 2) === 0) { // player1 turn
                _updateCell(e.target,player1, _player1plays);
            } else { // player2 turn
                _updateCell(e.target,player2, _player2plays);
            }
            ++_turnCounter;
        }
    };
    const newRound = () => {
        gameBoard.reset();
        displayDOMController.initGameBoardToDom();
        _player1plays = [];
        _player2plays = [];
        _turnCounter = 0;
        _isGameOver = false;
    };

    return {checkCell, newRound};
})();

// methods for display to the dom
const displayDOMController = ((doc) => {
    const _gameBoardGrid = doc.querySelector('#game-board');
    const _winDescription = doc.querySelector('#win-description');
    const _score1Text = doc.querySelector('#score1');
    const _score2Text = doc.querySelector('#score2');
    const _player1Text = doc.querySelector('#player1');
    const _player2Text = doc.querySelector('#player2');
    const _restartButton = doc.querySelector('#restart-button');
    // Display name automatically at the initialisation
    _score1Text.textContent = player1.getPoints();
    _score2Text.textContent = player2.getPoints();
    _player1Text.textContent = player1.getName();
    _player2Text.textContent = player2.getName();
    _restartButton.addEventListener('click', playController.newRound);
    
    const _createCell = (id, content, colIndex, rowIndex) => {
        let cell = doc.createElement('p'); 
        cell.classList.add('game-cells');
        cell.setAttribute('id', id);
        cell.style.gridColumn = colIndex;
        cell.style.gridRow = rowIndex;
        cell.textContent = content;
        return cell;
    };
    const initGameBoardToDom = () => {
        let cellId = 0;
        let cellColl = 1;
        let cellRow = 1;
        _winDescription.textContent = '';
        while (_gameBoardGrid.firstChild) {    
            _gameBoardGrid.removeChild(_gameBoardGrid.firstChild);
        };
        gameBoard.getArr().map((x, xI) => {
            switch(xI) {
                case 3:
                case 6:
                    cellColl = 1;
                    ++cellRow;
                    break;
            }
            let gameCell = _createCell(cellId++, x, cellColl++, cellRow);
            gameCell.addEventListener('mousedown', playController.checkCell);
            _gameBoardGrid.appendChild(gameCell);
        })
    };
    initGameBoardToDom(); // first init

    const displayResult = (gameOverCheck, player) => {
        if(gameOverCheck === 'tie') {
            _winDescription.textContent = 'It\'s a Tie!!';
        } else if(gameOverCheck) {
            _winDescription.textContent = player.getName() + ' wins the round!';
            player.addPoints();
            _score1Text.textContent = player1.getPoints();
            _score2Text.textContent = player2.getPoints();
            // (player === player1) ? _score1Text.textContent++ : _score2Text.textContent++ ;
        }
    };
    return { initGameBoardToDom, displayResult};
})(document);

