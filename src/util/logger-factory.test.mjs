import { createWriteStream } from 'node:fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { config } from '#src/lib/config.mjs';
import { loggerFactory } from './logger-factory.mjs';

vi.mock('node:fs');
vi.mock('pino');
vi.mock('pino-pretty');
vi.mock('#src/lib/config.mjs');
const mocks = {
	config: vi.mocked(config),
	createWriteStream: vi.mocked(createWriteStream),
	pino: vi.mocked(pino),
	pinoPretty: vi.mocked(pinoPretty),
};

describe('loggerFactory', () => {
	let pinoLoggerMock;
	let performanceMock;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'log', 'get').mockReturnValue({
			level: 'warn',
		});

		pinoLoggerMock = {};

		performanceMock = {
			mark: vi.fn(),
			measure: vi.fn(),
		};
		vi.spyOn(globalThis, 'performance', 'get').mockReturnValue(performanceMock);

		mocks.pino.mockReturnValue(pinoLoggerMock);
		mocks.pino.levels = {
			values: {
				debug: 42,
			},
		};
		mocks.pino.multistream = vi.fn();
	});

	it('should create and return a logger based on the config', () => {
		const logger = loggerFactory();

		expect(mocks.pino).toHaveBeenCalledWith(
			{
				base: undefined,
				customLevels: {
					mark: mocks.pino.levels.values.debug + 1,
					measure: mocks.pino.levels.values.debug + 2,
				},
				hooks: {
					logMethod: expect.any(Function),
				},
				level: mocks.config.log.level,
			},
			undefined
		);
		expect(mocks.pino.multistream).not.toHaveBeenCalled();
		expect(logger).toBe(pinoLoggerMock);
	});

	it('should create a file stream when the file path is defined', () => {
		mocks.config.log.filePath = '/tmp/test.log';

		const writeStreamMock = {};
		mocks.createWriteStream.mockReturnValue(writeStreamMock);

		const streamMock = {};
		mocks.pino.multistream.mockReturnValue(streamMock);

		loggerFactory();

		expect(mocks.createWriteStream).toHaveBeenCalledWith(mocks.config.log.filePath);
		expect(mocks.pino.multistream).toHaveBeenCalledWith([
			{ level: mocks.config.log.level, stream: writeStreamMock },
		]);
		expect(mocks.pino).toHaveBeenCalledWith(expect.anything(), streamMock);
	});

	it('should create a pretty pino stream when it is enabled', () => {
		const pinoPrettyStreamMock = {};
		mocks.pinoPretty.mockReturnValue(pinoPrettyStreamMock);

		const streamMock = {};
		mocks.pino.multistream.mockReturnValue(streamMock);

		mocks.config.log.pretty = true;
		mocks.config.log.prettyColorize = true;

		loggerFactory();

		expect(mocks.pinoPretty).toHaveBeenCalledWith({
			colorize: true,
			customColors: 'mark:blue,measure:blue',
			customLevels: {
				mark: mocks.pino.levels.values.debug + 1,
				measure: mocks.pino.levels.values.debug + 2,
			},
			useOnlyCustomProps: false,
		});
		expect(mocks.pino.multistream).toHaveBeenCalledWith([
			{ level: mocks.config.log.level, stream: pinoPrettyStreamMock },
		]);
	});

	it('should turn off color output when the prettyColorize config is false', () => {
		const pinoPrettyStreamMock = {};
		mocks.pinoPretty.mockReturnValue(pinoPrettyStreamMock);

		const streamMock = {};
		mocks.pino.multistream.mockReturnValue(streamMock);

		mocks.config.log.pretty = true;
		mocks.config.log.prettyColorize = false;

		loggerFactory();

		expect(mocks.pinoPretty).toHaveBeenCalledWith(expect.objectContaining({ colorize: false }));
	});

	describe('logMethod hook', () => {
		let logMethodMock;
		let customLevels;
		let logMethodHook;

		beforeEach(() => {
			logMethodMock = vi.fn();

			mocks.config.log.level = 'trace';

			loggerFactory();

			const [optionsArg] = mocks.pino.mock.calls[0];
			customLevels = optionsArg.customLevels;
			logMethodHook = optionsArg.hooks.logMethod;
		});

		it('should handle "mark" events', () => {
			const markName = 'mark 123';
			logMethodHook([markName], logMethodMock, customLevels.mark);

			expect(performanceMock.mark).toHaveBeenCalledWith(markName);
			expect(logMethodMock).toHaveBeenCalledWith(markName);
		});

		it('should handle "measure" events', () => {
			const duration = 2964.4601969718933;
			const startTime = 5865.243420124054;
			performanceMock.measure.mockReturnValue({ duration, startTime });

			const measureName = 'measure 123';
			const startMark = 'mark 456';
			const endMark = 'mark 789';
			logMethodHook([measureName, startMark, endMark], logMethodMock, customLevels.measure);

			expect(performanceMock.measure).toHaveBeenCalledWith(measureName, startMark, endMark);
			expect(logMethodMock).toHaveBeenCalledWith({ duration, startTime }, measureName);
		});

		it('should flip the object and string arguments', () => {
			const logObject = {};
			const logMessage = 'message';
			logMethodHook([logMessage, logObject], logMethodMock, 'warn');

			expect(logMethodMock).toHaveBeenCalledWith(logObject, logMessage);
		});
	});
});
