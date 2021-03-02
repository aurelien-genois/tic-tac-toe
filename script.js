// Todo avoid click when computer play 
// Todo count the number of tie
// Todo improve general style
// Todo show which player turn is on player-name (bold and color....)
// Todo show hover effect on cell clickable
// Todo replace X and O by clean cross / circle
// Todo some animation (sumbol apparition, fade form disapearance, fade gameBoard apparition, ...)

// players factory
const player = (name, marker) => {
    let _points = 0;
    let _isRobot = false;
    const getName = () => name;
    const setName = (newName) => {
        name = newName;
    }
    const getMarker = () => marker;
    const getPoints = () => _points;
    const addPoints = () => {
        _points++;
    };
    const isAi = () => _isRobot;
    const setAi = () => {
        _isRobot = true;
    }
    return { getName, setName, getMarker, getPoints, addPoints, getAi: isAi, setAi};
}
const player1 = player('Player 1', 'X');
const player2 = player('Player 2', 'O');

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

// game play logic
const playController = (() => {
    let _player1moves = [];
    let _player2moves = [];
    let _precPlayer = 'none';
    let _isGameOver = false;
    const _winConditions = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ]; 
    const _getRandomLeftCellId = () => {
        let leftCellsId = []; // array for Id of empty cells
        gameBoard.getArr().map((x, i) => {
            if(x == '') {
                leftCellsId.push(i);
            }
        } );
        // random index number among the empty cells array
        const randomCellId = Math.floor(Math.random() * Math.floor(leftCellsId.length - 1));
        return leftCellsId[randomCellId];
    }
    // deep comparison because arr.includes() only works for shallow comparison,
    const _checkWin = (playerMoves, currentPlayer) => {
        _isGameOver = _winConditions.some(e => e.every(o => playerMoves.includes(o)));
        if(gameBoard.getArr().every(x => x !== "") && !_isGameOver) {
            _isGameOver = 'tie'; // truthy value
        }
        displayDOMController.displayRoundResult(_isGameOver, currentPlayer);
      };
    const _updateCell = (cell, cellId, currentPlayer, currentPlayerMoves) => {
        cell.textContent = currentPlayer.getMarker();
        gameBoard.setCell(cellId, currentPlayer.getMarker());
        currentPlayerMoves.push(+cellId);
        _checkWin(currentPlayerMoves, currentPlayer);
    };
    const _playARound = (cell, cellId) => {
        switch(_precPlayer) {
            case 'none':
            case player2.getName(): // player1 turn
                _updateCell(cell, cellId, player1, _player1moves);
                _precPlayer = player1.getName();
                if(player2.getAi()) { // if other player ai, play aiPlay()
                    displayDOMController.getGameBoardMask().style.visibility = 'visible';
                    setTimeout(function() {
                        displayDOMController.getGameBoardMask().style.visibility = 'collapse';
                        aiPlay(player2);
                        }, 500);
                }    
                break;
            case player1.getName(): // player2 turn
                _updateCell(cell, cellId, player2, _player2moves);
                _precPlayer = player2.getName();
                if(player1.getAi()) { // if other player ai, play aiPlay()
                    displayDOMController.getGameBoardMask().style.visibility = 'visible';
                    setTimeout(function() {
                        displayDOMController.getGameBoardMask().style.visibility = 'collapse';
                        aiPlay(player1);
                        }, 500);
                }    
                break;
        }

    }
    const humanPlay = (e) => {
        if(!e.target.textContent && !_isGameOver) { // if cell empty and game not over
            _playARound(e.target, e.target.id);
        }
    };
    const aiPlay = () => {
        const randomCellId = _getRandomLeftCellId();
        const randomCell = displayDOMController.getGameBoardCells()[randomCellId];
        if(randomCellId !== undefined && !_isGameOver) { // if cell empty and game not over
            _playARound(randomCell, randomCellId);
        }
    }
    const newRound = () => {
        gameBoard.reset();
        _player1moves = [];
        _player2moves = [];
        _precPlayer = 'none';
        _isGameOver = false;
        displayDOMController.initGameBoardToDom();
    };

    return {humanPlay, aiPlay, newRound};
})();

// methods for display to the dom
const displayDOMController = ((doc) => {
    const _game = doc.querySelector('#game');
    const _gameBoardGrid = doc.querySelector('#game-board');
    const _winDescription = doc.querySelector('#win-description');
    const _score1Text = doc.querySelector('#score1');
    const _score2Text = doc.querySelector('#score2');
    const _player1Text = doc.querySelector('#player1');
    const _player2Text = doc.querySelector('#player2');
    const _restartButton = doc.querySelector('#restart-button');
    _restartButton.addEventListener('click', playController.newRound);

    // home form
    const _home = doc.querySelector('#home');
    const _homeForm = doc.querySelector('#home-form');
    _homeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        player1.setName(_homeForm.querySelector('#player-name-1').value || 
                        _homeForm.querySelector('#player-name-1').placeholder);
        player2.setName(_homeForm.querySelector('#player-name-2').value || 
                        _homeForm.querySelector('#player-name-2').placeholder);
        _player1Text.textContent = player1.getName();
        _player2Text.textContent = player2.getName();
        if(_homeForm.querySelector('#robot-1').checked) {
            console.log('1 is AI'); 
            player1.setAi(); // define player1 as a AI
        }
        if(_homeForm.querySelector('#robot-2').checked) {
            console.log('2 is AI'); 
            player2.setAi(); // define player2 as a AI
        } 
        initGameBoardToDom(); // first init
        _game.removeAttribute('hidden');
        _home.setAttribute('hidden', "");
    });
    
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
            gameCell.addEventListener('click', playController.humanPlay);
            _gameBoardGrid.appendChild(gameCell);
        });
        if(player1.getAi()) {
            playController.aiPlay(player1);
        }
    };
    const displayRoundResult = (gameOverCheck, winnerPlayer) => {
        if(gameOverCheck === 'tie') {
            _winDescription.textContent = 'It\'s a Tie!!';
        } else if(gameOverCheck) {
            _winDescription.textContent = winnerPlayer.getName() + ' wins the round!';
            winnerPlayer.addPoints();
            _score1Text.textContent = player1.getPoints();
            _score2Text.textContent = player2.getPoints();
        }
    };
    const getGameBoardCells = () => [..._gameBoardGrid.querySelectorAll('.game-cells')];
    const getGameBoardMask = () => doc.querySelector('#game-board-mask');
    return { initGameBoardToDom, displayRoundResult, getGameBoardCells, getGameBoardMask};
})(document);

