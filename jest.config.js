/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
export default {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: [ "**/*.spec.js", "**/*.spec.ts" ],
	resolver: "jest-ts-webcompat-resolver"
};
