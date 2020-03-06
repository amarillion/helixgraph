/* rule for eslint: */
/* global Phaser */
import { astar, manhattanCrossProductHeuristic, trackback, manhattanStraightHeuristic } from "../../src/algorithm.js";

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

const MAP_SCALE = 5.0;

// eslint-disable-next-line no-unused-vars
const TILE_WALL = 1, TILE_PLAYER = 2, TILE_OPEN = 7, TILE_GOAL = 3, TILE_ENEMY = 4;

class GameState {
	
	constructor() {
		this.counter = 0;
		this.maxIterations = 1;
		this.player = null;
		this.goal = null;
		this.validPath = false;
		this.animationSpeed = 5; // number of ticks between pathfinding animation
		this.octagonalToggle = true;
		this.prevMouseDown = false;
	}

	preload() {		
		this.load.image("sprites1", "assets/sprites.png");
		this.load.tilemap("tilemap1", "assets/level.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.spritesheet("sprites2", "assets/sprites.png", 8, 8, 8);
	}

	findPath(source, dest, maxIterations) {
		const dirs = {
			N: { key : "N", dx:  0, dy:  1, w: 1 },
			E: { key : "E", dx:  1, dy:  0, w: 1 },
			S: { key : "S", dx:  0, dy: -1, w: 1 },
			W: { key : "W", dx: -1, dy:  0, w: 1 },
		};
		const dirs2 = {
			...dirs,
			NE: { key : "NE", dx:  1, dy:  1, w: 1.414 },
			NW: { key : "NW", dx: -1, dy:  1, w: 1.414 },
			SE: { key : "SE", dx:  1, dy: -1, w: 1.414 },
			SW: { key : "SW", dx: -1, dy: -1, w: 1.414 },
		};
		const dirsUsed = this.octagonalToggle ? dirs2 : dirs;

		const inRange = (x, y) =>  {
			return (x >= 0 && x < this.map.width &&
				y >= 0 && y < this.map.height);	
		};
		const neighborFunc = (tile) => {
			const { x, y } = tile;
			const result = [];
			for (const key in dirsUsed) {
				const { dx, dy } = dirsUsed[key];
				const nx = x + dx;
				const ny = y + dy;
				if (!inRange(nx, ny)) continue;
				const tile = this.map.getTile(nx, ny);
				if (!tile.collides)
					result.push([key, tile]);
			}
			return result;
		};
		const heuristic = (src, current) => {
			return manhattanStraightHeuristic(src.x, src.y, current.x, current.y, dest.x, dest.y);
			// return manhattanCrossProductHeuristic(src.x, src.y, current.x, current.y, dest.x, dest.y);
		};
		const weightFunc = (edge) => dirsUsed[edge].w;
		const opts = { maxIterations };
		return astar(source, dest, neighborFunc, weightFunc, heuristic, opts);
	}

	drawPath(data, source, dest) {
		if (this.graphics) {
			this.graphics.kill();
		}

		const graphics = this.game.add.graphics(0, 0);
		graphics.scale.setTo(MAP_SCALE);
		
		
		// draw examined nodes
		for (const [k, v] of data.dist.entries()) {
			// closer distance === brighter yellow
			const color = 0xFFFF00 - (0x050500 * Math.floor(v));
			graphics.beginFill(color, 0.5);
			graphics.drawRect(k.x * 8 + 1, k.y * 8 + 1, 6, 6);
			graphics.endFill();
		}

		graphics.lineStyle(1.0, 0x808080, 0.5);
		for (const { from, to } of data.prev.values()) {
			graphics.moveTo(from.x * 8 + 4, from.y * 8 + 4);
			graphics.lineTo(to.x * 8 + 4, to.y * 8 + 4);
		}
		
		// draw the main path
		graphics.lineStyle(2.0, 0x00FFFF, 0.5);
		this.validPath = trackback (source, dest, data.prev, (from, edge, to ) => {
			graphics.moveTo(from.x * 8 + 4, from.y * 8 + 4);
			graphics.lineTo(to.x * 8 + 4, to.y * 8 + 4);
		});
		this.graphics = graphics;
	}

	// called everytime state is entered
	create () {
		this.game.stage.backgroundColor = "#787878";
		this.game.stage.smoothed = false; // disable antialiasing
		this.game.input.mouse.capture = true;

		console.log("GameState.create");

		// create a tilemap
		this.map = this.game.add.tilemap("tilemap1");
		this.map.addTilesetImage("sprites", "sprites1");
		this.l1 = this.map.createLayer("Tile Layer 1");
		this.map.setCollision(TILE_WALL, true, this.l1);

		// l1.setScale works. l1.scale.setTo(2) disables collision!
		// see https://github.com/photonstorm/phaser/issues/2305
		this.l1.setScale(MAP_SCALE);

		this.l1.resizeWorld();

		const map = this.map;
		// extract player, target and and enemy locations
		for (let x = 0; x < map.width; ++x) {
			for (let y = 0; y < map.height; ++y) {
				const tile = map.getTile(x, y);
				const index = tile && tile.index;
				switch (index) {
				case TILE_WALL: // wall
					break;
				case TILE_PLAYER: // player
					this.player = tile;
					break;
				case TILE_GOAL: // goal
					this.goal = tile;
					break;
				default:
					break;
				}
			}
		}

		const text = "LMB: add/clear barrier. RMB: examine node";
		const style = { font: "16px Arial", fill: "#ff0044", align: "center" };
	
		/* const t = */ this.add.text(this.world.centerX - 300, 0, text, style);
	}

	reset() {
		this.validPath = false;
		this.maxIterations = 0;
		this.counter = 0;
	}

	onClick(pointer) {
		console.log("Click", pointer.x, pointer.y);
	}

	handleMouse() {
		const currentMouseDown = this.game.input.activePointer.isDown;
		if (currentMouseDown && !this.prevMouseDown) {
			this.onClick(this.game.input.activePointer);
		}
		this.prevMouseDown = currentMouseDown;
	}

	update() {
		if (!this.validPath) {
			this.counter--;
			if (this.counter <= 0) {
				this.counter = this.animationSpeed;
				this.maxIterations++;
				const data = this.findPath(this.player, this.goal, this.maxIterations);
				this.drawPath(data, this.player, this.goal);
			}
		}

		this.handleMouse();
	}
}

window.onload = () => {
	const game = new Game();
	game.state.add("GameState", GameState);
	game.state.start("GameState");
};
