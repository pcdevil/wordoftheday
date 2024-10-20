import { vi } from 'vitest';
// project imports
import { mockLogger } from '#src/vitest/mocks/logger.mock.mjs';

// mock logger for all tests
vi.mock('#src/util/logger.mjs', () => ({
	getLogger: vi.fn().mockImplementation(() => mockLogger()),
	clearLoggers: vi.fn(),
}));
