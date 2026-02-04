main: lib/index.js
lib/index.js: index.js package.json package-lock.json
	npx ncc build index.js -o lib
