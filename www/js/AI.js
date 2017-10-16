var AI = function(level) {
	
	this.level = level;
}

AI.chooseMove = function(state,moves) {
	var player = state.player;
	console.log("AI to chooseMove on this board:");
	game.printBoard(state.board);
	if (!moves) {
		var moves = state.getAvailableMoves();
	}
	
	var count = 1;
    var states = moves.map(function(move) {
        console.log("AI makes move ", count, move);
        //create a new state in which we will add the new piece into
        var nextState = new State(state);
		
		//adding the new piece to the new state
		nextState.board = squares.addPiece(move.nextSquare,move.pieceId,nextState.board);
		
		//removing the piece from its previous square
		nextState.board = squares.removePiece(move.currentSquare,nextState.board);
		
		//Check for Kinging
		if ((player === "pOne" && move.nextSquare.row == 0) || (player === "pTwo" && move.nextSquare.row == Config.numRows - 1)) {
			if (!game.isPieceKing(move.pieceId,nextState)) {
				nextState.kings.push(move.pieceId);
			}
		} 
		
		if (move.jumpedSquare) {
			if (Config.devmode) {
				console.log("...and a piece was jumped")
			}
			
			var jumpedPiece = nextState.board[move.jumpedSquare.row][move.jumpedSquare.col];
			nextState.board = squares.removePiece(move.jumpedSquare,nextState.board);
			nextState[game.getToggledplayer(nextState.player)+"PiecesNum"]--;
			if (Config.devmode) {
				console.log("Checking for more jumps...");
			}
			nextState.setAvailableJumps(move.pieceId,move.nextSquare);
			if (nextState.availableJumps.length === 0) {
				console.log("changing turn");
				nextState.changeTurn();
				nextState.miniMaxDepth++;
			}
		} else {
			console.log("changing turn");
			nextState.changeTurn();
			nextState.miniMaxDepth++;
			nextState.setAvailableMoves();
			nextState.setAvailableJumps();
		}
		nextState.numOfMoves++;
		//nextState.miniMaxDepth++;
		
		//sending the new state to get its minimax score
        move.minimaxVal = game.getMinimaxVal(nextState, this.level);
		move.state = nextState;
		count++;
        return move;
    });
    
    // just for printing out the scores to the console
    console.log("moves list: ", moves);
    var count = 0;
    states.forEach(function(state) {
    	console.log(count + ": " + state.minimaxVal);
    	count++;
    });

    //sort the list of moves by score
	if (player === "pOne") {
		states.sort(AI.sortDescending);
	} else {
		states.sort(AI.sortAscending);
	}
	
	//check to see if there are moves with duplicate scores. If so, choose a random move from those
	var sameScores = new Array;
	sameScores.push(states[0]);
	for (var i=1; i<states.length; i++) {
		if (states[i].minimaxVal === states[0].minimaxVal) {
			sameScores.push(states[i]);
		}
	}
	
	var index = Math.floor(Math.random()*sameScores.length);
	var chosenMove = states[index];
	
	//var pieceId = moves[index].pieceId;
	//var currentSquare = moves[index].currentSquare;
	//var newSquare = moves[index].newSquare;
	
	
    var nextState = chosenMove.state;
    AI.movePiece(chosenMove);
	//gameView.renderPiece(chosenMove.currentSquare, turn, nextState)
	
    // take the game to the next state
    //game.updateState(nextState);
    //game.pieces[move.pieceId].inSquare = move.newSquare;
    //game.disablePlayersPieces(game.state.player);
    
    //game.activateArrows();
}

AI.movePiece = function(move) {
	
	var top = 0;
	var left = 0;	
	var direction = move.direction;

	if (direction.match(/n/)) {
		top = top-Config.sqWidth;
	} 
	
	if (direction.match(/e/)) {
		left = left+Config.sqWidth;
	} 
	
	if (direction.match(/s/)) {
		top = top+Config.sqWidth;
	} 
	
	if (direction.match(/w/)) {
		left = left - Config.sqWidth;
	} 
	
	if (move.jumpedSquare) {
		top = top*2;
		left = left*2;
	}
	
    $('#'+move.pieceId).css({"z-index": 101});
    
    $('#'+move.pieceId).animate({"top":top+"px", "left":left+"px"}, 1000, function() {
    	gameView.addPieceToSquare(move.pieceId,move.nextSquare);
    	$('#'+move.pieceId).css({"z-index": 1});
    	$(document).trigger("pieceDropped", [move.pieceId,move.nextSquare]);
    });
    
    //$('#'+move.pieceId).css({"top":top+"px", "left":left+"px"});
    //$(document).trigger("pieceDropped", [move.pieceId,move.newSquare]);

}

AI.sortAscending = function(a, b) {
    if (a.minimaxVal < b.minimaxVal) {
        return -1;
    } else if (a.minimaxVal > b.minimaxVal) {
        return 1;
    } else {
        return 0;
    }
}

AI.sortDescending = function(a, b) {
    if (a.minimaxVal > b.minimaxVal) {
        return -1;
    } else if (a.minimaxVal < b.minimaxVal) {
        return 1;
    } else {
        return 0;
    }
}