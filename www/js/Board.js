var Board = function() {
}

Board.buildBoard = function(board) {
	var newBoard = [];
	for (var row = 0; row < Config.numRows;row++) {
		newBoard[row] = new Array(); 
		for (var col = 0; col < Config.numCols;col++) {
			if (!board) {
				newBoard[row][col] = "e";
			} else {
				newBoard[row][col] = board[row][col];
			}
		}
	}
	return newBoard;
}			

Board.addBlackSquares = function(board) {
	var numBlackBoxesInRow = 0;
	var numWordsInRow = 0;
	var blackBoxLimit = 0;
	var wordLength = 0;
	
	for (var row = 0; row < 8;row++) {
		var reverseRow = (Config.numRows - 1) - row; //diagonal mirror image coordinate
		
		//Choosing how many black boxes will be on this row with a random number and weighting the choices
		var randNum = Math.floor(Math.random() * 20);
		if (randNum < 4) {
			numBlackBoxesInRow = 8;
		} else if (randNum < 8) {
			numBlackBoxesInRow = 4;
		} else if (randNum  < 12) {
			numBlackBoxesInRow = 3;
		} else if (randNum < 15) {
			numBlackBoxesInRow = 5;
		} else if (randNum < 18) {
			numBlackBoxesInRow = 6;
		} else {
			numBlackBoxesInRow = 10;
		}
		var count = 0;
		
		//Loop through all columns of this row until all black boxes are used, or we hit a limit of repitions
		while (numBlackBoxesInRow > 0) {
			count++;
			if (count > 10000) {
				console.log("hit while loop limit");
				break;
			}
			for (var col = 0; col < Config.numCols;col++) {
				var reverseCol = (Config.numCols - 1) - col; //diagonal mirror image coordinate
				
				//Flip a coin to see if we should try to add a black box but only to empty squares
				if (Math.random() > .4 && board[row][col] === "e") {
					//Check to see if this is a valid spot for a black box
					if (Board.isValidBlackSquare({row:row,col:col}, board)) {
						board[row][col] = "b";
						
						if (row !== 7) {
							board[reverseRow][reverseCol] = "b";
							numBlackBoxesInRow--;
						//If we are in the middle row, we need to make sure that it's symmetrical square is also in a valid place
						} else {
							if (Board.isValidBlackSquare({row:reverseRow,col:reverseCol}, board)) {
								board[reverseRow][reverseCol] = "b";
								numBlackBoxesInRow = numBlackBoxesInRow - 2;
							} else {
								board[row][col] = "e"
							}
						}
					}
				}	
			}
		}
    }
	return board;
}

Board.isValidBlackSquare = function(square,board) {
	for (var i=0; i<game.directionsArray.length; i++) {
		var numSquares = Board.findNumEmptySquaresInDirection(square,game.directionsArray[i],board);
		
		if (numSquares > 0 && numSquares < 4) {
			return false;
		}
	}
	return true;
}

Board.isValidForLetter = function(square,board,letter,word,attemptedWords) {
	var wordLength;
	var wordChoices;
	var priorLetters;
	var valid = false;
	//checking across
	console.log("*********************");
	console.log("*********************");
	console.log("*********************");
	console.log("checking if " + letter + " works in ", square);
	wordLength = Board.getWordLength(square,board,true);
	console.log("wordLength: " + wordLength);
	word += letter;
	console.log("word so far: " + word);
	wordChoices = game.answerLengthsByLetter[wordLength][word];
	if (!wordChoices) {
		console.log("no matching words");
		return false;
	} else if ($.inArray(word, attemptedWords) !== -1) {
		return false;
	}
	
	//checking down
	console.log("Matches! ", wordChoices);
	console.log("Checking down...");
	wordLength = Board.getWordLength(square,board,false);
	console.log("wordLength: " + wordLength);
	word = Board.getWordFromSquare(square,board,false);
	word += letter;
	console.log("word so far: " + word);
	wordChoices = game.answerLengthsByLetter[wordLength][word];
	if (!wordChoices) {
		console.log("no matching words");
		return false;
	} else if ($.inArray(word, attemptedWords) !== -1) {
		return false;
	}
	console.log("Matches! ", wordChoices);
	console.log(letter + " is valid");
	return true;
}

Board.getLetterPosInWord = function(square,board,across) {
	if (across) {
		var squaresWest = Board.findNumEmptySquaresInDirection(square,'w',board);
		return squaresWest + 1;
	} else {
		var squaresNorth = Board.findNumEmptySquaresInDirection(square,'n',board);
		return squaresNorth + 1;
	}
}

Board.getPriorLetters = function(square,board,across) {
	var priorLetters = [];
	
	if (across) {
		var nextSquare = Board.getNextSquareInDirection(square, 'w');
		while (nextSquare) {
			if (board[nextSquare.row][nextSquare.col] !== "e" && board[nextSquare.row][nextSquare.col] !== "b") {
				priorLetters.unshift(board[nextSquare.row][nextSquare.col]);
				nextSquare = Board.getNextSquareInDirection(nextSquare, 'w');
			} else {
				nextSquare = "";
			}
		}
	} else {
		var nextSquare = Board.getNextSquareInDirection(square, 'n');
		while (nextSquare) {
			if (board[nextSquare.row][nextSquare.col] !== "e" && board[nextSquare.row][nextSquare.col] !== "b") {
				priorLetters.unshift(board[nextSquare.row][nextSquare.col]);
				nextSquare = Board.getNextSquareInDirection(nextSquare, 'n');
			} else {
				nextSquare = "";
			}
		}
	}
	return priorLetters;
}

Board.getWordLength = function(square,board,across) {
	if (across) {
		var squaresWest = Board.findNumLetterSquaresInDirection(square,'w',board);
		var squaresEast = Board.findNumLetterSquaresInDirection(square,'e',board);
		return squaresWest + squaresEast + 1;
	} else {
		var squaresNorth = Board.findNumLetterSquaresInDirection(square,'n',board);
		var squaresSouth = Board.findNumLetterSquaresInDirection(square,'s',board);
		return squaresNorth + squaresSouth + 1;
	}
}

Board.isValidForNum = function(square,board) {
	var isValid = false;
	if (board[square.row][square.col] !== "e") {
		return false;
	}
	
	//Checking across
	if (Board.findNumEmptySquaresInDirection(square,'w',board) === 0 && Board.findNumEmptySquaresInDirection(square,'e',board) > 2) {
		return true;
	}
	
	//Checking down
	if (Board.findNumEmptySquaresInDirection(square,'n',board) === 0 && Board.findNumEmptySquaresInDirection(square,'s',board) > 2) {
		return true;
	}
	
	return false;
}

Board.findNumLetterSquaresInDirection = function(square,dir,board) {
	var letterSquares = 0;
	var nextSquare = Board.getNextSquareInDirection(square, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] !== "b") {
			letterSquares++;
			nextSquare = Board.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	return letterSquares;
}

Board.findNumBlackSquaresInDirection = function(square,dir,board) {
	var blackSquares = 0;
	var nextSquare = Board.getNextSquareInDirection(square, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] === "b") {
			blackSquares++;
			nextSquare = Board.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	return blackSquares;
}

Board.findNumEmptySquaresInDirection = function(square,dir,board) {
	var emptySquares = 0;
	var nextSquare = Board.getNextSquareInDirection(square, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] === "e") {
			emptySquares++;
			nextSquare = Board.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	return emptySquares;
}

Board.clearSquaresToRight = function(square,board) {
	var squares = Board.getSquaresInDirection(square,board,'e');
	squares.push(square);
	for (var i=0; i<squares.length;i++) {
		var sqId = "s"+squares[i].row+"_"+squares[i].col;
		board[squares[i].row][squares[i].col] = "e";
		gameView.removeLetter({row:squares[i].row,col:squares[i].col});
		game.attemptedLettersInSquares[sqId] = [];
	}
	return board;
}

Board.getSquaresInDirection = function(square,board,dir) {
	var squares = [];
	var nextSquare = Board.getNextSquareInDirection(square, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] !== "b") {
			squares.push({row:nextSquare.row,col:nextSquare.col});
			nextSquare = Board.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	
	return squares;	
}

Board.getLettersInDirection = function(square,board,dir) {
	var letters = [];
	var nextSquare = Board.getNextSquareInDirection(square, dir);
	
	while (nextSquare) {
		if (board[nextSquare.row][nextSquare.col] !== "b" && board[nextSquare.row][nextSquare.col] !== "e") {
			letters.push(board[nextSquare.row][nextSquare.col]);
			nextSquare = Board.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	
	return letters;	
}

Board.getFirstColOfWord = function(square,board) {
	var numSquares = 0;
	if (board[square.row][square.col] == "b") {
		numSquares = Board.findNumBlackSquaresInDirection(square,'e',board);
		col = square.col + numSquares + 1;
	} else {
		numSquares = Board.findNumLetterSquaresInDirection(square,'w',board);
		col = square.col - numSquares;
	}
	
	return col;
}

Board.getFirstRowOfWord = function(square,board) {
	var numSquares = 0;
	if (board[square.row][square.col] == "b") {
		numSquares = Board.findNumBlackSquaresInDirection(square,'s',board);
		row = square.row + numSquares + 1;
	} else {
		numSquares = Board.findNumLetterSquaresInDirection(square,'n',board);
		row = square.row - numSquares;
	}
	
	return row;
}

Board.getWordFromSquare = function(square,board,across) {
	var letters = [];
	var word = '';
	if (across) {
		square.col = Board.getFirstColOfWord(square,board);
		letters = Board.getLettersInDirection(square,board,'e');
		if (board[square.row][square.col] !== 'e') {
			letters.unshift(board[square.row][square.col]);
		}
		
		word = letters.join('');
	} else {
		square.row = Board.getFirstRowOfWord(square,board);
		letters = Board.getLettersInDirection(square,board,'s');
		if (board[square.row][square.col] !== 'e') {
			letters.unshift(board[square.row][square.col]);
		}
		word = letters.join('');
	}
	return word;
}

Board.getNextSquareInDirection = function(square, direction) {
	var col = square.col;
	var row = square.row;
	
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
