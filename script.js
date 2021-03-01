// Todo comment/refactor javascript
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
    const getAi = () => _isRobot;
    const setAi = () => {
        _isRobot = true;
    }
    return { getName, setName, getMarker, getPoints, addPoints, getAi, setAi};
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
    const _randomLeftCellIndex = () => {
        let cellsIdLeft = []; // array for Id of empty cells
        gameBoard.getArr().map((x, i) => {
            if(x == '') {
                cellsIdLeft.push(i);
            }
        } );
        // random index number among the empty cells array
        let randomCellNb = Math.floor(Math.random() * Math.floor(cellsIdLeft.length - 1));
        return cellsIdLeft[randomCellNb];
    }
    // deep comparison because arr.includes() only works for shallow comparison,
    const _checkWin = (playerPlays, currentPlayer) => {
        _isGameOver = _winStates.some(e => e.every(o => playerPlays.includes(o)));
        if(gameBoard.getArr().every(x => x !== "") && !_isGameOver) {
            _isGameOver = 'tie'; // truthy value
        }
        displayDOMController.displayResult(_isGameOver, currentPlayer);
      };
    
    const _updateCell = (cell, cellId, currentPlayer, currentPlayerPlays) => {
        cell.textContent = currentPlayer.getMarker();
        gameBoard.setCell(cellId, currentPlayer.getMarker());
        currentPlayerPlays.push(+cellId);
        _checkWin(currentPlayerPlays.sort((a,b) => a - b), currentPlayer);
    }; 
    // need to work for an click event or computer AI 
    const aiPlay = (aiPlayer) => {
        let randomCellIndex = _randomLeftCellIndex();
        if(randomCellIndex!== undefined && !_isGameOver) {
            if (aiPlayer == player1) { // player1 turn
                _updateCell(displayDOMController.getGameCells()[randomCellIndex], randomCellIndex,player1, _player1plays);
                ++_turnCounter;
                if(player2.getAi()) { // if other player ai, need a timeOut intervalle (1s)
                    setTimeout(function() {
                        aiPlay(player2);
                        }, 500);
                }
            } else if (aiPlayer == player2) { // player2 turn
                _updateCell(displayDOMController.getGameCells()[randomCellIndex], randomCellIndex,player2, _player2plays);
                ++_turnCounter;
                if(player1.getAi()) { // if other player ai, need a timeOut intervalle (1s)
                    setTimeout(function() {
                        aiPlay(player1);
                        }, 500);
                }
            }
        }
        
    }
    const checkCell = (e) => {
        if(!e.target.textContent && !_isGameOver) { // if cell empty
            if ((_turnCounter % 2) === 0) { // player1 turn
                _updateCell(e.target, e.target.id,player1, _player1plays);
                ++_turnCounter;
                if(player2.getAi()) { // if other player ai, need a timeOut intervalle (1s)
                    setTimeout(function() {
                        aiPlay(player2);
                        }, 500);
                }
            } else { // player2 turn
                _updateCell(e.target, e.target.id,player2, _player2plays);
                ++_turnCounter;
                if(player1.getAi()) { // if other player ai, need a timeOut intervalle (1s)
                    setTimeout(function() {
                        aiPlay(player1);
                        }, 500);
                }
            }
        }
    };
    const newRound = () => {
        gameBoard.reset();
        _player1plays = [];
        _player2plays = [];
        _turnCounter = 0;
        _isGameOver = false;
        displayDOMController.initGameBoardToDom();
    };

    return {checkCell, newRound, aiPlay};
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
    _score1Text.textContent = player1.getPoints();
    _score2Text.textContent = player2.getPoints();
    _restartButton.addEventListener('click', playController.newRound);

    const _homeForm = doc.querySelector('#home-form');
    const _home = doc.querySelector('#home');
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
            gameCell.addEventListener('click', playController.checkCell);
            _gameBoardGrid.appendChild(gameCell);
        });
        if(player1.getAi()) {
            playController.aiPlay(player1);
        }
    };

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

    const getGameCells = () => [..._gameBoardGrid.querySelectorAll('.game-cells')];
    return { initGameBoardToDom, displayResult, getGameCells};
})(document);

