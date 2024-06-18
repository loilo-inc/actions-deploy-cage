main: lib/index.js
lib/index.js: src/*.ts package.json package-lock.json
	yarn ncc build src/index.ts -o lib
