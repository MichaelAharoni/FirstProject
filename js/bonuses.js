'use stict'




function safeClick() {
    if (!gGame.safeClickCount) return;
    gGame.safeClickCount--;
    var currCell = getNonBombCell();
    var elCell = document.querySelector(`[data-location="${currCell.i + "+" + currCell.j}"]`);
    var safeInterval = setInterval(clicked, 100);
    setTimeout(clearInterval, 2000, safeInterval);
    function clicked() {
        elCell.classList.toggle('clicked');
    }
}

function getNonBombCell() {
    var cells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine || !gBoard[i][j].isHiden) continue;
            var cell = { i: i, j: j };
            cells.push(cell);
        }
    }
    var idx = getRandomInt(0, cells.length);
    return cells[idx];
}

function expandShown(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === location.i && j === location.j) continue;
            var elCell = document.querySelector(`[data-location="${i + "+" + j}"]`);
            if (gBoard[i][j].isMarked) continue;
            if (gBoard[i][j].isMine) continue;
            if (gBoard[i][j].isHiden) checkCell(elCell)
            var pos = { i: i, j: j }
            if (gBoard[i][j].isHiden) gCells.push(pos);
            gBoard[i][j].isHiden = false;
        }
    }
    checkGameOver()
}

function firstCell(location) {
    var value = countNegs(location.i, location.j, gBoard);
    return value;
}

function showBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`[data-location="${i + "+" + j}"]`);
                elCell.innerText = BOMB;
            }
        }
    }
}

function hint() {
    if (!gGame.hintCount || gGame.isHint) return;
    var strHTML = '';
    var hintsText = document.querySelector('.hints h1');
    for (var i = gGame.hintCount - 1; i > 0; i--) {
        strHTML += '💡<br>'
    }
    hintsText.innerHTML = strHTML;
    var glowing = document.querySelector('.glow');
    glowing.style.display = "block";
    glowing.style.marginTop = "0%";
    glowing.style.marginTop = "26%";
    glowing.style.opacity = "1";
    gGame.isHint = true;
    setTimeout(returnGlow, 2000);
    setTimeout(glowDisplay, 3000)
}
function returnGlow() {
    var glowing = document.querySelector('.glow');
    glowing.style.marginTop = "48%";
    glowing.style.opacity = "0.1";
}

function glowDisplay() {
    var glowing = document.querySelector('.glow');
    glowing.style.display = "none";
}

function showHint(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            var elCell = document.querySelector(`[data-location="${i + "+" + j}"]`);
            elCell.innerText = gBoard[i][j].value;
            elCell.classList.add('clicked');
        }
    }
    setTimeout(cancelHint, 1000, cellI, cellJ, mat);
}


function cancelHint(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (!gBoard[i][j].isHiden) continue;
            var elCell = document.querySelector(`[data-location="${i + "+" + j}"]`);
            elCell.classList.remove('clicked');
            elCell.innerText = EMPTY;
            gGame.isHint = false;
        }
    }
    gGame.hintCount--;
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

function counters() {
    var count = gGame.shownCount - gPrevShownCount;
    gPrevShownCount = gGame.shownCount;
    gCellPerMove.push(count);
    gMoves++;
    if (gCellPerMove.includes(0)) {
        gCellPerMove.pop();
        gCellPerMove.push(1);
    }
}


// function manual() {
//     var elManual = document.querySelector('.manual');
//     if (!gGame.manualy) {
//         restart();
//         gGame.manualy = true;
//         console.log(gGame.manualy);
//         elManual.innerText = 'ready ?';
//         for (var i = 0; i > gManualyBombs.length; i++) {
//             var manualBoard = newBoard();
//             var currCell = gManualyBombs[i];
//             manualBoard[currCell.i][currCell.j].isMine = true;
//             manualBoard[currCell.i][currCell.j].value = BOMB;
//         }
//         gBoard = manualBoard;
//         renderBoard(gBoard);
//     } else {
//         elManual.innerText = 'Good Luck !';
//         gGame.manualy = false;
//     }
// }
// function newBoard() {
//     var board = [];
//     for (var i = 0; i < gLength; i++) {
//         board[i] = [];
//         for (var j = 0; j < gLength[i]; j++) {
//             var cell = {
//                 location: { i, j },
//                 value: EMPTY,
//                 isMine: false,
//                 isMarked: false,
//                 isHiden: true
//             }
//             board[i][j] = cell;
//         }
//     }
//     return board;
// }