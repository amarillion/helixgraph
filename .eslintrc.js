module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jasmine": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
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
        /** don't allow underscores in names unless they're after this. 
            Used to emulate private variables. */
        "no-underscore-dangle": [
            "error", 
            { "allowAfterThis": true }
        ]
    },
    "globals":{
        "Phaser": true,
        "Spriter": true,
        "PIXI": true,
        "$": true,

        "require": true,
        "process": true,
        "__dirname": true
    }
}