import { vi } from 'vitest';

export function mockPerformance() {
	return {
		mark: vi.fn(),
		measure: vi.fn(),
	};
}
