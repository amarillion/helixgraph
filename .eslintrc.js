module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"jasmine": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 10
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": [
			"off"
		],
		"eqeqeq": [ "error", "always" ],
		/** don't allow underscores in names unless they're after this. 
			Used to emulate private variables. */
		"no-underscore-dangle": [
			"error", 
			{ "allowAfterThis": true }
		],
		// allow while(true)
		"no-constant-condition": ["error", { "checkLoops": false }]
	}
}