module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"jest": true
	},
	"parser": "@typescript-eslint/parser",
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
	],
	"plugins": [
		"import"
	],
	"parserOptions": {
		"sourceType": "module",
		"ecmaVersion": 10
	},
	"rules": {
		"@typescript-eslint/explicit-module-boundary-types": [
			"off",
		],
		"@typescript-eslint/no-empty-function": [
			"off",
		],
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
		"no-constant-condition": ["error", { "checkLoops": false }],
		"import/extensions": [ "error", "always" ]
	}
}