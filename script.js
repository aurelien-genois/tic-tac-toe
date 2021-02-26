// players factory
const player = (name, marker) => {
    let _points = 0;
    const getName = () => name;
    const getMarker = () => marker;
    const getPoints = () => points;
    const addPoints = () => {
        _points++;
    };
    return { getName, getMarker, getPoints, addPoints};
}
const player1 = player('Player 1', 'X');
const player2 = player('Player 2', 'O');

// need to bameBoard.setCell() for update the gameBoar arr (then watch it every play (clicked event) for declare winner or a tie (if array full and no winner))

// modules and object methods can be called from other modules

// GameBoard
const gameBoard = (() => {
    let _arr = [['','',''],['','',''],['','','']];
    const getArr = () => _arr;
    const setCell = (cellIndex, cellValue) => {
        if(cellIndex < 3) {
            _arr[0][cellIndex] = cellValue;
        } else if(cellIndex < 6) {
            _arr[1][cellIndex - 3] = cellValue;
        } else {
            _arr[2][cellIndex - 6] = cellValue;
        }
        
    };
    const reset = () => {
        _arr = [['','',''],['','',''],['','','']];
    }

    return { getArr, setCell, reset};
})();

// methods for display to the dom
const displayDOMController = ((doc) => {
    const _createCell = (id, content, colIndex, rowIndex) => {
        let cell = doc.createElement('p'); 
        cell.classList.add('game-cells');
        cell.setAttribute('id', id);
        cell.style.gridColumn = colIndex;
        cell.style.gridRow = rowIndex;
        cell.textContent = content;
        switch(id) {
            case 0:
                cell.style.borderWidth = '0 2px 2px 0';
                break;
            case 2:
                cell.style.borderWidth = '0 0 2px 2px';
                break;
            case 4:
                cell.style.outline = '2px solid green';
                break;
            case 6:
                cell.style.borderWidth = '2px 2px 0 0';
                break;
            case 8:
                cell.style.borderWidth = '2px 0 0 2px';
                break;
        }
        return cell;
    }

    const initGameBoardToDom = () => {
        let gameBoardGrid = doc.querySelector('#game-board');
        let cellId = 0;
        gameBoard.getArr().map((x, xI) => {
            x.map((y, yI) => {
                let gameCell = _createCell(cellId++, y, yI+1, xI+1);
                gameCell.addEventListener('mousedown', playController.checkCell);
                gameBoardGrid.appendChild(gameCell);
            })
        })
    }
    // const getCells = () => doc.querySelectorAll('.game-cells');

    const displayPlayersNames = () => {
        const player1Text = doc.querySelector('#player1');
        const player2Text = doc.querySelector('#player2');
        player1Text.textContent = player1.getName();
        player2Text.textContent = player2.getName();
    };
    return { initGameBoardToDom, displayPlayersNames};
})(document);

// methods for game play
const playController = (() => {
    let _counter = 0;
    const checkCell = (e) => {
        if(!e.target.textContent) {
            if ((_counter % 2) === 0) {
                e.target.textContent = player1.getMarker();
                gameBoard.setCell(e.target.id, player1.getMarker())
            } else {
                e.target.textContent = player2.getMarker();
                gameBoard.setCell(e.target.id, player2.getMarker())
            }
            ++_counter;
        }
        console.log( gameBoard.getArr());
    }

    // for winning combinaisons, 
    //write them in a object, 
    // save (push) the id of player1 and player2 to two arrays
    // and check if one of an array corresponds to a winning combinaison

    return {checkCell};
})();

//temp ? create a test gameBoard
displayDOMController.initGameBoardToDom();
displayDOMController.displayPlayersNames();
// playController.play()




