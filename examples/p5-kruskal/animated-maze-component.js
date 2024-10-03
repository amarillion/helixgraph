import { P5Wrapper } from "./p5-wrapper.js";
import { createRobinMaze } from "./animated-maze.js";

export class AnimatedMazeComponent extends P5Wrapper {
	constructor() {
		super(createRobinMaze);
	}
}
