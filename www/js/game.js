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
			game.getAnswerLengthsByLetter();
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
			if (Board.isValidForNum({row:row,col:col},board)) {
				gameView.addNumber(number,{row:row,col:col},board);
				number++;
			}
			
		}
	}
	game.addWords();
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
				//if ($.inArray(letter, game.attemptedLettersInSquares[sqId]) === -1) {
				if (!wordInProgress || $.inArray(wordInProgress+letter, game.attemptedWordsInSquares['s'+row+"_"+startColWord]) === -1) {
					//Checking to see if this letter will fit in this square
					if (Board.isValidForLetter({row:row,col:col},board,letter,wordInProgress,game.attemptedWordsInSquares['s'+row+"_"+startColWord])) {
						letterFound = true;
					} else {
						letterFound = false;
					}
				}
				triedLetters.push(letter);
			}
			
			if (!letterFail) {
				//we've found a letter that works in this square
				wordInProgress += letter;
				//adding this letter to this array to prevent rechecking the square with the same letter if we have to backtrack
				//if (!game.attemptedLettersInSquares[sqId]) {
				//	game.attemptedLettersInSquares[sqId] = [];
				//}
				//game.attemptedLettersInSquares[sqId].push(letter);
				
				board[row][col] = letter;
				
				//resetting variables
				triedLetters = [];
				letterFound = false;
				
				//displaying the current board
				gameView.renderAnswers(board);
				
				//if (col == lastColWord) { //We've finished a complete word
					//add the word to this array so that we don't try to use it again if we backtrack
					if (!game.attemptedWordsInSquares['s'+row+"_"+startColWord]) {
						game.attemptedWordsInSquares['s'+row+"_"+startColWord] = [];
					}
					game.attemptedWordsInSquares['s'+row+"_"+startColWord].push(wordInProgress);
				//}
			} else { //we've run out of letters to try in this square
				if (wordInProgress.length > 0) { //we have to backtrack a column
					//letter = wordInProgress.pop();
					letter = wordInProgress[wordInProgress.length -1];
					//if (!game.attemptedWordsInSquares['s'+row+"_"+startColWord]) {
					//	game.attemptedWordsInSquares['s'+row+"_"+startColWord] = [];
					//}
					//game.attemptedWordsInSquares['s'+row+"_"+startColWord].push(wordInProgress);
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

					//Clearing out all words directly above this word
					var newCol = col;
					var newRow = row - 1;
					var newStartCol;
					while (newCol > startColWord) {
						if (board[newRow][newCol] !== "e" && board[newRow][newCol] !== "b") {
						
						//getting the word containing the current square to add it to the attemptedWords list.
						newStartCol = Board.getFirstColOfWord({row:newRow,col:newCol},board);
						word = Board.getWordFromSquare({row:newRow,col:newStartCol},board);
						game.attemptedWordsInSquares['s'+newRow+"_"+newStartCol].push(word);
						
						//Clearing out that word, too, because we need to try a new word here
						board = Board.clearSquaresToRight({row:newRow,col:newStartCol},board);
						}
						newCol--;
					}
					
					//We want to start back at the first column of this word
					col = startColWord - 1;
					
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