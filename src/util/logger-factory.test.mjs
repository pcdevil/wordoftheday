import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { loggerFactory } from './logger-factory.mjs';

describe('loggerFactory', () => {
	let fsMock;
	let loggerMock;
	let performanceMock;
	let pinoMock;
	let pinoPrettyMock;

	beforeEach(() => {
		performanceMock = {
			mark: vi.fn(),
			measure: vi.fn(),
		};
		fsMock = {
			createWriteStream: vi.fn(),
		};
		loggerMock = {};
		pinoMock = vi.fn().mockReturnValue(loggerMock);
		pinoMock.levels = {
			values: {
				debug: 42,
			},
		};
		pinoMock.multistream = vi.fn();
		pinoPrettyMock = vi.fn();
	});

	it('should create and return a logger based on the config', () => {
		const logConfig = {
			level: 'warn',
			// empty config
		};

		const logger = loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		expect(pinoMock).toHaveBeenCalledWith(
			{
				base: undefined,
				customLevels: {
					mark: pinoMock.levels.values.debug + 1,
					measure: pinoMock.levels.values.debug + 2,
				},
				hooks: {
					logMethod: expect.any(Function),
				},
				level: logConfig.level,
			},
			undefined
		);
		expect(pinoMock.multistream).not.toHaveBeenCalled();
		expect(logger).toBe(loggerMock);
	});

	it('should create a file stream when the file path is defined', () => {
		const writeStreamMock = {};
		fsMock.createWriteStream.mockReturnValue(writeStreamMock);

		const streamMock = {};
		pinoMock.multistream.mockReturnValue(streamMock);

		const logConfig = {
			filePath: '/tmp/test.log',
			level: 'warn',
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		expect(fsMock.createWriteStream).toHaveBeenCalledWith(logConfig.filePath);
		expect(pinoMock.multistream).toHaveBeenCalledWith([
			{ level: logConfig.level, stream: writeStreamMock },
		]);
		expect(pinoMock).toHaveBeenCalledWith(expect.anything(), streamMock);
	});

	it('should create a pretty pino stream when it is enabled', () => {
		const pinoPrettyStreamMock = {};
		pinoPrettyMock.mockReturnValue(pinoPrettyStreamMock);

		const streamMock = {};
		pinoMock.multistream.mockReturnValue(streamMock);

		const logConfig = {
			pretty: true,
			prettyColorize: true,
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		expect(pinoPrettyMock).toHaveBeenCalledWith({
			colorize: true,
			customColors: 'mark:blue,measure:blue',
			customLevels: {
				mark: pinoMock.levels.values.debug + 1,
				measure: pinoMock.levels.values.debug + 2,
			},
			useOnlyCustomProps: false,
		});
		expect(pinoMock.multistream).toHaveBeenCalledWith([
			{ level: logConfig.level, stream: pinoPrettyStreamMock },
		]);
	});

	it('should turn off color output when the prettyColorize config is false', () => {
		const pinoPrettyStreamMock = {};
		pinoPrettyMock.mockReturnValue(pinoPrettyStreamMock);

		const streamMock = {};
		pinoMock.multistream.mockReturnValue(streamMock);

		const logConfig = {
			pretty: true,
			prettyColorize: false,
		};

		loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

		expect(pinoPrettyMock).toHaveBeenCalledWith(expect.objectContaining({ colorize: false }));
	});

	describe('logMethod hook', () => {
		const logConfig = {
			level: 'trace',
		};
		let logMethodMock;
		let customLevels;
		let logMethodHook;

		beforeEach(() => {
			logMethodMock = vi.fn();

			loggerFactory(logConfig, performanceMock, fsMock, pinoMock, pinoPrettyMock);

			const [optionsArg] = pinoMock.mock.calls[0];
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
