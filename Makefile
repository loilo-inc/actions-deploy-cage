.PHONY: main
main: lib/index.js
lib/index.js: index.js package.json package-lock.json
	npx esbuild index.js --bundle --platform=node --target=node24 --outfile=lib/index.js
