
MOCHA=node_modules/mocha/bin/mocha

test:
	${MOCHA} --ui bdd src/test.* --compilers coffee:coffee-script

