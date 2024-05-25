import {
	mock,
} from 'node:test';

export function mockLoggerFactory() {
	return {
		// child logger creation
		child: mock.fn(() => mockLoggerFactory()),
		// built-in pino log methods
		debug: mock.fn(),
		error: mock.fn(),
		fatal: mock.fn(),
		info: mock.fn(),
		trace: mock.fn(),
		warn: mock.fn(),
		// custom log methods
		mark: mock.fn(),
		measure: mock.fn(),
	};
}
