.PHONY: main
main: lib/index.js action.yml
lib/index.js: index.js package.json package-lock.json
	npx esbuild index.js --bundle --platform=node --target=node24 --outfile=lib/index.js
action.yml: node_modules/@loilo-inc/actions-deploy-cage/action.yml
	cp node_modules/@loilo-inc/actions-deploy-cage/action.yml action.yml
