
const Gameboard = (() => {
    let gameboard = ['', '', '', '', '', '', '', '', ''];

    const render = () => {
        let boardHTML = "";
        gameboard.forEach((square, index) => {
            boardHTML += `<div class="square" id="${index}">${square}</div>`;
        });
        document.querySelector('#gameboard').innerHTML = boardHTML;
        const squares = document.querySelectorAll('.square');
        squares.forEach((square) => {
            square.addEventListener('click', Game.handleClick);
        });
    };

    const update = (index, value) => {
        gameboard[index] = value;
        render();
    };

    const getGameboard = () => gameboard;

    const reset = () => {
        gameboard = ['', '', '', '', '', '', '', '', ''];
        render();
    };

    return {
        render,
        update,
        getGameboard,
        reset
    };
})();

const displayModule = (() => {
    const renderMessage = (message) => {
        document.querySelector('#message').innerHTML = message;
    };

    return {
        renderMessage,
    };
})();

const Player = (name, mark) => {
    return { name, mark, score: 0 };
};

const Game = (() => {
    let players = [];
    let currentPlayerIndex;
    let gameOver;
    let mode; // 'friends' or 'system'
    let maxRounds = 3;

    const start = () => {
        players = [];
        gameOver = false;
        document.querySelector('.mode-selection').classList.add('show');
        document.querySelector('.controls').classList.remove('show');
        document.querySelector('#winningMessage').classList.remove('show');
        document.querySelector('#restart').innerText = "Restart Game";
        document.querySelector('#player1').value = '';
        document.querySelector('#player2').value = '';
        updateScorecard();
    };

    const modeSelection = document.querySelector('.mode-selection');
    const playFriendsButton = document.querySelector('#play-friends');
    const playSystemButton = document.querySelector('#play-system');
    const controls = document.querySelector('.controls');

    playFriendsButton.addEventListener('click', () => {
        mode = 'friends';
        modeSelection.classList.remove('show');
        controls.classList.add('show');
    });

    playSystemButton.addEventListener('click', () => {
        mode = 'system';
        modeSelection.classList.remove('show');
        controls.classList.add('show');
        document.querySelector('#player2').value = 'System';
        document.querySelector('#player2').disabled = true;
    });

    const startButton = document.querySelector('#start-button');
    startButton.addEventListener('click', () => {
        players = [
            Player(document.querySelector('#player1').value, 'X'),
            Player(document.querySelector('#player2').value || 'System', 'O')
        ];
        currentPlayerIndex = 0;
        gameOver = false;
        Gameboard.render();
        controls.classList.remove('show');
        updateScorecard();
    });

    const restartButton = document.querySelector('#restart');
    restartButton.addEventListener('click', () => {
        if (players.some(player => player.score === 2)) {
            resetGame();
        } else {
            restartRound();
        }
    });

    const handleClick = (e) => {
        if (gameOver) return;
        let index = e.target.id;
        if (Gameboard.getGameboard()[index] !== '') return;

        Gameboard.update(index, players[currentPlayerIndex].mark);
        if (checkForWin(Gameboard.getGameboard(), players[currentPlayerIndex].mark)) {
            gameOver = true;
            players[currentPlayerIndex].score++;
            displayModule.renderMessage(`Congrats ${players[currentPlayerIndex].name}, you Win!`);
            document.querySelector('#winningMessage').classList.add('show');
            updateScorecard();
            if (checkOverallWinner()) {
                displayModule.renderMessage(`Game over, ${players[currentPlayerIndex].name} has won the match!`);
                document.querySelector('#restart').innerText = "Start New Game";
            }
        } else if (checkForTie(Gameboard.getGameboard())) {
            gameOver = true;
            displayModule.renderMessage("It's a tie");
            document.querySelector('#winningMessage').classList.add('show');
        } else {
            currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            if (mode === 'system' && currentPlayerIndex === 1 && !gameOver) {
                systemMove();
            }
        }
    };

    const systemMove = () => {
        let emptySquares = Gameboard.getGameboard()
            .map((square, index) => square === '' ? index : null)
            .filter(val => val !== null);
        let randomIndex = predictMove(Gameboard.getGameboard());
        Gameboard.update(randomIndex, players[1].mark);
        if (checkForWin(Gameboard.getGameboard(), players[1].mark)) {
            gameOver = true;
            players[1].score++;
            displayModule.renderMessage("System Wins!");
            document.querySelector('#winningMessage').classList.add('show');
            updateScorecard();
            if (checkOverallWinner()) {
                displayModule.renderMessage(`Game over, System has won the match!`);
                document.querySelector('#restart').innerText = "Start New Game";
            }
        } else if (checkForTie(Gameboard.getGameboard())) {
            gameOver = true;
            displayModule.renderMessage("It's a tie");
            document.querySelector('#winningMessage').classList.add('show');
        } else {
            currentPlayerIndex = 0;
        }
    };

    const checkForWin = (board, mark) => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
            [0, 4, 8], [2, 4, 6] // diagonal
        ];
        return winningCombinations.some(combination => combination.every(index => board[index] === mark));
    };

    const checkForTie = (board) => {
        return board.every(square => square !== '');
    };

    const updateScorecard = () => {
        document.querySelector('#player1-score').innerText = `${players[0] ? players[0].name : 'Player X'}: ${players[0] ? players[0].score : 0}`;
        document.querySelector('#player2-score').innerText = `${players[1] ? players[1].name : 'Player O'}: ${players[1] ? players[1].score : 0}`;
        if (players[0] && players[1]) {
            let winner = players[0].score > players[1].score ? players[0].name : players[1].score > players[0].score ? players[1].name : 'Tie';
            document.querySelector('#rounds-winner').innerText = `Winner: ${winner}`;
        }
    };

    const checkOverallWinner = () => {
        return players.some(player => player.score === 2);
    };

    const resetGame = () => {
        players.forEach(player => player.score = 0);
        Gameboard.reset();
        start();
    };

    const restartRound = () => {
        Gameboard.reset();
        currentPlayerIndex = 0;
        gameOver = false;
        document.querySelector('#winningMessage').classList.remove('show');
    };

    return {
        start,
        handleClick
    };
})();

const predictMove = (board) => {
    // Simple prediction logic using a decision tree
    // This is a basic example, for better results use a more advanced model
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
        [0, 4, 8], [2, 4, 6]  // diagonal
    ];

    // Check for a winning move for 'O'
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
        if (board[a] === 'O' && board[b] === '' && board[c] === 'O') return b;
        if (board[a] === '' && board[b] === 'O' && board[c] === 'O') return a;
    }

    // Block opponent's winning move
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
        if (board[a] === 'X' && board[b] === '' && board[c] === 'X') return b;
        if (board[a] === '' && board[b] === 'X' && board[c] === 'X') return a;
    }

    // If no winning or blocking move, return a random empty square
    let emptySquares = board.map((square, index) => square === '' ? index : null).filter(val => val !== null);
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};

Game.start();
