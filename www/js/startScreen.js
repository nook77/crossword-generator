var startScreen = function() {
}

startScreen.bindOkClick = function() {
	$('#okButton').on("click", function(event) {
		startScreenView.hideStartScreen();
		startScreenView.showMainMenu();
		startScreen.bindMenuClicks();
	});	
}

startScreen.bindMenuClicks = function() {
	$('#startGame').on("click", function(event) {
		game.resetGame();
		game.init(1);
	});
			
	$('#easy').on("click", function() {
		gameView.removeOpacity('med');
		gameView.removeOpacity('hard');
		gameView.addOpacity('easy');
		$('#startGame').off("click");
		$('#startGame').on("click", function(event) {
			game.resetGame();
			game.init(1);
		});
	});
	
	$('#med').on("click", function() {
		gameView.removeOpacity('easy');
		gameView.removeOpacity('hard');
		gameView.addOpacity('med');
		$('#startGame').off("click");
		$('#startGame').on("click", function(event) {
			game.resetGame();
			game.init(3);
		});
	});
	
	$('#hard').on("click", function() {
		gameView.removeOpacity('easy');
		gameView.removeOpacity('med');
		gameView.addOpacity('hard');
		$('#startGame').off("click");
		$('#startGame').on("click", function(event) {
			game.resetGame();
			game.init(4);
		});
	});
		
	$('.cancel').on("click", function() {
		gameView.removeOpacity('board');
		gameView.removeOpacity('player_boxes');
		startScreenView.hideMainMenu();
	});
}

startScreen.unBindClicks = function() {
	$('#startGame').off("click");
	$('#cancel').off("click");
}



