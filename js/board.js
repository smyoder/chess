/**
 * A class representing a space with a color and a piece.
 */
class Space {
  constructor(color, piece) {
    this.color = color;
    this.setPiece(piece);
  }
  
  /**
   * Set the piece for this space to the given piece. If the piece is empty, set this.empty to true
   */
  setPiece(piece) {
    this.empty = piece instanceof EmptyPiece;
    this.piece = piece;
  }
  
  /**
   * @return the image for this space
   */
  img() {
    return 'img/' + this.color + '_space.png';
  }
  
  //The out-of-bounds space.
  static OOB = null;
}

/**
 * A space representing every out-of-bounds space to use instead of a null pointer.
 */
class OOBSpace extends Space {
  constructor() {
    super('', new OOBPiece());
  }
  
  /**
   * Do nothing
   */
  setPiece(piece) {
    //Do nothing
  }
  
  /**
   * Return the out-of-bounds image (a blank image)
   */
  img() {
    return 'img/oob.png';
  }
}

Space.OOB = new OOBSpace();

/**
 * A class representing a board containing a grid of spaces
 */
class Board {
  /**
   * Construct a board with the given size
   * @param size an array with the following format [# of files, # of ranks]
   */
  constructor(size) {
    this.size = size;
    this.board = [];
    var color = 'b';
    for(var f = 0; f < size[0]; f++) {
      var file = [];
      for(var r = 0; r < size[1]; r++) {
        file.push(new Space(color, null));
        color = color == 'b' ? 'w' : 'b';
      }
      color = color == 'b' ? 'w' : 'b';
      this.board.push(file);
    }
  }
  
  /**
   * @return the space at the given file and rank
   */
  space(file, rank) {
    return this.board[file][rank];
  }
  
  /**
   * Place the given piece at the given file and rank
   */
  placePiece(file, rank, piece) {
    this.board[file][rank].setPiece(piece);
  }
  
  /**
   * @return the space at the given file and rank. If the position is not on the board, return the
   *         OOB space
   */
  spaceAt(file, rank) {
    if(file >= this.size[0] || file < 0 || rank >= this.size[1] || rank < 0) {
      return Space.OOB;
    }
    return this.board[file][rank];
  }
  
  /**
   * @return the piece at the given file and rank. If the position is not on the board, return the
   *         OOB piece
   */
  pieceAt(file, rank) {
    if(file >= this.size[0] || file < 0 || rank >= this.size[1] || rank < 0) {
      return Piece.OOB;
    }
    return this.board[file][rank].piece;
  }
}
