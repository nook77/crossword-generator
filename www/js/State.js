var State = function(state) {

	if (typeof state !== "undefined") {
		this.board = game.buildBoard(state.board);
		this.player = state.player;
		this.numOfMoves = state.numOfMoves;
		this.status = state.status;
		this.pOnePiecesNum = state.pOnePiecesNum;
		this.pTwoPiecesNum = state.pTwoPiecesNum;
		this.result = state.result;
		this.availableJumps = state.availableJumps;
		this.miniMaxDepth = state.miniMaxDepth;
		this.availableMoves = state.availableMoves;
		this.kings = state.kings.slice();
//		this.checkingForJumps = state.checkingForJumps;
	} else {
		var tmpBoard;
		/*
		var tmpBoard = [
		["null", "pTwo1", "null", "empty", "null", "empty", "null", "empty"],
		["pOne1", "null", "empty", "null", "empty", "null", "empty", "null"],
		["null", "empty", "null", "empty", "null", "empty", "null", "empty"],
		["empty", "null", "empty", "null", "empty", "null", "empty", "null"],
		["null", "empty", "null", "empty", "null", "pTwo5", "null", "empty"],
		["empty", "null", "empty", "null", "empty", "null", "empty", "null"],
		["null", "empty", "null", "pOne2", "null", "empty", "null", "empty"],
		["empty", "null", "empty", "null", "empty", "null", "empty", "null"]
		];
		this.pOnePiecesNum = 2;
		this.pTwoPiecesNum = 2;
		*/
		this.board = game.buildBoard(tmpBoard);
		this.player = "pOne";
		this.numOfMoves = 0;
		this.status = "running";
		this.pOnePiecesNum = Config.numPlayerPieces;
		this.pTwoPiecesNum = Config.numPlayerPieces;
		this.result = "";
		this.availableJumps = new Array();
		this.miniMaxDepth = 1;
		this.availableMoves = new Array();
		this.kings = [];
//		this.checkingForJumps = false;
	}
	
	this.changeTurn = function() {
		this.player = game.getToggledplayer(this.player);
	}
	
	this.getAvailableMoves = function() {
		if (this.availableJumps.length !== 0) {
			return this.availableJumps;
		} else {
			return this.availableMoves;
		}
	}

	this.setAvailableMoves = function(jumpingPieceId,currentSquare) {
		var player = this.player;
		var board = this.board;
		var nextSquare;
		var dirs;
		var pieceId;
		var moves = [];
		var moveSquares = [];
		var moveDirs = [];
		var jumpData = {};

		for (var row = 0; row < Config.numRows;row++) {
			for (var col = 0; col < Config.numCols;col++) {
				var pieceId = board[row][col];
				if (game.getPlayerFromPieceId(pieceId) !== player) {
					continue;
				}
				
				var currentSquare = {row:row,col:col};
				
				dirs = game.moveDirections[this.player];
				
				if (jQuery.inArray(pieceId, this.kings) !== -1) {
					dirs = dirs = game.kingDirections;
				}
				
				for (var i=0; i<dirs.length; i++) {
					if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
						if (board[nextSquare.row][nextSquare.col] === "empty") {
							var move = new Move(pieceId, currentSquare, nextSquare, '', dirs[i], player);
							moves.push(move);
						} 
					}
    			}
    		}
		}
		this.availableMoves = moves;
	}
	
	this.setAvailableJumps = function(pieceToCheck) {
		var jumps = [];
		var singlePiece = false;
		if (pieceToCheck) {
			singlePiece = true;
		}
		for (var row = 0; row < Config.numRows;row++) {
			for (var col = 0; col < Config.numCols;col++) {			
				if (pieceToCheck && this.board[row][col] !== pieceToCheck) {
					continue;
				} else {
					var pieceId = this.board[row][col];
					if (game.getPlayerFromPieceId(pieceId) !== this.player) {
						pieceId = '';
						continue;
					}
				}
				
				var currentSquare = {row:row,col:col};
				dirs = game.moveDirections[this.player];
    				
				if (jQuery.inArray(pieceId, this.kings) !== -1) {
					dirs = game.kingDirections;
				}
				
				for (var i=0; i<dirs.length; i++) {
					if (nextSquare = squares.getNextSquareInDirection(currentSquare, dirs[i])) {
						var pieceInSquareId = this.board[nextSquare.row][nextSquare.col];
						if (game.getPlayerFromPieceId(pieceInSquareId) === game.getToggledplayer(this.player)) {
							if (game.isJumpable(nextSquare, dirs[i], this.player, this.board)) {
								var jumpedSquare = nextSquare;
								nextSquare = squares.getNextSquareInDirection(jumpedSquare, dirs[i]);
							
								var jump = new Move(pieceId, currentSquare, nextSquare, jumpedSquare, dirs[i], this.player);
								jumps.push(jump);
							}
						}
					}
				}
			}
		}
		this.availableJumps = jumps;
	}
	
	this.isEndState = function() {
		var winner = game.checkForWin(this);
		if (winner) {
			this.result = winner + " wins";
			this.status = "ended";
			this.winner = winner;
			return true;
		} else {
			return false;
		}
	}
}