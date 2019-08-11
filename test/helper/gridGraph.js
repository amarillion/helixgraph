export const MAP = [
//   01234567890123456789
	"............##......",
	"............##......",
	".....##.....##......",
	".....##.....##......",
	".....##.....##......",
	".....##.....##......",
	".....##............."
];

export class GridGraph {

	constructor(_map) {
		this.width = _map[0].length;
		this.height = _map.length;
		this.map = new Array(this.width * this.height);
		let pos = 0;
		for (const row of _map) {
			for (let x = 0; x < this.width; ++x) {
				this.map[pos] = row.substring(x, x + 1);
				pos++;
			}
		}
	}

	getWeight () {
		return 1;
	}
	
	getNodeAt(x, y) {
		return this.width * y + x;
	}

	getx(n) {
		return n % this.width;
	}

	gety(n) {
		return Math.floor(n / this.width);
	}
	
	isValid(x, y) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height;
	}

	getTile(x, y) {
		if (this.isValid(x,y)) { 
			return this.map[this.getNodeAt(x, y)];
		}
		else return null;
	}

	setTile(x, y, char) {
		if (this.isValid(x,y)) { 
			const node = this.getNodeAt(x, y);
			this.map[node] = char; 
		}
	}

	getNeighbors(n) {
		const result = [];
		let dx = 0;
		let dy = -1;
		const x = this.getx(n);
		const y = this.gety(n);
		if (this.getTile(x, y) !== ".") return [];

		for (let dir = 0; dir < 4; ++dir) {
			const nx = x + dx;
			const ny = y + dy;
			if (this.getTile(nx, ny) === ".") {
				result.push([dir, this.getNodeAt(nx, ny)]);
			}
			[dx, dy] = [-dy, dx];
		}
		return result;
	}

	toString() {
		let result = "";
		
		for (let i = 0; i < this.map.length; ++i) {
			result += this.map[i];
			if (((i + 1) % this.width) === 0) result += "\n";
		}
		return result;
	}

}
