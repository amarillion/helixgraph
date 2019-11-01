/**
 * Import Phaser dependencies using `expose-loader`.
 * This makes then available globally and it's something required by Phaser.
 * The order matters since Phaser needs them available before it is imported.
 */
import 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

class Game extends Phaser.Game {
	
	constructor() {
		let cfg = {
			width: "100%",
			height: "100%",
			// multiTexture: true,	// disabled - this causes problems with the firefox/linux/mesa combo.
			parent: "mainDiv",
			enableDebug: false
		};

		super(cfg);
	}
}

class GameState {
	
	// called once per session
	constructor() {
		console.log("GameState.constructor");
	}

	// called everytime state is entered
	create () {
		console.log("GameState.create");

		const text = "- phaser -\n with a sprinkle of \n pixi dust.";
		const style = { font: "65px Arial", fill: "#ff0044", align: "center" };
	
		/* const t = */ this.add.text(this.world.centerX - 300, 0, text, style);	
	}
}

window.onload = () => {
	const game = new Game();
	game.state.add("GameState", GameState);
	game.state.start("GameState");
};
