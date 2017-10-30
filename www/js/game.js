/*
I think I need to build up a complete word first before adding it into the grid. So, start with a random letter. Make sure that there are words of that length that start with the random letter, both across and down. If so, add that letter into a wordInProgress array and move to the next column. If we get to a point where we can't find a letter to fit in both an across and down word, we need to move back a column and try a different letter.


*/


var game = {

	init: function(){
		this.rows = Config.numRows;
		this.cols = Config.numCols;
		//this.state = new State(undefined,level);
		this.availableMoves = new Array();
		this.answers = new Object();
		this.answerLengths = new Object();
		this.answerLengthsByLetter = new Object();
		this.attemptedLettersInSquares = new Object();
		this.attemptedWordsInSquares = new Object();
		this.words = new Object();
		this.words.across = new Object();
		this.words.down = new Object();
		this.squares = new Object();
		this.lettersArray = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];	
		this.directionsArray = ["n","e","s","w"];					
		this.board = Board.buildBoard();
		this.board = Board.addBlackSquares(this.board);
		gameView.renderBoard(this.board);
		game.getAnswers();
		gameView.showBoard();
		
	
	}	
}


game.getAnswers = function() {
	console.log("getAnswers");
	$.ajax({
		'url': "/data/answers_hash.json",
		'dataType': "json",
		'success': function(data) {
			for (var ans in data) {
				//console.log(data[ans]);
				game.answers[ans] = data[ans];
			}
			
            game.getAnswerLengths();
        }
	});
}

game.getAnswerLengths = function() {
	$.ajax({
		'url': "/data/answers_length_hash.json",
		'dataType': "json",
		'success': function(data) {
			for (var len in data) {
				game.answerLengths[len] = data[len];
			}
			game.addNumbers();
			//game.getAnswerLengthsByLetter();
		}
	});
}

game.getAnswerLengthsByLetter = function() {
	$.ajax({
		'url': "/data/answers_length_by_letter_hash.json",
		'dataType': "json",
		'success': function(data) {
			console.log("success");
			for (var x in data) {
				game.answerLengthsByLetter[x] = data[x];
			}
			game.addNumbers();
		}
	});
}

game.addNumbers = function() {
	var board = this.board;
	var number = 1;
	
	for (var row = 0; row < Config.numRows;row++) {
		for (var col = 0; col < Config.numCols;col++) {
			if (board[row][col] !== "e") {
				continue;
			}
			game.squares['s'+row+'_'+col] = new Object();
			if (Board.isValidForNum({row:row,col:col},board)) {
				gameView.addNumber(number,{row:row,col:col},board);
				game.squares['s'+row+'_'+col].num = number;
				number++;
			}
			
		}
	}
	game.fillBoardWithWords(board);
}

game.doWordsCross = function(word1, word2) {
	var squares1 = word1.squares;
	var squares2 = word2.squares;
	
	return squares1.some(function (sq) {
        return squares2.indexOf(sq) >= 0;
    });	
}

game.fillBoardWithWords = function(board) {
	var word1;
	var word2;
	var wordPlace = {};
	var intersectingSquares = [];
	var usedWords = {};
	var across = true;
	var filledWordPlaces = [];
	var	matchPattern;
	
	//this holds instances of words that are in the board. game.words.across["1"] is 1 across, it will have properties like length, squares (square coords from the board) that it occupies, and the word that occupies it.
	var words = game.createWordsObj(board);
	
	// Get an array of the across keys:
	var acrossArr = Object.keys(words.across);
	
	// Then sort by using the keys to lookup the values in the original object:
	acrossArr.sort(function(a, b) { 
		return words.across[b].length - words.across[a].length;
	});
	
	// Get an array of the down keys:
	var downArr = Object.keys(words.down);
	
	// Then sort by using the keys to lookup the values in the original object:
	downArr.sort(function(a, b) {
		return words.down[b].length - words.down[a].length;
	});
	
	console.log(acrossArr);
	console.log(downArr);
	
	while (acrossArr.length > 0 && downArr.length > 0) {
		wordPlace = {};
		//Getting the longest word place on the board, either across or down
		if (across) {
			//wordPlace["num"] = acrossArr.shift();
			wordPlace["num"] = acrossArr[0];
			wordPlace["dir"] = "across";
			word1 = words.across[wordPlace["num"]];
		} else {
			//wordPlace["num"] = downArr.shift();
			wordPlace["num"] = downArr[0];
			wordPlace["dir"] = "down";
			word1 = words.down[wordPlace["num"]];
		}
		
		if (!wordPlace["usedWords"]) {
			wordPlace["usedWords"] = [];
		}
		
		/*
		if (word2) {
			var count = 1;
			var limit = word1.squares.length;
			while (!game.doWordsCross(word1, word2)) {
				if (across) {
					wordPlace["num"] = acrossArr[count];
					wordPlace["dir"] = "across";
					word1 = words.across[wordPlace["num"]];
				} else {
					wordPlace["num"] = downArr[count];
					wordPlace["dir"] = "down";
					word1 = words.down[wordPlace["num"]];
				}
				count++;
				if (count == limit) {
					break;
				}
			}
		}
		*/
		console.log("***************");
		console.log("doing " + wordPlace['num'] + wordPlace['dir']);
		
		//gets a regex pattern such as [A-Z][A-Z]G[A-Z] that any new word needs to match
		matchPattern = game.getMatchPattern(word1,board);
		if (word2) {
			var count = 1;
			var limit = word1.squares.length;
			while (!matchPattern) {
				console.log("this word doesn't cross shit!")
				if (across) {
					wordPlace["num"] = acrossArr[count];
					wordPlace["dir"] = "across";
					word1 = words.across[wordPlace["num"]];
				} else {
					wordPlace["num"] = downArr[count];
					wordPlace["dir"] = "down";
					word1 = words.down[wordPlace["num"]];
				}
				console.log("doing " + wordPlace['num'] + wordPlace['dir'] + " instead!!!!");
				matchPattern = game.getMatchPattern(word1,board);
				count++;
				if (count == limit) {
					break;
				}
			}
		}
		var wordLength = word1.length;
		var possibleWords = game.getPossibleWords(wordLength, matchPattern, wordPlace["usedWords"]);
		while (possibleWords.length == 0) {
			//debugger;
			console.log("Can't find a word to fit");
			/*
			if (across) {
				acrossArr.unshift(wordPlace["num"]);
			} else {
				downArr.unshift(wordPlace["num"]);
			}
			*/
			wordPlace = filledWordPlaces.pop();
			word = words[wordPlace["dir"]][wordPlace["num"]];
			console.log("going back to " + wordPlace['num'] + wordPlace['dir']);
			board = Board.clearBoard(board);
			board = Board.addWordsToBoard(filledWordPlaces,words,board);
			wordLength = word.length;
			matchPattern = game.getMatchPattern(word,board);
			possibleWords = game.getPossibleWords(wordLength, matchPattern, wordPlace["usedWords"]);
			if (wordPlace.dir == "across") {
				wordPlace["num"] = acrossArr.shift();
				across = false;
			} else {
				wordPlace["num"] = downArr.shift();
				across = true;
			}	
		}	
		var chosenWord = possibleWords[Math.floor(Math.random()*possibleWords.length)];
		console.log("found word: " + chosenWord);
		
		board = game.storeWordInBoard(chosenWord,word1,board);
		wordPlace["usedWords"].push(chosenWord);
		filledWordPlaces.push(wordPlace);
		gameView.renderAnswers(board);
		if (across) {
			acrossArr.shift();
			across = false;
		} else {
			downArr.shift();
			across = true;
		}
		word2 = word1;
	}
}

game.analyzeBoard = function(board) {
	
	//this holds instances of squares. The keys are the coords (ex. s1_1) and they hold data about what number is in the square, how long the words are both across and down, and eventually clues and answers
	var squares = game.createSquaresObj(board);
}

game.storeWordInBoard = function(word,place,board) {
	var squares = place.squares;
	if (word.length != squares.length) {
		return false;
	}
	for (var i=0;i<squares.length;i++) {
		var sqObj = game.getSquareFromId(squares[i]);
		board[sqObj.row][sqObj.col] = word.charAt(i);
	}
	return board;
}

game.clearWordInBoard = function(place,board) {
	var squares = place.squares;
	for (var i=0;i<squares.length;i++) {
		board[squares[i].row][squares[i].col] = "e";
	}
	return board;
}

game.getPossibleWords = function(length, pattern, usedWords) {
	var wordChoices = [];
	var possibleWordChoices = game.answerLengths[length];
	if (pattern) {
		for (var i=0; i<possibleWordChoices.length; i++) {
			if (possibleWordChoices[i].match(pattern)) {
				if ($.inArray(possibleWordChoices[i], usedWords) == -1) {
					wordChoices.push(possibleWordChoices[i]);
				}	
			}
		}
	} else {
		wordChoices = possibleWordChoices;
	}
	return wordChoices;
}

game.getIntersectingSquares = function(word1,word2,board) {
	var squares1 = word1.squares;
	var squares2 = word2.squares;
	var intersections = [];
	
	for (var i=0; i<squares1.length; i++) {
		var index = squares2.indexOf(squares1[i]);
		if (index > 0) {
			var square = squares2[index];
			square = game.getSquareFromId(square);
			var letter = board[square.row][square.col];
			intersections.push({square:square,letter:letter});
		}
	}
	return intersections;
}

game.getMatchPattern = function(word,board) {
	var matchPattern = '';
	var matchCount = 0;
	var squares = word.squares;
	for (var i=0; i<squares.length; i++) {
		var sqObj = game.getSquareFromId(squares[i]);
		if (board[sqObj.row][sqObj.col] == "e") {
			matchPattern += "[A-Z]";
		} else {
			matchPattern += board[sqObj.row][sqObj.col];
			matchCount++;
		}
	}
	if (!matchCount) {
		matchPattern = false;
	}
	return matchPattern;
}

game.getSquareFromId = function(id) {
	var row = id.match(/^s([0-9]{1,})_/)[1];
	var col = id.match(/_([0-9]{1,})$/)[1];
	
	return {row:row,col:col};
}

game.createWordsObj = function(board) {
	
	var inMiddleOfWord = false;
	var longestWordLength;
	var number;
	//across
	var across = true;
	for (var row = 0; row < Config.numRows;row++) {
		inMiddleOfWord = false;
		for (var col = 0; col < Config.numCols;col++) {
			var sqId = 's'+row+'_'+col;
			if (board[row][col] == "b") {
				inMiddleOfWord = false;
				continue;
			} else if (!inMiddleOfWord) {
				number = game.squares[sqId]["num"];
				inMiddleOfWord = true;
				game.words["across"][number] = {};
				game.words["across"][number].squares = [];
			}
			
			var wordLength = Board.getWordLength({row:row,col:col},board,across);
			//game.words["across"][number].squares.push({row:row,col:col});
			game.words["across"][number].squares.push(sqId);
			game.words["across"][number].length = wordLength;
		}
	}
	//down
	var across = false;
	for (var col = 0; col < Config.numCols;col++) {
		inMiddleOfWord = false;
		for (var row = 0; row < Config.numRows;row++) {
			var sqId = 's'+row+'_'+col;
			if (board[row][col] == "b") {
				inMiddleOfWord = false;
				continue;
			} else if (!inMiddleOfWord) {
				number = game.squares[sqId]["num"];
				inMiddleOfWord = true;
				game.words["down"][number] = {};
				game.words["down"][number].squares = [];
			}
			
			var wordLength = Board.getWordLength({row:row,col:col},board,across);
			game.words["down"][number].squares.push(sqId);
			game.words["down"][number].length = wordLength;
		}
	}
	return game.words;
}

game.addWords = function() {
	var randNum;
	var letter;
	var letterFound = false; //a letter that works in a column has been found
	var letterFail = false; //no letter will work in the column
	var triedLetters = [];
	var wordInProgress = [];
	var attemptedWords = [];
	var word;
	var wordLength;
	var startColWord; //Column that is the start of a word
	var lastColWord; //Column that is the end of a word
	var board = Board.buildBoard(game.board);
	
	for (var row = 0; row < Config.numRows;row++) {
		//if (row == 8) {
		//	debugger;
		//}
		//debugger;
		//starting a new row, so reset variables
		wordInProgress = '';
		wordLength = 0;
		startColWord = '';
		lastColWord = '';
		for (var col = 0; col < Config.numCols;col++) {
			if (board[row][col] !== "e") {
				//we aren't in the middle of a word so reset variables
				wordInProgress = '';
				wordLength = 0;
				startColWord = '';
				lastColWord = '';
				continue;
			}
			
			//Setting some variables if they aren't already. These are reset after a word is completed
			if (!wordLength) {
				wordLength = Board.getWordLength({row:row,col:col}, board, true);
				startColWord = Board.getFirstColOfWord({row:row,col:col}, board);
				lastColWord = startColWord + wordLength - 1;
			}
			
			if (board[row][startColWord] == "e") {
				col = startColWord;
			}
			
			var sqId = 's'+row+'_'+col;
			if (!game.attemptedLettersInSquares[sqId]) {
				game.attemptedLettersInSquares[sqId] = [];
			}
			if (!game.attemptedWordsInSquares['s'+row+"_"+startColWord]) {
				game.attemptedWordsInSquares['s'+row+"_"+startColWord] = [];
			}
			
			//Searching for a letter to fit in the current square		
			while (!letterFound && !letterFail) {
				
				//Choose a random letter
				randNum = Math.floor(Math.random() * (game.lettersArray.length));
				letter = game.lettersArray[randNum];
				
				//if this letter has been tried in this column while creating this word, pick another letter
				while (($.inArray(letter, triedLetters) != -1)) {
					if (triedLetters.length > 25) {
						letterFail = true;	
						break;
					}
					randNum = Math.floor(Math.random() * (game.lettersArray.length));
					letter = game.lettersArray[randNum];
				}
				
				//attemptedLetters have been tried in the squares that serve as the key in the making of this word
				if ($.inArray(letter, game.attemptedLettersInSquares[sqId]) === -1) {
					if (!wordInProgress || $.inArray(wordInProgress+letter, game.attemptedWordsInSquares['s'+row+"_"+startColWord]) === -1) {
						//Checking to see if this letter will fit in this square
						if (Board.isValidForLetter({row:row,col:col},board,letter,wordInProgress,game.attemptedWordsInSquares['s'+row+"_"+startColWord])) {
							letterFound = true;
						} else {
							letterFound = false;
						}
					}
				}
				triedLetters.push(letter);
			}
			
			if (!letterFail) {
				//we've found a letter that works in this square
				wordInProgress += letter;
				//adding this letter to this array to prevent rechecking the square with the same letter if we have to backtrack
				game.attemptedLettersInSquares[sqId].push(letter);
				
				board[row][col] = letter;
				
				//resetting variables
				triedLetters = [];
				letterFound = false;
				
				//displaying the current board
				gameView.renderAnswers(board);
				
				if (col == lastColWord) { //We've finished a complete word
					//add the word to this array so that we don't try to use it again if we backtrack
					game.attemptedWordsInSquares['s'+row+"_"+startColWord].push(wordInProgress);
					
					//clearing out the attempted letters in the squares for this word. We may need to use them in the future in backtracking. 
					var squares = Board.getSquaresInDirection({row:row,col:startColWord},board,'e');
					for (var i=0;i<squares.length;i++) {
						var tmpSqId = "s"+squares[i].row+"_"+squares[i].col;
						game.attemptedLettersInSquares[tmpSqId] = [];
					}
					game.attemptedLettersInSquares['s'+row+'_'+startColWord] = [];
				}
			} else { //we've run out of letters to try in this square which means that we need to find a different letter in the previous column
				if (wordInProgress.length > 0) {
					letter = wordInProgress[wordInProgress.length -1];
					game.attemptedLettersInSquares[sqId].push(letter);
					game.attemptedWordsInSquares['s'+row+"_"+startColWord].push(wordInProgress);
					wordInProgress = wordInProgress.slice(0, -1);
					
					//resetting variables
					triedLetters = [];
					triedLetters.push(letter);
					letterFail = false;
					
					//clearing out letters in this word from the previous square on.
					board = Board.clearSquaresToRight({row:row,col:col-1},board);
					
					//going back one column (subtracting 2 because 1 will be added back)
					col = col - 2;
					
					gameView.renderAnswers(board);
				} else {
					//Clearing out the current word we're working on because it won't work
					board = Board.clearSquaresToRight({row:row,col:startColWord},board);
					
					//we will be backtracking up a row, so we can clear out the attemptedWord from this square because the word above will change, so it's possible this word could work
					game.attemptedWordsInSquares['s'+row+"_"+startColWord] = [];
					
					//clearing out the attempted letters in the squares for this word. We may need to use them in the future in backtracking. 
					var squares = Board.getSquaresInDirection({row:row,col:startColWord},board,'e');
					for (var i=0;i<squares.length;i++) {
						var tmpSqId = "s"+squares[i].row+"_"+squares[i].col;
						game.attemptedLettersInSquares[tmpSqId] = [];
					}
					game.attemptedLettersInSquares['s'+row+'_'+startColWord] = [];

					//Clearing out all words directly above this word
					var newCol = lastColWord;
					var newRow = row - 1;
					var newStartCol;
					while (newCol > startColWord) {
						if (board[newRow][newCol] !== "e" && board[newRow][newCol] !== "b") {
						
						//getting the word containing the current square to add it to the attemptedWords list.
						newStartCol = Board.getFirstColOfWord({row:newRow,col:newCol},board);
						//word = Board.getWordFromSquare({row:newRow,col:newStartCol},board,true);
						//game.attemptedWordsInSquares['s'+newRow+"_"+newStartCol].push(word);
						
						//Clearing out that word, too, because we need to try a new word here
						board = Board.clearSquaresToRight({row:newRow,col:newStartCol},board);
						}
						newCol--;
					}
					
					
					//We want to start back at the first column of this word
					col = newStartCol - 1;
					
					//Moving up a row
					row--;
					
					//reseting variables
					triedLetters = [];
					letterFail = false;
					wordInProgress = '';
					wordLength = 0;
					startColWord = '';
					lastColWord = '';
					
					gameView.renderAnswers(board);
				}	
			}
		}
	}
}