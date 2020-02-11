export function randomNumber(range) {
	return Math.floor(Math.random() * range);
}

export function pickOne(list) {
	const idx = randomNumber(list.length);
	return list[idx];
}

// Fisher-Yates shuffle
export function shuffle(array) {
	
	let counter = array.length;

	// While there are elements in the array
	while (counter > 0) {
		let index = randomNumber(counter);
		counter--;

		// And swap the last element with it
		let temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}
