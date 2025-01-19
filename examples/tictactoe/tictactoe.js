import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { AssertionError } from "node:assert";

function assert(test, msg) {
	if (!test) {
		console.error(msg);
		throw new AssertionError(msg);
	}
}

const EMPTY = "         ";

const analyseBoard = (board) => {
	// count X and Os
	let xcount = 0;
	let ocount = 0;
	for (let i = 0; i < 9; ++i) {
		if (board[i] === "X") xcount++;
		if (board[i] === "O") ocount++;
	}
	// sanity check: X's and O's must be almost equal
	const delta = Math.abs(xcount - ocount);
	assert(delta <= 1);

	return { xcount, ocount };
};

const currentPlayer = function(board) {
	const { xcount, ocount } = analyseBoard(board);
	if (xcount + ocount === 9) return "";
	return (xcount >= ocount) ? "O" : "X";
};

const possibleMoves = function* (board) {
	assert(board.length === 9);
	if (isVictoryState(board)) return;
	const { xcount, ocount } = analyseBoard(board);

	if (xcount + ocount === 9) return; // no more moves possible

	const player = (xcount >= ocount) ? "O" : "X";
	for (let i = 0; i < 9; ++i) {
		if (board[i] === " ") {
			const newState = [ ...board ];
			newState[i] = player;
			yield [ i, newState.join("") ];
		}
	}
};

const isVictoryState = (board) => {
	// determine if board is won by certain player
	if (board[4] !== " ") {
		if (
			(board[3] === board[4] && board[4] === board[5]) ||
			(board[1] === board[4] && board[4] === board[7]) ||
			(board[0] === board[4] && board[4] === board[8]) ||
			(board[2] === board[4] && board[4] === board[6])
		) return board[4];
	}
	if (board[0] !== " ") {
		if (
			(board[0] === board[1] && board[0] === board[2]) ||
			(board[0] === board[3] && board[0] === board[6])
		) return board[0];
	}
	if (board[8] !== " ") {
		if ((board[6] === board[8] && board[7] === board[8]) ||
			(board[2] === board[8] && board[5] === board[8])
		) return board[8];
	}
	return "";
};

const victoryStateAsNumber = (board) => {
	const victoryPlayer = isVictoryState(board);
	if (victoryPlayer === "") return 0;
	const player = currentPlayer(board);
	return (player === victoryPlayer) ? 1 : -1;
};

// https://en.wikipedia.org/wiki/Negamax
function negamax(state, depth) {
	if (depth === 0) {
		return 0;
	}
	const winState = victoryStateAsNumber(state);
	if (winState !== 0) return winState;

	let found = false;
	let value = -Infinity;
	for (const [ , childState ] of possibleMoves(state)) {
		value = Math.max(value, -negamax(childState, depth - 1));
		found = true;
	}
	return found ? value : 0;
}

async function main() {
	const rl = createInterface({
		input: stdin,
		output: stdout
	});
	
	const question = (str) => new Promise(resolve => rl.question(str, resolve));

	const drawBoard = (board) => {
		return `[${board.substr(0, 3)}]\n[${board.substr(3, 3)}]\n[${board.substr(6,3)}]`;
	};

	let state = EMPTY;

	const INTERPRETATION =  {
		[0]: "draw",
		[1]: "win",
		[-1]: "lose"
	};

	while (isVictoryState(state) === "") {
		const moves = [];
		let i = 1;
		const player = currentPlayer(state);
		for (const [ , childState ] of possibleMoves(state)) {
			moves.push(childState);
			let outcome = -negamax(childState, 10); // <-- minus sign here!
			console.log(`#${i++}\n${drawBoard(childState)} - ${outcome} ${INTERPRETATION[outcome]}`);
		}
		const answer = await question(`${player}: Choose your move (1..${moves.length}) ?`);

		state = moves[Number(answer) - 1];
		console.log(`You chose ${answer}: [${state}]`);
	}
}

main();
