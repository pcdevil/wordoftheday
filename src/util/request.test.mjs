import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { fakeRequestOptions, fakeRequestUrl } from '#src/vitest/fakers/request.faker.mjs';
import { mockLogger } from '#src/vitest/mocks/logger.mock.mjs';
import { mockNotFoundResponse, mockTextResponse } from '#src/vitest/mocks/response.mock.mjs';
import {
	DEFAULT_REQUEST_RETRY_COUNT,
	REQUEST_RETRY_DELAY,
	RequestError,
	request,
} from './request.mjs';

describe('request()', () => {
	let testUrl;
	let testOptions;
	let fetchMock;
	let responseMock;
	let setTimeoutMock;

	beforeEach(() => {
		testUrl = fakeRequestUrl();
		testOptions = fakeRequestOptions();

		responseMock = mockTextResponse();
		fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(responseMock);

		setTimeoutMock = vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback) => callback());
	});

	it('should call the fetch method and return the response', async () => {
		const response = await request(testUrl, testOptions, mockLogger());

		expect(fetchMock).toHaveBeenCalledWith(testUrl, testOptions);
		expect(response).toBe(responseMock);
	});

	it('should retry the request and return the response when the fetch method throws an error', async () => {
		for (let callIndex = 0; callIndex < DEFAULT_REQUEST_RETRY_COUNT; ++callIndex) {
			fetchMock.mockRejectedValueOnce(new Error());
		}

		const response = await request(testUrl, testOptions, mockLogger(), DEFAULT_REQUEST_RETRY_COUNT);

		expect(fetchMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT + 1);
		expect(setTimeoutMock).toHaveBeenCalledTimes(DEFAULT_REQUEST_RETRY_COUNT);
		expect(setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), REQUEST_RETRY_DELAY);
		expect(response).toBe(responseMock);
	});

	it('should throw a RequestError without retry when the response is not ok with client error', async () => {
		fetchMock.mockResolvedValue(mockNotFoundResponse());

		await expect(request(testUrl, testOptions, mockLogger(), 2)).rejects.toThrowError(RequestError);
		expect(setTimeoutMock).not.toHaveBeenCalled();
	});
});
