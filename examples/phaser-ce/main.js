/* eslint rule: */
/* global Phaser */
import { astar, manhattanCrossProductHeuristic, trackback } from "../../src/algorithm.js";

class Game extends Phaser.Game {
	
	constructor() {
		let cfg = {
			width: "100%",
			height: "100%",
			parent: "mainDiv",
			enableDebug: false
		};

		super(cfg);
	}
}

class GameState {
	
	preload() {		
		this.load.image("sprites1", "assets/sprites.png");
		this.load.tilemap("tilemap1", "assets/level.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.spritesheet("sprites2", "assets/sprites.png", 8, 8, 8);
	}

	findPath(source, dest) {
		const dirs = [
			{ key : "N", dx:  0, dy:  1 },
			{ key : "E", dx:  1, dy:  0 },
			{ key : "S", dx:  0, dy: -1 },
			{ key : "W", dx: -1, dy:  0 },
		];
		const dirs2 = [
			...dirs,
			{ key : "NE", dx:  1, dy:  1 },
			{ key : "NW", dx: -1, dy:  1 },
			{ key : "SE", dx:  1, dy: -1 },
			{ key : "SW", dx: -1, dy: -1 },
		];
		const inRange = (x, y) =>  {
			return (x >= 0 && x < this.map.width &&
				y >= 0 && y < this.map.height);	
		};
		const neighborFunc = (tile) => {
			const { x, y } = tile;
			const result = [];
			for (const {key, dx, dy} of dirs2) {
				const nx = x + dx;
				const ny = y + dy;
				if (!inRange(nx, ny)) continue;
				const tile = this.map.getTile(nx, ny);
				const idx = tile && tile.index;
				if (idx !== 1)
					result.push([key, tile]);
			}
			return result;
		};
		const heuristic = (src, current) => {
			return manhattanCrossProductHeuristic(src.x, src.y, current.x, current.y, dest.x, dest.y);
		};
		const opts = {};
		// N,S,E,W -> 1; NE, SE, NW, SW: -> 1.414
		const weightFunc = (edge) =>  { return edge.length === 1 ? 1 : 1.414; };
		return astar(source, dest, neighborFunc, weightFunc, heuristic, opts);
	}

	drawPath(data, source, dest) {
		const graphics = this.game.add.graphics(0, 0);

		// draw examined nodes
		for (const [k, v] of data.dist.entries()) {
			// closer distance === brighter yellow
			const color = 0xFFFF00 - (0x030300 * Math.floor(v));
			graphics.beginFill(color, 0.5);
			graphics.drawRect(k.x * 8 + 1, k.y * 8 + 1, 6, 6);
			graphics.endFill();
		}
		
		// draw the path
		graphics.lineStyle(2.0, 0x00FFFF, 0.5);
		const isValid = trackback (source, dest, data.prev, (from, edge, to ) => {
			graphics.moveTo(from.x * 8 + 4, from.y * 8 + 4);
			graphics.lineTo(to.x * 8 + 4, to.y * 8 + 4);
		});
		console.log(isValid);
	}

	// called everytime state is entered
	create () {
		this.game.stage.backgroundColor = "#787878";
		this.game.stage.smoothed = false; // disable antialiasing

		console.log("GameState.create");

		const text = "- phaser -\n with a sprinkle of \n pixi dust.";
		const style = { font: "65px Arial", fill: "#ff0044", align: "center" };
	
		/* const t = */ this.add.text(this.world.centerX - 300, 0, text, style);

		// create a tilemap
		this.map = this.game.add.tilemap("tilemap1");
		this.map.addTilesetImage("sprites", "sprites1");
		this.l1 = this.map.createLayer("Tile Layer 1");
		this.game.world.scale.setTo(6.0);
		this.l1.resizeWorld();

		const map = this.map;

		let player;
		let goal;

		// extract player, target and and enemy locations
		for (let x = 0; x < map.width; ++x) {
			for (let y = 0; y < map.height; ++y) {
				const tile = map.getTile(x, y);
				const index = tile && tile.index;
				switch (index) {
				case 1: // wall
					break;
				case 2: // player
					player = tile;
					break;
				case 7: // open area
					break;
				case 3: // goal
					goal = tile;
					break;
				case 4: // enemy
					break;
				default:
					break;
				}
			}
		}

		const data = this.findPath(player, goal);
		console.log({data});
		this.drawPath(data, player, goal);
	}
}

window.onload = () => {
	const game = new Game();
	game.state.add("GameState", GameState);
	game.state.start("GameState");
};
