main: lib/index.js
lib/index.js: src/index.ts src/deploy.ts package.json yarn.lock
	yarn ncc build src/index.ts -o lib
test:
	docker run \
		-v `pwd`:/src \
		-w /src \
		-t node:12.13 \
		yarn test
