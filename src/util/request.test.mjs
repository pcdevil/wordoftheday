import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import { mockLoggerFactory } from '#test';
import {
	DEFAULT_REQUEST_RETRY_COUNT,
	REQUEST_RETRY_DELAY,
	RequestError,
	request,
} from '#util';

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
		jsonMock = mock.fn(() => Promise.resolve(responseMock));
		fetchMock = mock.fn(() =>
			Promise.resolve({
				json: jsonMock,
				ok: true,
			})
		);
		setTimeoutMock = mock.fn((callback) => callback());
	});

	it('should properly call the fetch method and return the response', async () => {
		await request(url, options, mockLoggerFactory(), 0, fetchMock, setTimeoutMock);

		const firstCall = fetchMock.mock.calls[0];
		strict.deepEqual(firstCall.arguments, [
			url,
			options,
		]);
	});

	it('should retry the request when the fetch method throws an error', async () => {
		for (let callIndex = 0; callIndex < DEFAULT_REQUEST_RETRY_COUNT; ++callIndex) {
			fetchMock.mock.mockImplementationOnce(() => Promise.reject(new Error()), callIndex);
		}

		await request(url, options, mockLoggerFactory(), DEFAULT_REQUEST_RETRY_COUNT, fetchMock, setTimeoutMock);

		strict.equal(fetchMock.mock.calls.length, DEFAULT_REQUEST_RETRY_COUNT + 1);
	});

	it('should wait for the retry delay before every retry', async () => {
		for (let callIndex = 0; callIndex < DEFAULT_REQUEST_RETRY_COUNT; ++callIndex) {
			fetchMock.mock.mockImplementationOnce(() => Promise.reject(new Error()), callIndex);
		}

		await request(url, options, mockLoggerFactory(), DEFAULT_REQUEST_RETRY_COUNT, fetchMock, setTimeoutMock);

		strict.equal(setTimeoutMock.mock.calls.length, DEFAULT_REQUEST_RETRY_COUNT);

		for (const call of setTimeoutMock.mock.calls) {
			const [_callback, delay] = call.arguments;
			strict.equal(delay, REQUEST_RETRY_DELAY);
		}
	});

	it('should throw a RequestError without retry when the response is not ok with client error', async () => {
		responseMock = {
			ok: false,
			status: 404,
			statusText: 'Not Found',
		};
		fetchMock.mock.mockImplementation(() => Promise.resolve(responseMock));

		await strict.rejects(
			request(url, options, mockLoggerFactory(), 2, fetchMock, setTimeoutMock),
			RequestError
		);

		strict.equal(setTimeoutMock.mock.calls.length, 0);
	});
});
