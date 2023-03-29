/**
 * A class representing the controller for a game of chess (or variant)
 */
class Game {
  /** Allows piece movement anywhere on the board */
  static DEBUG = false;
  
  /** A message to the front-end to proceed as normal */
  static OKAY_MSG = 0;
  /** A message to the front-end to stall to allow the user to promote a pawn */
  static PROMOTE_PAWN_MSG = 1;
  
  /**
   * Construct a new game with the given board size and starting player
   */
  constructor(boardSize, turn) {
    this.board = new Board(boardSize);
    this.turn = turn;
  }
  
  /**
   * Place pieces using the given setup
   */
  placePieces(setup) {
    for(var f = 0; f < this.board.size[0]; f++) {
      for(var r = 0; r < this.board.size[1]; r++) {
        var piece = Piece.parseSetup(setup[f][r], [f, r]);
        this.board.placePiece(f, r, piece);
      }
    }
  }
}

/**
 * Standard chess rules
 */
class StandardChess extends Game {
  /** A message indicating a pawn double-move */
  static DOUBLE_MOVE = 0;
  /** A message indicating a pawn en passant capture */
  static EN_PASSANT = 1;
  /** A message indicating a castle */
  static CASTLE = 2;
  
  /**
   * Initialize a chess game with an 8x8 board with white going first using the standard setup
   */
  constructor() {
    super([8, 8], 'w');
    this.setup = 'setups/standard.js';
  }
  
  /**
   * Initialize the game
   */
  init() {
    this.initPieces();
  }
  
  /**
   * Initialize the pieces
   */
  initPieces() {
    // Mark whether the pieces have moved yet (useful for pawn double movement, castling)
    for(var f = 0; f < this.board.size[0]; f++) {
      for(var r = 0; r < this.board.size[1]; r++) {
        var piece = this.board.pieceAt(f, r);
        piece.moved = false;
        if(piece.name == 'pawn') {
          piece.doubleMoved = false;
        }
      }
    }
  }
  
  /**
   * @return the pieces for the selector menu for pawn promotion
   */
  selectorPieces(message) {
    if(message == Game.PROMOTE_PAWN_MSG) {
      return [{name: 'knight', symbol: 'N'},
              {name: 'bishop', symbol: 'B'},
              {name: 'rook', symbol: 'R'},
              {name: 'queen', symbol: 'Q'}];
    }
  }
  
  /**
   * @param board the board for which to calculate valid moves. Useful for looking at future
   *        boards to determine checks and mates.
   * @return the valid moves for the given piece
   */
  validMoves(board, piece) {
    var moves = [];
    if(Game.DEBUG) {
      for(var f = 0; f < this.board.size[0]; f++) {
        for(var r = 0; r < this.board.size[1]; r++) {
          moves.push([f, r]);
        }
      }
      return moves;
    }
    var pf = piece.loc[0];
    var pr = piece.loc[1];
    // Pawn movement
    if(piece.name == 'pawn') {
      // White pawn
      if(piece.color == 'w') {
        // 1 space forward
        if(board.spaceAt(pf, pr+1).empty) {
          moves.push([pf, pr+1]);
          // 2 spaces forward
          if(!piece.moved && board.spaceAt(pf, pr+2).empty) {
            moves.push([pf, pr+2, StandardChess.DOUBLE_MOVE]);
          }
        }
        // Capture diagonally
        if(board.pieceAt(pf+1, pr+1).color == 'b') {
          moves.push([pf+1, pr+1]);
        }
        if(board.pieceAt(pf-1, pr+1).color == 'b') {
          moves.push([pf-1, pr+1]);
        }
        //En passant
        var sidePiece = board.pieceAt(pf+1, pr);
        if(sidePiece.color == 'b' && sidePiece.name == 'pawn' && sidePiece.doubleMoved) {
          moves.push([pf+1, pr+1, StandardChess.EN_PASSANT]);
        }
        sidePiece = board.pieceAt(pf-1, pr);
        if(sidePiece.color == 'b' && sidePiece.name == 'pawn' && sidePiece.doubleMoved) {
          moves.push([pf-1, pr+1, StandardChess.EN_PASSANT]);
        }
      // Black pawn
      } else if(piece.color == 'b') {
        // 1 space forward
        if(board.spaceAt(pf, pr-1).empty) {
          moves.push([pf, pr-1]);
          // 2 spaces forward
          if(!piece.moved && board.spaceAt(pf, pr-2).empty) {
            moves.push([pf, pr-2, StandardChess.DOUBLE_MOVE]);
          }
        }
        // Capture diagonally
        if(board.pieceAt(pf+1, pr-1).color == 'w') {
          moves.push([pf+1, pr-1]);
        }
        if(board.pieceAt(pf-1, pr-1).color == 'w') {
          moves.push([pf-1, pr-1]);
        }
        //En passant
        var sidePiece = board.pieceAt(pf+1, pr);
        if(sidePiece.color == 'w' && sidePiece.name == 'pawn' && sidePiece.doubleMoved) {
          moves.push([pf+1, pr-1, StandardChess.EN_PASSANT]);
        }
        sidePiece = board.pieceAt(pf-1, pr);
        if(sidePiece.color == 'w' && sidePiece.name == 'pawn' && sidePiece.doubleMoved) {
          moves.push([pf-1, pr-1, StandardChess.EN_PASSANT]);
        }
      }
    // Knight movement
    } else if(piece.name == 'knight') {
      var possibleMoves = [[pf+2, pr+1], [pf+1, pr+2], 
                           [pf-2, pr+1], [pf-1, pr+2],
                           [pf+2, pr-1], [pf+1, pr-2],
                           [pf-2, pr-1], [pf-1, pr-2]];
      for(var move of possibleMoves) {
        if(this.board.pieceAt(move[0], move[1]).color != piece.color) {
          if(this.insideBoard(move[0], move[1])) {
            moves.push(move);
          }
        }
      }
    // Bishop movement
    } else if(piece.name == 'bishop') {
      for(var df = -1; df <= 1; df += 2) {
        for(var dr = -1; dr <= 1; dr += 2) {
          var move = [pf + df, pr + dr];
          var flag = true;
          while(flag) {
            if(!this.insideBoard(move[0], move[1]) || this.board.pieceAt(move[0], move[1]).color == piece.color) {
              flag = false;
            } else if(!this.board.spaceAt(move[0], move[1]).empty) {
              flag = false;
              moves.push([move[0], move[1]]);
            } else {
              moves.push([move[0], move[1]]);
            }
            move[0] += df;
            move[1] += dr;
          }
        }
      }
    // Rook movement
    } else if(piece.name == 'rook') {
      for(var delta of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
        var df = delta[0];
        var dr = delta[1];
        var move = [pf + df, pr + dr];
        var flag = true;
        while(flag) {
          if(!this.insideBoard(move[0], move[1]) || this.board.pieceAt(move[0], move[1]).color == piece.color) {
            flag = false;
          } else if(!this.board.spaceAt(move[0], move[1]).empty) {
            flag = false;
            moves.push([move[0], move[1]]);
          } else {
            moves.push([move[0], move[1]]);
          }
          move[0] += df;
          move[1] += dr;
        }
      }
    // Queen movement
    } else if(piece.name == 'queen') {
      for(var df = -1; df <= 1; df += 1) {
        for(var dr = -1; dr <= 1; dr += 1) {
          var move = [pf + df, pr + dr];
          var flag = true;
          while(flag) {
            if(!this.insideBoard(move[0], move[1]) || this.board.pieceAt(move[0], move[1]).color == piece.color) {
              flag = false;
            } else if(!this.board.spaceAt(move[0], move[1]).empty) {
              flag = false;
              moves.push([move[0], move[1]]);
            } else {
              moves.push([move[0], move[1]]);
            }
            move[0] += df;
            move[1] += dr;
          }
        }
      }
    } else if(piece.name == 'king') {
      for(var df = -1; df <= 1; df += 1) {
        for(var dr = -1; dr <= 1; dr += 1) {
          var move = [pf + df, pr + dr];
          if(this.insideBoard(move[0], move[1]) && this.board.pieceAt(move[0], move[1]).color != piece.color) {
            moves.push(move);
          }
        }
      }
      // Castling
      if(!piece.moved) {
        // King side
        var flag = true;
        for(var f = pf - 1; f > 0; f--) {
          if(!this.board.spaceAt(f, pr).empty) {
            flag = false;
            break;
          }
        }
        if(flag) {
          var rook = this.board.pieceAt(0, pr);
          if(rook.name == 'rook' && !rook.moved) {
            moves.push([pf-2, pr, StandardChess.CASTLE]);
          }
        }
        // Queen side
        flag = true;
        for(var f = pf + 1; f < this.board.size[0] - 1; f++) {
          if(!this.board.spaceAt(f, pr).empty) {
            flag = false;
            break;
          }
        }
        if(flag) {
          var rook = this.board.pieceAt(this.board.size[0] - 1, pr);
          if(rook.name == 'rook' && !rook.moved) {
            moves.push([pf+2, pr, StandardChess.CASTLE]);
          }
        }
      }
    }
    return moves;
  }
  
  /**
   * @return true if the given file and rank are on the board, false if not
   */
  insideBoard(f, r) {
    return f >= 0 && r >= 0 && f < this.board.size[0] && r < this.board.size[1];
  }
  
  /**
   * Move the given piece using the given move.
   * @param move an array of the form [file, rank, message] where message is optional
   */
  movePiece(piece, move) {
    var emptyPiece = new EmptyPiece([piece.loc[0], piece.loc[1]]);
    this.board.placePiece(piece.loc[0], piece.loc[1], emptyPiece);
    //Special moves
    if(move.length > 2) {
      if(piece.name == 'pawn') {
        if(move[2] == StandardChess.DOUBLE_MOVE) {
          piece.doubleMoved = true;
        } else if(move[2] == StandardChess.EN_PASSANT){
          var behind = piece.color == 'w' ? -1 : 1;
          this.board.placePiece(move[0], move[1] + behind, new EmptyPiece([move[0], move[1] + behind]));
        }
      } else if(piece.name == 'king') {
        if(move[2] == StandardChess.CASTLE) {
          var rook = null;
          if(move[0] > piece.loc[0]) {
            rook = this.board.pieceAt(this.board.size[0] - 1, piece.loc[1]);
            this.movePiece(rook, [move[0] - 1, move[1]]);
          } else {
            rook = this.board.pieceAt(0, piece.loc[1]);
            this.movePiece(rook, [move[0] + 1, move[1]]);
          }
        }
      }
    }
    
    this.board.placePiece(move[0], move[1], piece);
    piece.loc = [move[0], move[1]];
    
    piece.moved = true;
    
    // Remove double move flag
    for(var f = 0; f < this.board.size[0]; f++) {
      for(var r = 0; r < this.board.size[1]; r++) {
        var p = this.board.pieceAt(f, r);
        if(p.color != this.turn && p.name == 'pawn') {
          p.doubleMoved = false;
        }
      }
    }
    
    //Messages
    if(piece.name == 'pawn') {
      if(piece.color == 'w' && piece.loc[1] == 7 || piece.color == 'b' && piece.loc[1] == 0) {
        return Game.PROMOTE_PAWN_MSG;
      }
    }
    return Game.OKAY_MSG;
  }
  
  /**
   * Toggle which player can move
   */
  nextTurn() {
    this.turn = this.turn == 'w' ? 'b' : 'w';
  }
  
  /**
   * @return true if the current turn is white, false otherwise
   */
  showFlippedBoard() {
    return this.turn == 'w';
  }
}
