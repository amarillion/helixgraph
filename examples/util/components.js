export class Checkbox extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._label = this.getAttribute("label") || "";
		this.binding = null;
		this.render();
		this._callback = () => {};
		this.oldValue = null;
	}

	set callback(val) {
		this._callback = val;
		// immediately trigger with current value
		const newValue = this.value;
		this._callback(newValue, this.oldValue);
		this.oldValue = newValue;
	}

	get value() {
		return this.shadowRoot.querySelector("input").checked;
	}

	onChange(event) {
		const isChecked = event.target.checked;
		this._callback(isChecked, this.oldValue);
		this.oldValue = isChecked;
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
		:host {
			width: 100%;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 0.5rem;
		}
		label {
			text-align: right;
		}
		input {
			justify-self: left;
		}
		</style>
		<label>${this._label}</label>
		<input type="checkbox"></input>`;
		this.shadowRoot.querySelector("input").addEventListener("change", (e) => this.onChange(e));
	}
}

export class Tooltip extends HTMLElement {
	constructor() {
		super();
		this.render();
	}

	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		
		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				background: #00000080;
				color: white;
				position: absolute;
				top: var(--yco);
				left: var(--xco);
				padding: 1rem;
			}`;
		this.shadowRoot.appendChild(style);
	}
}

export class Collapsible extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.expanded = true;
	}

	render() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
			<style>
			:host {
				border: 4px solid #44444488;
				border-radius: 0.5rem;
			}
			#contents {
				overflow: hidden;
				box-sizing: border-box;
				transition: max-height 0.5s linear;
				max-height: 20rem;
			}
			#heading {
				width: 100%;
				background: #44444488;
				text-align: right;
			}
			#heading svg {
				margin-right: 0.2rem;
				transform: rotate(180deg);
				transition: transform 0.5s;
			}
			#padding {
				padding: 0.5rem;
			}
			:host([collapsed]) #icon {
				transform: rotate(0deg);
			}
			:host([collapsed]) #contents {
				max-height: 0px;
			}
			</style>
			<div id="heading">
				<svg id="icon" viewBox="0 0 16 16" width="16" height="16">
					<path d="M 3,10 8,5 13,10"
						style="stroke:#FFFFFF;fill:none;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter" 
					/>
				</svg>
			</div>
			<div id="contents">
				<div id="padding">
					<slot></slot>
				</div>
			</div>
			`;
		this.shadowRoot.querySelector("#heading").addEventListener("click", () => {
			this.expanded = !this.expanded;
			if (this.expanded) {
				this.removeAttribute("collapsed");
			}
			else {
				this.setAttribute("collapsed", true);
			}
		});
	}
}

/*
export class Signal {
	constructor() {
		this._listeners = [];
	}

	add(listener) {
		this._listeners.add(listener);
	}

	fire(...args) {
		for(const l of this._listeners) {
			l.apply(null, args);
		}
	}
}

export class SelectModel {

	constructor(options = []) {
		this._onChange = new Signal();
		this._options = options;
		this._selectedIndex = -1;
	}

	get onChange() {
		return this._onChange;
	}
}
*/

export class Select extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	
		this._options = [];
		this._label = this.getAttribute("label") || "";
		this.binding = null;
		this.render();
		this._callback = () => {};
		this.oldValue = null;
	}

	set label(val) {
		this._label = val;
		this.render();
	}

	set options(idNamePairs) {
		this._options = idNamePairs;
		this.render();
	}

	set callback(val) {
		this._callback = val;
		// immediately trigger with current value
		const newValue = this.shadowRoot.querySelector("select").value;
		this._callback(newValue, this.oldValue);
		this.oldValue = newValue;
	}

	get value() {
		return this.shadowRoot.querySelector("select").value;
	}

	onChange(event) {
		this._callback(event.target.value, this.oldValue);
		this.oldValue = event.target.value;
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
		:host {
			width: 100%;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 0.5rem;
		}
		label {
			text-align: right;
		}
		</style>
		<label>${this._label}</label>
		<select>
			${this._options.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join()}
		</select>`;
		this.shadowRoot.querySelector("select").addEventListener("change", (e) => this.onChange(e));
	}
}
