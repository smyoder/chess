/**
 * Populate the space with the correct color and piece
 * @param r the rank of the space to populate
 * @param f the file of the space to populate
 * @return the HTML object corresponding to the populated space
 */
function populateSpace(r, f) {
  var spaceDOM = document.createElement('span');
  // Set the space background based on the space color
  spaceDOM.style = "background-image: url('" + currentGame.board.space(f, r).img() + "');"
  var space = currentGame.board.spaceAt(f, r);
  spaceDOM.space = space;
  spaceDOM.classList.add("space");
  space.dom = spaceDOM;
  
  assignPieceDOM(space.piece);
  pieceDOM = space.piece.dom;
  
  spaceDOM.appendChild(pieceDOM);
  return spaceDOM;
}

/**
 * Visually update the board based on the current rotation and position of each piece.
 */
function updateBoard() {
  // HTML board
  var boardTable = document.getElementById("board");
  var ranks = [...boardTable.children];
  for(var child of ranks) {
    boardTable.removeChild(child);
  }
  var size = currentGame.board.size;
  if(currentGame.showFlippedBoard()) {
    // Initialize all the spaces and pieces
    for(var r = size[1] - 1; r >= 0 ; r--) {
      var rank = document.createElement('div');
      rank.classList.add('rank');
      for(var f = 0; f < size[0] ; f++) {
        rank.appendChild(populateSpace(r, f));
      }
      boardTable.appendChild(rank);
    }
  } else {
    for(var r = 0; r < size[1] ; r++) {
      var rank = document.createElement('div');
      rank.classList.add('rank');
      for(var f = size[0] - 1; f >= 0 ; f--) {
        rank.appendChild(populateSpace(r, f));
      }
      boardTable.appendChild(rank);
    }
  }
}

/**
 * Process the most recently-made move, either by updating the board or stalling for user input.
 */
function makeMove() {
  var indicator = event.srcElement;
  var message = currentGame.movePiece(selectedPiece, indicator.move);
  if(message == Game.OKAY_MSG) {
    finishMove()
  } else {
    stallGame();
    if(message == Game.PROMOTE_PAWN_MSG) {
      var spaceDOM = currentGame.board.spaceAt(indicator.move[0], indicator.move[1]).dom;
      spaceDOM.appendChild(pieceSelect(message));
    }
  }
}

/**
 * Promote the most recently-moved pawn based on player selection.
 */
function promotePawn() {
  var info = event.srcElement.pieceInfo;
  selectedPiece.changeTo(info.name, null, info.symbol);
  for(var selector of document.getElementsByClassName('pieceSelect')) {
    selector.remove();
  }
  finishMove();
}

/**
 * Disable interaction with the pieces so the player can make some input.
 */
function stallGame() {
  hideMoves();
  var boardTable = document.getElementById("board");
  for(var rank of boardTable.children) {
    for(var space of rank.children) {
      for(var piece of space.children) {
        if(piece.classList.contains("activePiece")) {
          piece.classList.remove("activePiece");
        }
      }
    }
  }
}

/**
 * Progress the game and board after a move has been made
 */
function finishMove() {
  currentGame.nextTurn();
  hideMoves();
  updateBoard();
}

/**
 * Remove any existing move indicators
 */
function hideMoves() {
  for(var i = 0; i < moveIndicators.length; i++) {
    moveIndicators[i].remove();
  }
}

/**
 * Show all the moves for the currently selected piece
 */
function showMoves() {
  hideMoves();
  var pieceDOM = event.srcElement;
  if(pieceDOM.classList.contains('activePiece')) {
    moveIndicators = [];
    var piece = pieceDOM.piece;
    var moves = currentGame.validMoves(currentGame.board, piece);
    selectedPiece = piece;
    for(var move of moves) {
      var indicator = document.createElement('img');
      indicator.src = 'img/indicator.png';
      indicator.classList.add('indicator');
      indicator.move = move;
      indicator.onclick = makeMove;
      var spaceDOM = currentGame.board.spaceAt(move[0], move[1]).dom;
      spaceDOM.appendChild(indicator);
      moveIndicators.push(indicator);
    }
  }
}

/**
 * Set the corresponding HTML object for the given piece based on its type and color.
 */
function assignPieceDOM(piece) {
  pieceDOM = pieceImg(piece.img());
  pieceDOM.onclick = showMoves;
  pieceDOM.piece = piece;
  if(piece.color == currentGame.turn) {
    pieceDOM.classList.add("activePiece");
  }
  piece.dom = pieceDOM;
}

/**
 * @param model the piece for which to create an image
 * @return an image corresponding to the given piece's color and type
 */
function pieceImg(model) {
  var pieceDOM = document.createElement('img');
  pieceDOM.classList.add("piece");
  pieceDOM.src = model;
  return pieceDOM;
}

/**
 * @return an HTML selector of pieces for promoting pawns
 */
function pieceSelect(message) {
  var selector = document.createElement('div');
  selector.classList.add('pieceSelect');
  for(var info of currentGame.selectorPieces(message)) {
    var opt = pieceImg(`img/${currentGame.turn}_${info.name}.png`);
    opt.classList.remove('piece');
    opt.classList.add('selectPiece');
    opt.pieceInfo = info;
    if(message == Game.PROMOTE_PAWN_MSG) {
      opt.onclick = promotePawn;
    }
    selector.appendChild(opt);
  }
  return selector;
}

// Initialize the controller for the game
var currentGame = new StandardChess();
var moveIndicators = [];
var selectedPiece = null;

// Ensure all the HTML elements are present before loading the setup file
var setupScript = document.createElement('script');
setupScript.onload = function () {
  // The setup variable is initialized by the setup script
  currentGame.placePieces(setup);
  currentGame.init();
  updateBoard();
};
setupScript.src = currentGame.setup;
document.head.appendChild(setupScript);
