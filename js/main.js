'use strict'
const EMPTY = '';
const FLAG = '🚩';
const BOMB = '💣';
var strHTML = '';
var gMilisec = 0;
var gSec = 0;
var gMin = 0;
var gBoard;
var gLength = 8;
var gBombsOnBoard = 12;
var gPrevShownCount = 0;
var gMoves = 0;
var gGameInterval;
var gCellPerMove = [];
var gCells = [];

var gGame = {
    shownCount: 0,
    markedCount: 0,
    secsPassed: 3,
    hintCount: 3,
    safeClickCount: 3,
    isOn: true,
    isWinner: false,
    isHint: false
}

function restart() {
    clearInterval(gGameInterval);
    document.querySelector('.lives h1').innerHTML = `❤<br>❤<br>❤<br>`;
    document.querySelector('.abover h1').innerText = '😀';
    document.querySelector('.hints h1').innerHTML = `💡<br>💡<br>💡</br>`;
    document.querySelector('.gameOver').innerText = '';
    gCellPerMove = [];
    gCells = [];
    gMoves = 0;
    gPrevShownCount = 0;
    gMilisec = 0;
    gSec = 0;
    gMin = 0;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 3;
    gGame.hintCount = 3;
    gGame.safeClickCount = 3;
    gGame.isWinner = false;
    gGame.isHint = false;
    gGame.isOn = true;
    renderBoard(gBoard);
    document.querySelector('div.timer').innerText = "00:00:00";
    setTimeout(initGame, 30); //for the page to be completly loaded
}

function gameOver() {
    gGame.isOn = false;
    var gameModule = document.querySelector('.gameOver');
    gameModule.style.display = "block";
    if (gGame.isWinner) {
        gameModule.innerText = "You are a Champion !!!"
    }
    else {
        gameModule.innerText = "Maybe next time 😉"
        showBombs();
    }
    clearInterval(gGameInterval);
}


function checkGameOver() {
    if (gGame.markedCount === gBombsOnBoard && gGame.shownCount === gLength * gLength - gBombsOnBoard) {
        gGame.isWinner = true;
        document.querySelector('.abover h1').innerText = '😎';
        setTimeout(gameOver, 50);
    } else if (!gGame.secsPassed) {
        document.querySelector('.abover h1').innerText = '😱';
        setTimeout(gameOver, 50);
    }
}

function initGame() {
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
}

function cellMarked(elCell) {
    if (!gGame.isOn) return;
    var pos = elCell.dataset.location;
    var coords = pos.split('+');
    var currCell = gBoard[+coords[0]][+coords[1]]
    if (!currCell.isHiden) return;
    if (currCell.isMarked) {
        elCell.innerText = EMPTY;
        currCell.isMarked = false;
        gGame.markedCount--;
        return;
    }
    else {
        elCell.innerText = FLAG;
        currCell.isMarked = true;
        if (!gGame.shownCount && gGame.markedCount === 1) gGameInterval = setInterval(startTimer, 100);
    }
    checkGameOver()
}


function checkCell(elCell) {
    if (!gGame.isOn) return;
    var currCell = elCell.dataset.location;
    var coords = currCell.split('+');
    var pos = { i: +coords[0], j: +coords[1] }
    var cell = gBoard[pos.i][pos.j];
    if (cell.isMarked) {
        return;
    }
    if (gGame.isHint) {
        showHint(pos.i, pos.j, gBoard);
        return;
    }
    if (gBoard[pos.i][pos.j].isMine && !gGame.shownCount) {
        gBoard[pos.i][pos.j].value = (firstCell(pos)) ? firstCell(pos) : EMPTY;
        gBoard[pos.i][pos.j].isMine = false;
        gBombsOnBoard--;
    }
    if (gBoard[pos.i][pos.j].isMine) {
        if (gBoard[pos.i][pos.j].isMine && !gBoard[pos.i][pos.j].isHiden) return;
        gBoard[pos.i][pos.j].isHiden = false;
        elCell.classList.add('bomb');
        var smiley = document.querySelector('.abover h1');
        smiley.innerText = '🤯';
        gGame.secsPassed--;
        if (gGame.secsPassed) {
            setTimeout(secondChance, 1000);
            function secondChance() {
                elCell.classList.remove('bomb');
                elCell.classList.add('clicked');
                smiley.innerText = '😀';
            }
        }
        gGame.markedCount++;
        if (!gGame.secsPassed) checkGameOver();
    }
    else elCell.classList.add('clicked');
    if ((gBoard[pos.i][pos.j].isHiden) && (!gBoard[pos.i][pos.j].isMine)) gGame.shownCount++;
    if (gGame.shownCount === 1 && !gGame.markedCount) gGameInterval = setInterval(startTimer, 100);
    if (gBoard[pos.i][pos.j].isMine);
    checkGameOver();
    gBoard[pos.i][pos.j].isHiden = false;
    elCell.innerText = gBoard[pos.i][pos.j].value;
    if (gBoard[pos.i][pos.j].value === EMPTY) expandShown(pos);
    var lives = document.querySelector('.lives h1');
    var strHTML = '';
    for (var i = gGame.secsPassed; i > 0; i--) {
        strHTML += `❤<br>`
    }
    lives.innerHTML = strHTML;
    if (!gCells.includes(pos)) {
        gCells.push(pos);
    }
}

function renderBoard(board) {
    strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board.length; j++) {
            var negsCount = countNegs(i, j, gBoard);
            var inner = (negsCount) ? negsCount : EMPTY;
            if (gBoard[i][j].value !== BOMB) gBoard[i][j].value = inner;
            // strHTML += `<td data-location="${i + "+" + j}" onclick="checkCell(this)"oncontextmenu="cellMarked(this)">${gBoard[i][j].value}</td>`;
            strHTML += `<td data-location="${i + "+" + j}" onclick="checkCell(this)"oncontextmenu="cellMarked(this)">${EMPTY}</td>`;
        }
        strHTML += `</tr>`;
    }
    document.querySelector('tbody').innerHTML = strHTML;
}

function setMinesNegsCount(board) {
    var cells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            cells.push(board[i][j])
        }
    }
    for (i = 0; i < gBombsOnBoard; i++) {
        var idx = getRandomInt(0, cells.length);
        var currCell = cells[idx];
        var bombCell = gBoard[+currCell.location.i][+currCell.location.j];
        if (bombCell.isMine) {
            i--;
            continue;
        }
        bombCell.isMine = true;
        bombCell.value = BOMB;
    }
}

function buildBoard() {
    var mat = [];
    for (var i = 0; i < gLength; i++) {
        mat[i] = [];
        for (var j = 0; j < gLength; j++) {
            var cell = {
                location: { i, j },
                value: EMPTY,
                isMine: false,
                isMarked: false,
                isHiden: true
            }
            mat[i][j] = cell;
        }
    }
    return mat;
}

function countNegs(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].value === BOMB) {
                negsCount++;
            }
        }
    }
    return negsCount;
}


function shuffleArray(array) {
    var newNums = [];
    for (var i = array.length - 1; i >= 0; i--) {
        var idx = getRandomInt(0, array.length - 1);
        var currNum = array[idx];
        newNums[i] = currNum;
        array.splice(idx, 1);
    }
    return newNums;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function startTimer() {
    var timer = document.querySelector('div.timer');
    gMilisec++;
    if (gMilisec > 9) {
        gSec++;
        gMilisec = 0;
    }
    if (gSec > 59) {
        gMin++;
        gSec = 0;
    }
    timer.innerText = (gMin < 10 ? '0' + gMin : gMin) + ':' + (gSec < 10 ? '0' + gSec : gSec) + ':' + '0' + gMilisec;
}

function setLevel(length, bombs) {
    gLength = length;
    gBombsOnBoard = bombs;
    restart();
}

function undo() {
    var steps = gCellPerMove[gCellPerMove.length -1]
    for (var i = steps -1; i >= 0; i--) {
        var currCell = gCells[gCells.length-1];
        gBoard[currCell.i][currCell.j].isHiden = true;
        gBoard[currCell.i][currCell.j].isMarked = false;
        var elCell = document.querySelector(`[data-location="${currCell.i + "+" + currCell.j}"]`);
        elCell.classList.remove('clicked');
        elCell.innerText = EMPTY;
        gCells.pop();
    }
    gCellPerMove.pop()
}