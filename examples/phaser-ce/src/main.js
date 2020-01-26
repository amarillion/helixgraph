/**
 * Import Phaser dependencies using `expose-loader`.
 * This makes then available globally and it's something required by Phaser.
 * The order matters since Phaser needs them available before it is imported.
 */
import 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
import SimpleTileMap from "./SimpleTileMap.js";
import SimpleMap from "./SimpleMap.js";
import { TilemapLayer } from 'phaser-ce';

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
		console.log("GameState.constructor", arguments);
	}

	preload() {		
		this.load.image("sprites1", "assets/sprites.png");
		this.load.tilemap("tilemap1", "assets/level.json", null, Phaser.Tilemap.TILED_JSON);
		// this.load.tilemap("tilemap1", "assets/level.json");
		this.load.spritesheet("sprites2", "assets/sprites.png", 8, 8, 8);
	}

	// called everytime state is entered
	create () {
		this.game.stage.backgroundColor = "#787878";
		this.game.stage.smoothed = false; // disable antialiasing

		console.log("GameState.create");

		const text = "- phaser -\n with a sprinkle of \n pixi dust.";
		const style = { font: "65px Arial", fill: "#ff0044", align: "center" };
	
		/* const t = */ this.add.text(this.world.centerX - 300, 0, text, style);

		// const tilemap = new SimpleTileMap(8, 8, 20, 12, 1);
		// for (let i = 0; i < 8; ++i) {
		// 	tilemap.putTile(i, i, i);
		// }
		this.map = this.game.add.tilemap("tilemap1");
		this.map.addTilesetImage("sprites", "sprites1");
		this.l1 = this.map.createLayer("Tile Layer 1");
		this.l1.scale.setTo(6.0);
		this.l1.resizeWorld();

		// const l1 = new TilemapLayer(this.game, map, 0);
		// this.l1.addTilesetImage("sprites1");
		// this.world.add(l1);

		// create a tilemap
	}
}

window.onload = () => {
	const game = new Game();
	game.state.add("GameState", GameState);
	game.state.start("GameState");
};
