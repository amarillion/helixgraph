/* rule for eslint: */
/* global Phaser */
import { astar, trackback, breadthFirstSearch, dijkstra } from "../../src/pathFinding.js";
import { manhattanCrossProductHeuristic, manhattanStraightHeuristic, octagonalHeuristic } from "../../src/astarHeuristics.js";
import { assert } from "../../src/assert.js";

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

const TILE_WALL = 1, TILE_PLAYER = 2, TILE_OPEN = 7, TILE_GOAL = 3;

class GameState {
	
	constructor() {
		this.counter = 0;
		this.maxIterations = 1;
		this.player = null;
		this.goal = null;
		this.validPath = false;
		this.animationSpeed = 3; // number of ticks between pathfinding animation
		this.octagonalToggle = true;
		this.prevMouseDown = false;

		const heuristicSelect = document.getElementById("heuristic-select");
		const gridSelect = document.getElementById("grid-select");
		const algorithmSelect = document.getElementById("algorithm-select");

		heuristicSelect.addEventListener("change", () => {
			this.crossProdToggle = heuristicSelect.value === "crossprod";
			console.log(heuristicSelect.value);
			this.resetAnimation();
		});
		this.crossProdToggle = heuristicSelect.value === "crossprod";

		gridSelect.addEventListener("change", () => {
			this.octagonalToggle = gridSelect.value === "octagonal";
			this.resetAnimation();
		});
		this.octogonalToggle = gridSelect.value === "octagonal";

		algorithmSelect.addEventListener("change", () => {
			const valueToFunc = {
				"astar": astar,
				"bfs": breadthFirstSearch,
				"dijkstra": dijkstra
			};
			this.algorithm = valueToFunc[algorithmSelect.value];
			assert(this.algorithm);
			this.resetAnimation();
		});
		this.algorithm = astar;
	}

	heuristicFactory(source, dest) {
		return (current) => {
			if (this.octagonalToggle) {
				return octagonalHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
			}
			else {
				if (this.crossProdToggle) {
					return manhattanCrossProductHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
				}
				else {
					return manhattanStraightHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
				}
			}
		};
	}

	preload() {		
		this.load.image("sprites1", "assets/sprites.png");
		this.load.tilemap("tilemap1", "assets/level.json", null, Phaser.Tilemap.TILED_JSON);
		this.load.spritesheet("sprites2", "assets/sprites.png", 8, 8, 8);
	}

	findPath(source, dest, maxIterations) {
		this.heuristic = this.heuristicFactory(source, dest);
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
		const map = this.map;
		function *neighborFunc(tile) {
			const { x, y } = tile;
			for (const key in dirsUsed) {
				const { dx, dy } = dirsUsed[key];
				const nx = x + dx;
				const ny = y + dy;
				if (!inRange(nx, ny)) continue;
				const tile = map.getTile(nx, ny);
				if (!tile.collides)
					yield ([key, tile]);
			}
		}
		const weightFunc = (edge) => dirsUsed[edge].w;
		const opts = { 
			maxIterations,
			getWeight: weightFunc,
			getHeuristic: this.heuristic 
		};
		return this.algorithm(source, dest, neighborFunc, opts);
	}

	drawPath(data, source, dest) {
		if (this.graphics) {
			this.graphics.kill();
		}

		const graphics = this.game.add.graphics(0, 0);
		graphics.scale.setTo(MAP_SCALE);
		
		
		// draw examined nodes
		for (const { to, cost } of data.values()) {
			// closer distance === brighter yellow
			const color = 0xFFFF00 - (0x050500 * Math.floor(cost));
			graphics.beginFill(color, 0.5);
			graphics.drawRect(to.x * 8 + 1, to.y * 8 + 1, 6, 6);
			graphics.endFill();
		}

		graphics.lineStyle(1.0, 0x808080, 0.5);
		for (const { from, to } of data.values()) {
			graphics.moveTo(from.x * 8 + 4, from.y * 8 + 4);
			graphics.lineTo(to.x * 8 + 4, to.y * 8 + 4);
		}
		
		// draw the main path
		graphics.lineStyle(2.0, 0x00FFFF, 0.5);
		this.validPath = trackback (source, dest, data, (from, edge, to ) => {
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

		this.player = this.map.searchTileIndex(TILE_PLAYER);
		this.goal = this.map.searchTileIndex(TILE_GOAL);

		const style = { font: "16px Arial", fill: "white", align: "center" };
		this.debugText = this.add.text(this.world.centerX, 0, "", style);

		this.game.input.mousePointer.leftButton.onDown.add(() => this.onLeftClick());
		this.game.input.addMoveCallback(this.onMouseMove, this);
	}

	reset() {
		this.validPath = false;
		this.maxIterations = 0;
		this.counter = 0;
	}

	inRange(mx, my) {
		return (mx >= 0 && mx < this.map.width && my >= 0 && my < this.map.height);
	}

	pointerInMap() {
		const pointer = this.game.input.mousePointer;
		const mx = Math.floor(pointer.x / this.map.tileWidth / MAP_SCALE);
		const my = Math.floor(pointer.y / this.map.tileHeight / MAP_SCALE);
		return { mx, my };
	}

	onLeftClick() {
		const { mx, my } = this.pointerInMap();
		if (this.inRange(mx, my)) {
			const tile = this.map.getTile(mx, my);

			// toggle walls
			const idx = tile && tile.index;
			const newIdx = idx === TILE_WALL ? TILE_OPEN : TILE_WALL;
			this.map.putTile(newIdx, mx, my);
			this.resetAnimation();
		}
	}

	onMouseMove() {
		const { mx, my } = this.pointerInMap();
		if (this.inRange(mx, my)) {
			const tile = this.map.getTile(mx, my);
			const nodeData = this.data.get(tile);
			const cost = nodeData ? nodeData.cost : undefined;
			const h = this.heuristic(tile);

			// log some information about this tile
			this.debugText.text = `[${mx}, ${my}] ` + 
				`cost: ${cost && cost.toFixed(2)}; h: ${h && h.toFixed(2)}`;
		}
	}

	resetAnimation() {
		this.maxIterations = 0;
		this.counter = 0;
		this.validPath = false;
	}

	update() {
		if (!this.validPath) {
			this.counter--;
			if (this.counter <= 0) {
				this.counter = this.animationSpeed;
				this.maxIterations++;
				this.data = this.findPath(this.player, this.goal, this.maxIterations);
				this.drawPath(this.data, this.player, this.goal);
			}
		}
	}
}

window.onload = () => {
	const game = new Game();
	game.state.add("GameState", GameState);
	game.state.start("GameState");

	/** disable RMB context menu globally */
	document.body.addEventListener("contextmenu", e => e.preventDefault());

};
