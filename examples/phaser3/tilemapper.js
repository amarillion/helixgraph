const NORTH = 1;
const EAST = 2;
const SOUTH = 4;
const WEST = 8;

// Corresponding tile-idx for every combination of the 4 cardinal directions.
const TILE_IDX_BY_TERRAIN = {
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

const HORIZONTAL = EAST|WEST;
const VERTICAL = NORTH|SOUTH;

const TO_NORTH = 16;
const TO_EAST = 32;
const TO_SOUTH = 64;
const TO_WEST = 128;

const CONVEYOR_DEAD_ENDS = {
	[WEST|TO_WEST]: 0,
	[SOUTH|TO_SOUTH]: 1,
	[NORTH|TO_NORTH]: 2,
	[EAST|TO_EAST]: 3,
};
const CONVEYOR_INDEX_BY_TERRAIN = {
	[EAST|TO_WEST]: 0,
	[NORTH|TO_SOUTH]: 1,
	[SOUTH|TO_NORTH]: 2,
	[WEST|TO_EAST]: 3,
	[WEST|TO_SOUTH]: 4,
	[SOUTH|TO_EAST]: 5,
	[SOUTH|TO_WEST]: 6,
	[EAST|TO_SOUTH]: 7,
	[NORTH|TO_WEST]: 8,
	[EAST|TO_NORTH]: 9,
	[WEST|TO_NORTH]: 10,
	[NORTH|TO_EAST]: 11,
};
const CONVEYOR_INDEX_BY_TERRAIN_SORTED = Object.entries(CONVEYOR_INDEX_BY_TERRAIN).sort((a, b) => a[1] > b[1]);

export class TileMapper {
	constructor(grid, map) {
		this.grid = grid;
		this.map = map;
	}

	onUpdateNode(node) {
		// function drawNodeOnLayer(layer, node) {
		// 	const dirSet = node.dirSet();
		// 	// to toggle between red and grey tiles, just add 16.
		// 	const tileOffset = (node.color === "red") ? 16 : 0;
		// 	this.map.putTileAt(TILE_IDX_BY_TERRAIN[dirSet] + tileOffset, node.x, node.y, false, layer);
		// }

		const drawConveyorNode = (node) => {
			if (!node.toDir) {
				this.map.putTileAt((8 * 14) + 6, node.x, node.y, false, 0);
				return;
			}

			const dirSet = node.dirSet() + (node.toDir * 16);

			this.map.removeTileAt(node.x, node.y, false, false, 0);
			this.map.removeTileAt(node.x, node.y, false, false, 1);
			this.map.removeTileAt(node.x, node.y, false, false, 2);

			if (dirSet in CONVEYOR_DEAD_ENDS) {
				const terrainIdx = CONVEYOR_DEAD_ENDS[dirSet];
				this.map.putTileAt((terrainIdx * 8) + 1, node.x, node.y, false, 0);
				const toDirToMarkerIdx = {
					[NORTH]: (8 * 14) + 3,
					[EAST] : (8 * 14) + 0,
					[SOUTH]: (8 * 14) + 1,
					[WEST] : (8 * 14) + 2,
				};
				this.map.putTileAt(toDirToMarkerIdx[node.toDir], node.x, node.y, false, 1);
				return;
			}

			let layer = 0;
			for (const [ bitMaskStr, terrainIdx ] of CONVEYOR_INDEX_BY_TERRAIN_SORTED) {
				const bitMask = Number(bitMaskStr);
				// console.log(`Drawing: \n    ${dirSet.toString(2)}\n    ${bitMask.toString(2)}\n    --------\n    ${(dirSet & bitMask).toString(2)}`);
				if ((dirSet & bitMask) === bitMask) {
					this.map.putTileAt((terrainIdx * 8) + 1, node.x, node.y, false, layer);
					layer++;
				}
			}
		};

		const isTunnel = Boolean(node.tunnel);
		if (isTunnel) {
			let parts;
			if ((node.dirSet() & HORIZONTAL) > 0) {
				parts = [ node, node.tunnel ];
			}
			else {
				parts = [ node.tunnel, node ];
			}
			for (const tunnelPart of parts) {
				drawConveyorNode(tunnelPart);
			}
			
			const east = node.getByDir(EAST);
			if (east && !east.tunnel) { this.map.putTileAt(14 * 8 + 4, east.x, east.y, false, 2); }
			const west = node.getByDir(WEST);
			if (west && !west.tunnel) { this.map.putTileAt(14 * 8 + 5, west.x, west.y, false, 2); }
		}
		else {
			drawConveyorNode(node);

			const east = node.getByDir(EAST);
			if (east && east.tunnel) { this.map.putTileAt(14 * 8 + 5, node.x, node.y, false, 2); }
			const west = node.getByDir(WEST);
			if (west && west.tunnel) { this.map.putTileAt(14 * 8 + 4, node.x, node.y, false, 2); }
		}
	}
}
