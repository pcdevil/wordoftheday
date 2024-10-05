import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
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
	let jsonMock;
	let responseMock;
	let setTimeoutMock;

	beforeEach(() => {
		responseMock = {
			ok: true,
			status: 200,
			statusText: 'OK',
		};
		jsonMock = vi.fn().mockResolvedValue(responseMock);
		fetchMock = vi.fn().mockResolvedValue({
			json: jsonMock,
			ok: true,
		});
		setTimeoutMock = vi.fn().mockImplementation((callback) => callback());
	});

	it('should call the fetch method and return the response', async () => {
		await request(url, options, mockLoggerFactory(), 0, fetchMock, setTimeoutMock);

		expect(fetchMock).toHaveBeenCalledWith(url, options);
	});

	it('should retry the request when the fetch method throws an error', async () => {
		for (let callIndex = 0; callIndex < DEFAULT_REQUEST_RETRY_COUNT; ++callIndex) {
			fetchMock.mockRejectedValueOnce(new Error());
		}

		await request(url, options, mockLoggerFactory(), DEFAULT_REQUEST_RETRY_COUNT, fetchMock, setTimeoutMock);

		expect(fetchMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT + 1);
		expect(setTimeoutMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT);
		expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), REQUEST_RETRY_DELAY);
	});

	it('should throw a RequestError without retry when the response is not ok with client error', async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		});

		await expect(request(url, options, mockLoggerFactory(), 2, fetchMock, setTimeoutMock)).rejects.toThrowError(RequestError);
		expect(setTimeoutMock).not.toHaveBeenCalled();
	});
});
