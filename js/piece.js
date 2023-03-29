/**
 * A class representing a piece with a name, color, location, and symbol
 */
class Piece {
  /**
   * Construct a new piece with the given name, color, location, and symbol
   * @param loc an array of the form [file, rank]
   */
  constructor(name, color, loc, symbol) {
    this.name = name;
    this.color = color;
    this.loc = loc;
    this.symbol = symbol
  }
  
  /**
   * @return the path to the image for this piece based on its name and color
   */
  img() {
    return 'img/' + this.color + '_' + this.name + '.png';
  }
  
  /**
   * Change this piece to a different one with the given name, color, and symbol
   * Useful for captures and promotions
   */
  changeTo(name, color, symbol) {
    this.name = name == null ? this.name : name;
    this.color = color == null ? this.color : color;
    this.symbol = symbol == null ? this.symbol : symbol;
  }
  
  /**
   * Construct a piece from the given object in the setup
   */
  static parseSetup(setupObj, loc) {
    if(Object.keys(setupObj).length === 0) {
      return new EmptyPiece(loc);
    }
    return new Piece(setupObj['name'], setupObj['color'], loc, setupObj['symbol']);
  }
  
  // The out-of-bounds piece
  static OOB = null;
}

/**
 * The "piece" present in empty squares on the board.
 */
class EmptyPiece extends Piece {
  constructor(loc) {
    super('empty', '', loc, '');
  }
  
  img() {
    return 'img/empty.png';
  }
}

/**
 * A piece representing every out-of-bounds piece to use instead of a null pointer.
 */
class OOBPiece extends Piece {
  constructor() {
    super('oob', '', [-1, -1], '');
  }
  
  img() {
    return 'img/oob.png';
  }
}

Piece.OOB = new OOBPiece();
