.PHONY:
lib/index.js:
	yarn ncc build src/index.ts -o lib
