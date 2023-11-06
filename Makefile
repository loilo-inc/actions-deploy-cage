main: lib/index.js
lib/index.js: src/index.ts src/deploy.ts package.json yarn.lock
	yarn ncc build src/index.ts -o lib
