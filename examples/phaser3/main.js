/* rule for eslint: */
/* global Phaser */

import { assert } from "../../lib/assert.js";
import { EAST, NORTH, SOUTH, TemplateGrid, WEST } from "../../lib/BaseGrid.js";
import { KruskalIter } from "../../lib/kruskal.js";
import { recursiveBackTracker, RecursiveBackTrackerIter } from "../../lib/recursiveBacktracker.js";

// for being able to find the opposite direction
const REVERSE = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

const HORIZONTAL = EAST|WEST;
const VERTICAL = NORTH|SOUTH;

const terrain = {
	[EAST]: 0,
	[EAST|WEST]: 1,
	[WEST]: 2,
	[0]: 3,
	[SOUTH|EAST]: 4,
	[SOUTH|EAST|WEST]: 5,
	[SOUTH|WEST]: 6,
	[SOUTH]: 7,
	[NORTH|SOUTH|EAST]: 8,
	[NORTH|SOUTH|EAST|WEST]: 9,
	[NORTH|SOUTH|WEST]: 10,
	[NORTH|SOUTH]: 11,
	[NORTH|EAST]: 12,
	[NORTH|EAST|WEST]: 13,
	[NORTH|WEST]: 14,
	[NORTH]: 15,
};

// cell implementation that keeps track of links to neighboring cells
class Node {

	constructor(x, y, grid, onChange) {
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.onChange = onChange;
		this.links = {};
		this.tunnel = null;
	}

	getByDir(dir) {
		// prefer to return existing links TO tunnel if available, 
		if (dir in this.links) return this.links[dir];

		// if this node is a tunnel, only existing links can be returned, even if they are undefined
		if (this.tunnel) return this.links[dir];

		// otherwise look up from grid.
		switch(dir) {
		case NORTH: return this.grid.get(this.x, this.y - 1);
		case  EAST: return this.grid.get(this.x + 1, this.y);
		case SOUTH: return this.grid.get(this.x, this.y + 1);
		case  WEST: return this.grid.get(this.x - 1, this.y);
		}
	}

	createTunnel() {
		assert(!this.tunnel, "Error, created tunnel twice");
		this.tunnel = new Node(this.x, this.y, this.grid, () => { console.log("TUNNEL ONCHANGE"); this.onChange(this.tunnel); } );
		this.tunnel.tunnel = this; // bidirectional link
		return this.tunnel;
	}

	*getAdjacent() {
		for (const dir of [NORTH, EAST, SOUTH, WEST]) {
			const adjacent = this.getByDir(dir);
			if (adjacent) {
				yield [{ dir, tunnel: false }, adjacent];
				
				// see if we can create potentially a new tunnel
				// TODO: tunnel can be any length as long as we pass orthogonal passages.
				const adjacent2 = adjacent.getByDir(dir);
				const orthogonal = adjacent.isOrthogonal(dir);
				const alreadyHasTunnel = Boolean(adjacent.tunnel);
				if (adjacent2 && orthogonal && !alreadyHasTunnel) {
					yield [{ dir, tunnel: true }, adjacent2 ];
				}

			}
		}
	}

	isOrthogonal(dir) {
		const dirSet = this.dirSet();
		switch(dir) {
		case NORTH: case SOUTH: return dirSet === HORIZONTAL;
		case EAST: case WEST: return dirSet === VERTICAL;
		default: assert(false);
		}
	}

	/**
	 * @param {*} other cell to link to
	 * @param {*} dir one of NORTH, EAST, SOUTH, WEST
	 */
	link(other, dir, reverse) {
		if (dir in this.links) {
			// console.log("LINK already exists.");
			// This can happen, due to the way that tunnel edges skip a node. 
			// The middle node is unknown to the algorithm and needs to be visted when backtra
			// alternative would be to create a virtual tunnel node that becomes real when linked...
			return;
		}
		this.links[dir] = other;
		if (reverse) {
			// call recursively once!
			other.link(this, reverse);
		}
		this.onChange(this);
	}

	makeEdge(other, edge) {
		if (edge.tunnel) {
			const adjacent = this.getByDir(edge.dir);
			const tunnel = adjacent.createTunnel();
			
			this.link(tunnel, edge.dir, REVERSE[edge.dir]);
			tunnel.link(other, edge.dir, REVERSE[edge.dir]);
		}
		else {
			this.link(other, edge.dir, REVERSE[edge.dir]);
		}
	}

	linked(dir) {
		return dir in this.links;
	}

	dirSet() {
		return Object.keys(this.links).reduce((prev, curr) => prev + Number(curr), 0);
	}
}

class Scene extends Phaser.Scene {
	
	constructor() {
		super({ key: "Main Scene" });
		this.prevTime = 0;
	}

	preload() {
		this.load.image("pipes", "pipes.png");
	}

	create() {
		const mw = 12;
		const mh = 12;

		// Creating a blank tilemap with the specified dimensions
		this.map = this.make.tilemap({ tileWidth: 64, tileHeight: 64, width: mw, height: mh });
		const tiles = this.map.addTilesetImage("pipes");
		this.layer0 = this.map.createBlankLayer("layer0", tiles);
		this.layer1 = this.map.createBlankLayer("layer1", tiles);
		// layer.setScale(2);
		// this.layer.randomize(0, 0, 25, 13, [ 1, 2, 4, 9, 11, 15 ]);

		const grid = new TemplateGrid(mw, mh, (x, y, self) => new Node(x, y, self, (n) => this.onChange(n)));
		const start = grid.get(5, 5);
		
		this.iter = new RecursiveBackTrackerIter(
			start, n => n.getAdjacent(), (src, edge, dest) => src.makeEdge(dest, edge)
		);

		// this.iter = new KruskalIter(
		// 	grid.eachNode(), (n) => grid.getAdjacent(n), (src, dir, dest) => src.link(dest, dir, reverse[dir])
		// );

	}

	onChange(node) {
		const isTunnel = Boolean(node.tunnel);
		if (isTunnel) {
			this.layer0.putTileAt(terrain[HORIZONTAL], node.x, node.y);
			this.layer1.putTileAt(terrain[VERTICAL], node.x, node.y);
		}
		else {
			const dirSet = node.dirSet();
			const tile = terrain[dirSet];
			this.layer1.putTileAt(tile, node.x, node.y);
		}
	}

	update (time, delta) {
		if (time - this.prevTime > 100) {
			this.iter.next();
			this.prevTime = time;
		}
	}
}

const config = {
	type: Phaser.AUTO,
	width: "100%",
	height: "100%",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: Scene
};

const game = new Phaser.Game(config);
