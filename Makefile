
MOCHA=node_modules/mocha/bin/mocha

test:
	${MOCHA} --ui bdd src/test.* --compilers coffee:coffee-script

profile:
	${MOCHA} \
		--ui bdd \
		--compilers coffee:coffee-script \
		--reporter list \
		src/test-performance.coffee
