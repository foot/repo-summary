
MOCHA=node_modules/mocha/bin/mocha

.PHONY: test
test:
	${MOCHA} --ui bdd test/* --compilers coffee:coffee-script

profile:
	${MOCHA} \
		--ui bdd \
		--compilers coffee:coffee-script \
		--reporter list \
		src/test-performance.coffee
