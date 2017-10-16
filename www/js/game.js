/*
I think I need to build up a complete word first before adding it into the grid. So, start with a random letter. Make sure that there are words of that length that start with the random letter, both across and down. If so, add that letter into a wordToBuild array and move to the next column. If we get to a point where we can't find a letter to fit in both an across and down word, we need to move back a column and try a different letter.


*/


var game = {

	init: function(){
		this.rows = Config.numRows;
		this.cols = Config.numCols;
		//this.state = new State(undefined,level);
		this.availableMoves = new Array();
		this.answers = new Object();
		this.answerLengths = new Object();
		this.attemptedLettersInSquares = new Object();
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
			console.log("success");
			for (var len in data) {
				game.answerLengths[len] = data[len];
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
	var letterFound = false;
	var letterFail = false;
	var triedLetters = [];
	var wordToBuild = [];
	var attemptedWords = [];
	var word;
	var board = Board.buildBoard(game.board);
	
	for (var row = 0; row < Config.numRows;row++) {
		wordToBuild = [];
		for (var col = 0; col < Config.numCols;col++) {
			if (board[row][col] !== "e") {
				wordToBuild = [];
				attemptedWords = [];
				continue;
			}
			var sqId = 's'+row+'_'+col;			
			while (!letterFound && !letterFail) {
				randNum = Math.floor(Math.random() * (game.lettersArray.length));
				letter = game.lettersArray[randNum];

				while (($.inArray(letter, triedLetters) != -1)) {
					if (triedLetters.length > 25) {
						letterFail = true;	
						break;
					}
					randNum = Math.floor(Math.random() * (game.lettersArray.length));
					letter = game.lettersArray[randNum];
				}
				
				if ($.inArray(letter, game.attemptedLettersInSquares[sqId]) === -1) {
					if (word = Board.isValidForLetter({row:row,col:col},board,letter,attemptedWords)) {
						letterFound = true;
						//attemptedWords.push(word);
					} else {
						letterFound = false;
					}
				}
				triedLetters.push(letter);
			}
			
			if (!letterFail) {
				console.log(letter + " is valid");
				wordToBuild.push(letter);
				if (!game.attemptedLettersInSquares[sqId]) {
					game.attemptedLettersInSquares[sqId] = [];
				}
				game.attemptedLettersInSquares[sqId].push(letter);
				board[row][col] = letter;
				triedLetters = [];
				letterFound = false;
				//gameView.addLetter({row:row,col:col},letter);
			} else {
				if (wordToBuild.length > 0) {
					letter = wordToBuild.pop();
					triedLetters = [];
					triedLetters.push(letter);
					attemptedWords.push(word);
					Board.clearSquaresToRight({row:row,col:col},board);
					board[row][col-1] = "e";
					col = col - 2;
					letterFail = false;
				} else {
					//Clearing out the current word we're working on because it won't work
					Board.clearSquaresToRight({row:row,col:col},board);
					game.attemptedLettersInSquares[sqId] = [];
					//Moving up a row
					row = row - 1;
					
					//Clearing out that word, too, because we need to try a new word here
					col = Board.getFirstColOfWord({row:row,col:col},board);
					Board.clearSquaresToRight({row:row,col:col},board);
					letter = board[row][col];
					triedLetters = [];
					triedLetters.push(letter);
					board[row][col] = "e";
					game.attemptedLettersInSquares['s'+row+"_"+col].push(letter);
					col--;
					letterFail = false;
				}	
			}
		}
	}
}