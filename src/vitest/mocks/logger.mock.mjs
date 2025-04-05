import { vi } from 'vitest';

export function mockLogger () {
	return {
		// child logger creation
		child: vi.fn(() => mockLogger()),
		// built-in pino log methods
		debug: vi.fn(),
		error: vi.fn(),
		fatal: vi.fn(),
		info: vi.fn(),
		trace: vi.fn(),
		warn: vi.fn(),
		// custom log methods
		mark: vi.fn(),
		measure: vi.fn(),
	};
}
