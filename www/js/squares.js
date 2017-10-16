var squares = function() {
}

squares.isEmpty = function(col, row, board) {
	if (board[row][col] === 'empty') {
		return true;
	} else {
		return false;
	}
}

squares.isOccupiedBy = function(col, row) {
	if (game.board[row][col] === 'empty') {
		return false;
	} else {
		game.board[row][col];
	}
}

squares.getRow = function(coords) {
	var row = coords.match(/^s?(.*?)_/);
	return row[1];
}

squares.getCol = function(coords) {
	var col = coords.match(/_(.*?)$/);
	return col[1];
}

//take a square object like {col:3,row:4} and returns s3_4
squares.getSquareId = function(square) {
	return 's'+square.row+'_'+square.col;
}

squares.findNumEmptySquaresInDirection = function(coords,dir) {
	var emptySquares = 0;
	var nextSquare = squares.getNextSquareInDirection(coords, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] == "empty") {
			emptySquares++;
			nextSquare = squares.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	return emptySquares;
}

squares.getNextSquareInDirection = function(coords, direction) {
	var col = coords.col;
	var row = coords.row;
	
	if (direction.match(/n/)) {
		row--;
	} 
	
	if (direction.match(/e/)) {
		col++;
	} 
	
	if (direction.match(/s/)) {
		row++;
	} 
	
	if (direction.match(/w/)) {
		col--;
	}
	
	if (col >= 0 && col < game.cols && row >= 0 && row < game.rows) {
		return {row:row,col:col};
	} else {
		return false;
	}
}

squares.areCoordsInArray = function(coords, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].row == coords.row && arr[i].col == coords.col) {
			return true;
		} 
	}
	return false;
}

squares.addPiece = function(coords,pieceId,board) {
	var row = coords.row;
	var col = coords.col;
	board[row][col] = pieceId;
	return board;
}

squares.removePiece = function(coords,board) {
	var row = coords.row;
	var col = coords.col;
	board[row][col] = "empty";
	return board;
}

squares.getPlayerSquares = function(player,board) {
	var playerSquares = [];
	
	for (var row = 0;row<game.row;row++) {
		for (var col = 0;col<game.cols;col++) {
			if (board[row][col] === player) {
				playerSquares.push({row:row,col:col});
			}
		}
	}
	return playerSquares;
}