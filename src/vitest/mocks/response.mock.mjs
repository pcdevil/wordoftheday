import { vi } from 'vitest';

export function mockJsonResponse (jsonResponse = {}) {
	return {
		json: vi.fn().mockResolvedValue(jsonResponse),
		ok: true,
		status: 200,
		statusText: 'OK',
	};
}

export function mockTextResponse (textResponse = '') {
	return {
		ok: true,
		status: 200,
		statusText: 'OK',
		text: vi.fn().mockResolvedValue(textResponse),
	};
}

export function mockNotFoundResponse () {
	return {
		ok: false,
		status: 404,
		statusText: 'Not Found',
		text: vi.fn().mockResolvedValue('404 Not Found'),
	};
}
