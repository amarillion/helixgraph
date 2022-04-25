
/**
 * A wrapper for p5 sketching functions that handles canvas creation and resize events.
 */
export class P5Wrapper extends HTMLElement {
	
	/**
	 * @param {*} implementationFactory: a function that returns three functions: 
	 *   setup(sketch)
	 *   draw(sketch)
	 *   onResize(w, h)
	 */
	constructor(implementationFactory) {
		super();
		this.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		// take up full space given to element
		style.innerHTML = ":host { display: block; height: 100%; width: 100%; }";
		this.shadowRoot.appendChild(style);
		this.implementationFactory = implementationFactory;
	}

	disconnectedCallback() {
		if (this.p5) { this.p5.remove(); }
		this.resizeObserver = null;
	}

	connectedCallback() {
		if (this.p5) { this.p5.remove(); }
		this.p5 = new p5((sketch) => {
			const { onResize, setup, draw } = this.implementationFactory();
			sketch.setup = () => {
				const SCREEN_W = this.offsetWidth;
				const SCREEN_H = this.offsetHeight;
				const canvasDiv = sketch.createCanvas(SCREEN_W, SCREEN_H);
				canvasDiv.parent(this.shadowRoot);
				canvasDiv.style("visibility", "visible");
				setup(sketch);
			};

			sketch.draw = () => {
				draw(sketch);
			};

			this.resizeObserver = new ResizeObserver(() => { 
				const SCREEN_W = this.offsetWidth;
				const SCREEN_H = this.offsetHeight;
				onResize(SCREEN_W, SCREEN_H);
				sketch.resizeCanvas(SCREEN_W, SCREEN_H);
			});
	
		});
		this.resizeObserver.observe(this);
	}

}
