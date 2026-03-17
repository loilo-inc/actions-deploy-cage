PKG_DIR := node_modules/@loilo-inc/actions-deploy-cage
.PHONY: build
build:
	cp $(PKG_DIR)/action.yml .
	cp $(PKG_DIR)/LICENSE .
	cp -R $(PKG_DIR)/lib .
