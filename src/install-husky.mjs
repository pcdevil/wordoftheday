import { env, exit } from 'node:process';

// gracefully install Husky Git hooks
// based on: https://typicode.github.io/husky/how-to.html#ci-server-and-docker

if (
	env.CI === 'true'
	|| env.HUSKY === '0'
	|| env.NODE_ENV === 'production'
) {
	exit();
}

const { default: husky } = await import('husky');

const output = husky();
if (output) {
	console.log(`Husky install output: ${output}`);
}
