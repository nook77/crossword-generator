var Piece = function(id, inSquare, player, dirs) {
	this.id = id;
	this.inSquare = inSquare;
	this.player = player;
	this.directions = dirs;
	this.isKing = false;
}