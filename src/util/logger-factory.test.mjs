import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import { loggerFactory } from '#util';

// expose a mocked logger for other test modules
export function mockLoggerFactory () {
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

describe('loggerFactory', () => {
	let fsMock;
	let loggerMock;
	let performanceMock;
	let pinoMock;
	let pinoPrettyMock;

	beforeEach(() => {
		performanceMock = {
			mark: mock.fn(),
			measure: mock.fn(),
		};
		fsMock = {
			createWriteStream: mock.fn(),
		};
		loggerMock = {};
		pinoMock = mock.fn(() => loggerMock);
		pinoMock.levels = {
			values: {
				debug: 42,
			},
		};
		pinoMock.multistream = mock.fn();
		pinoPrettyMock = mock.fn();
	});

	it('should create and return a logger based on the config', () => {
		const logConfig = {
			level: 'warn',
			// empty config
		};

		const logger = loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		strict.equal(pinoMock.mock.calls.length, 1);

		const firstCall = pinoMock.mock.calls[0];
		const [optionsArg, streamArg] = firstCall.arguments;
		strict.equal(optionsArg.base, undefined);
		strict.deepEqual(optionsArg.customLevels, {
			mark: pinoMock.levels.values.debug + 1,
			measure: pinoMock.levels.values.debug + 2,
		});
		strict.equal(optionsArg.level, logConfig.level);
		strict.ok(optionsArg.hooks.logMethod instanceof Function);

		strict.equal(pinoMock.multistream.mock.calls.length, 0);

		strict.equal(streamArg, undefined);

		strict.equal(logger, loggerMock);
	});

	it('should create a file stream when the file path is defined', () => {
		const writeStreamMock = {};
		fsMock.createWriteStream.mock.mockImplementation(() => writeStreamMock);

		const streamMock = {};
		pinoMock.multistream.mock.mockImplementation(() => streamMock);

		const logConfig = {
			filePath: '/tmp/test.log',
			level: 'warn',
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		strict.equal(fsMock.createWriteStream.mock.calls.length, 1);

		const firstCreateWriteStreamCall = fsMock.createWriteStream.mock.calls[0];
		strict.deepEqual(firstCreateWriteStreamCall.arguments, [
			logConfig.filePath,
		]);

		strict.equal(pinoMock.multistream.mock.calls.length, 1);

		const firstMultistreamCall = pinoMock.multistream.mock.calls[0];
		strict.deepEqual(firstMultistreamCall.arguments, [
			[
				{
					level: logConfig.level,
					stream: writeStreamMock,
				},
			],
		]);

		const firstPinoCall = pinoMock.mock.calls[0];
		const [_optionsArg, streamArg] = firstPinoCall.arguments;
		strict.deepEqual(streamArg, streamMock);
	});

	it('should create a pretty pino stream when it is enabled', () => {
		const pinoPrettyStreamMock = {};
		pinoPrettyMock.mock.mockImplementation(() => pinoPrettyStreamMock);

		const streamMock = {};
		pinoMock.multistream.mock.mockImplementation(() => streamMock);

		const logConfig = {
			pretty: true,
			prettyColorize: true,
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		strict.equal(pinoPrettyMock.mock.calls.length, 1);

		const firstPinoPrettyCall = pinoPrettyMock.mock.calls[0];
		strict.deepEqual(firstPinoPrettyCall.arguments, [
			{
				colorize: true,
				customColors: 'mark:blue,measure:blue',
				customLevels: {
					mark: pinoMock.levels.values.debug + 1,
					measure: pinoMock.levels.values.debug + 2,
				},
				useOnlyCustomProps: false,
			},
		]);

		strict.equal(pinoMock.multistream.mock.calls.length, 1);

		const firstMultistreamCall = pinoMock.multistream.mock.calls[0];
		strict.deepEqual(firstMultistreamCall.arguments, [
			[
				{
					level: logConfig.level,
					stream: pinoPrettyStreamMock,
				},
			],
		]);

		const firstPinoCall = pinoMock.mock.calls[0];
		const [_optionsArg, streamArg] = firstPinoCall.arguments;
		strict.deepEqual(streamArg, streamMock);
	});

	it('should turn off color output when the prettyColorize config is false', () => {
		const pinoPrettyStreamMock = {};
		pinoPrettyMock.mock.mockImplementation(() => pinoPrettyStreamMock);

		const streamMock = {};
		pinoMock.multistream.mock.mockImplementation(() => streamMock);

		const logConfig = {
			pretty: true,
			prettyColorize: false,
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		const firstPinoPrettyCall = pinoPrettyMock.mock.calls[0];
		const [optionArg] = firstPinoPrettyCall.arguments;
		strict.equal(optionArg.colorize, false);
	});

	describe('logMethod hook', () => {
		const logConfig = {
			level: 'trace',
		};
		let logMethodMock;
		let customLevels;
		let logMethodHook;

		beforeEach(() => {
			logMethodMock = mock.fn();

			loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

			const firstCall = pinoMock.mock.calls[0];
			const [optionsArg] = firstCall.arguments;

			customLevels = optionsArg.customLevels;
			logMethodHook = optionsArg.hooks.logMethod;
		});

		it('should properly handle "mark" events', () => {
			const markName = 'mark 123';
			logMethodHook([markName], logMethodMock, customLevels.mark);

			strict.equal(performanceMock.mark.mock.calls.length, 1);

			const firstMarkCall = performanceMock.mark.mock.calls[0];
			strict.deepEqual(firstMarkCall.arguments, [
				markName,
			]);

			strict.equal(logMethodMock.mock.calls.length, 1);

			const firstLogMethodCall = logMethodMock.mock.calls[0];
			strict.deepEqual(firstLogMethodCall.arguments, [
				markName,
			]);
		});

		it('should properly handle "measure" events', () => {
			const duration = 2964.4601969718933;
			const startTime = 5865.243420124054;
			performanceMock.measure.mock.mockImplementation(() => ({
				duration,
				startTime,
			}));

			const measureName = 'measure 123';
			const startMark = 'mark 456';
			const endMark = 'mark 789';
			logMethodHook([measureName, startMark, endMark], logMethodMock, customLevels.measure);

			strict.equal(performanceMock.measure.mock.calls.length, 1);

			const firstMeasureCall = performanceMock.measure.mock.calls[0];
			strict.deepEqual(firstMeasureCall.arguments, [
				measureName,
				startMark,
				endMark,
			]);

			strict.equal(logMethodMock.mock.calls.length, 1);

			const firstLogMethodCall = logMethodMock.mock.calls[0];
			strict.deepEqual(firstLogMethodCall.arguments, [
				{
					duration,
					startTime,
				},
				measureName,
			]);
		});

		it('should flip the object and string arguments', () => {
			const logObject = {};
			const logMessage = 'message';
			logMethodHook([logMessage, logObject], logMethodMock, 'warn');

			strict.equal(logMethodMock.mock.calls.length, 1);

			const firstLogMethodCall = logMethodMock.mock.calls[0];
			strict.deepEqual(firstLogMethodCall.arguments, [
				logObject,
				logMessage,
			]);
		});
	});
});
