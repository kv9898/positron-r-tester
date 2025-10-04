/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2023 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { runThatTest } from './runner-testthat';
import { TestingTools } from './util-testing';
import { LOGGER } from '../extension';

function maybeEnqueue(
	test: vscode.TestItem,
	queue: vscode.TestItem[],
	excludeSet: readonly vscode.TestItem[] | undefined
) {
	if (!excludeSet?.includes(test)) {
		queue.push(test);
	}
}

export async function runHandler(
	testingTools: TestingTools,
	request: vscode.TestRunRequest,
	token: vscode.CancellationToken
) {
	LOGGER.info('Test run started');
	const run = testingTools.controller.createTestRun(request);
	const queue: vscode.TestItem[] = [];
	const explicitInclude = Boolean(request.include?.length);
	const explicitExclude = Boolean(request.exclude?.length);
	const runAllTests = !explicitInclude && !explicitExclude;

	// If an individual test (case) is excluded, we approach its parent test (file) as a collection
	// of tests (cases), instead of as a single test (file).
	const toBreakUp: vscode.TestItem[] = [];
	if (explicitExclude) {
		request.exclude!.forEach((test) => {
			if (test.parent !== undefined) {
				toBreakUp.push(test.parent!);
			}
		});
	}

	// We only enqueue tests if we are running something smaller than the whole suite.
	if (!runAllTests) {
		const eligibleTests = explicitInclude ? request.include! : testingTools.controller.items;
		eligibleTests.forEach((test) => {
			if (toBreakUp.includes(test)) {
				test.children.forEach((childTest) => {
					maybeEnqueue(childTest, queue, request.exclude);
				});
			} else {
				maybeEnqueue(test, queue, request.exclude);
			}
		});
		LOGGER.info(`${queue.length} tests are enqueued`);
	}

	while (!token.isCancellationRequested && (queue.length > 0 || runAllTests)) {
		let test: vscode.TestItem | undefined;
		if (queue.length > 0) {
			test = queue.pop()!;
		}

		const startDate = Date.now();
		try {
			if (runAllTests) {
				LOGGER.info('Running all tests');
			} else {
				LOGGER.info(`Running test with label "${test!.label}"`);
			}
			const stdout = await runThatTest(testingTools, run, test);
			LOGGER.info(`Test output:\n${stdout}`);
		} catch (error) {
			LOGGER.error(`Run errored with reason: "${error}"`);
			if (test) {
				run.errored(test, new vscode.TestMessage(String(error)), Date.now() - startDate);
			}
		}

		if (runAllTests) {
			break;
		}
	}

	run.end();
}
