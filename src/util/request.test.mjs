import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { mockLogger } from '#src/vitest/logger.mock.mjs';
import {
	DEFAULT_REQUEST_RETRY_COUNT,
	REQUEST_RETRY_DELAY,
	RequestError,
	request,
} from './request.mjs';

describe('request()', () => {
	const url = 'https://example.com';
	const options = {
		method: 'GET',
	};
	let fetchMock;
	let responseMock;
	let setTimeoutMock;

	beforeEach(() => {
		responseMock = {
			ok: true,
			status: 200,
			statusText: 'OK',
		};
		fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(responseMock);

		setTimeoutMock = vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback) => callback());
	});

	it('should call the fetch method and return the response', async () => {
		const response = await request(url, options, mockLogger());

		expect(fetchMock).toHaveBeenCalledWith(url, options);
		expect(response).toBe(responseMock);
	});

	it('should retry the request and return the response when the fetch method throws an error', async () => {
		for (let callIndex = 0; callIndex < DEFAULT_REQUEST_RETRY_COUNT; ++callIndex) {
			fetchMock.mockRejectedValueOnce(new Error());
		}

		const response = await request(url, options, mockLogger(), DEFAULT_REQUEST_RETRY_COUNT);

		expect(fetchMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT + 1);
		expect(setTimeoutMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT);
		expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), REQUEST_RETRY_DELAY);
		expect(response).toBe(responseMock);
	});

	it('should throw a RequestError without retry when the response is not ok with client error', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		await expect(request(url, options, mockLogger(), 2)).rejects.toThrowError(RequestError);
		expect(setTimeoutMock).not.toHaveBeenCalled();
	});
});
