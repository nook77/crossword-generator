var Move = function(pieceId, currentSquare, nextSquare, jumpedSquare, direction, player) {
	this.pieceId = pieceId;
	this.currentSquare = currentSquare;
	this.nextSquare = nextSquare;
	this.jumpedSquare = jumpedSquare;
	this.direction = direction;
	this.player = player;
	this.state;
}