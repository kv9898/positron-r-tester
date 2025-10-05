import * as vscode from 'vscode';
import * as positron from 'positron';
import fs from 'fs';

/**
 * Returns an ExecutionObserver that shows an error message using the given template
 * string, formatted with the given template arguments. If the error is due to a
 * missing 'jsonlite' package, it will prompt the user to install it. Optionally,
 * it can call a function after the error handling is finished.
 * @param template The vscode.l10n template string to use for the error message.
 * @param sidebarProvider The SidebarProvider to use for installing the jsonlite
 *     package if necessary.
 * @param templateArguments An array of arguments to pass to the template string, before the error message.
 * @param onAfterError An optional function to call after the error handling is finished.
 */
export function getObserver(
    template: string,
    templateArguments: (string | number | boolean)[] = [],
    onAfterError?: () => void
): positron.runtime.ExecutionObserver {

    function errorHandling(error: string) {
        const fullArgs = [...templateArguments, error];
        // Check for pak-specific error
        // Check for jsonlite-specific error
        if (/jsonlite/i.test(error)) {
            vscode.window.showWarningMessage(
                vscode.l10n.t("The 'jsonlite' package appears to be missing. You need it for testing"),
            );
        } else if (/readRDS/i.test(error)) {
            const restartLabel = vscode.l10n.t("Restart R");

            vscode.window.showWarningMessage(
                vscode.l10n.t("A readRDS() error was encountered. Please restart R to continue."),
                restartLabel
            ).then(selection => {
                if (selection === restartLabel) {
                    positron.runtime.getForegroundSession().then((session) => {
                        if (session?.metadata.sessionId.startsWith('r-')) {
                            positron.runtime.restartSession(session?.metadata.sessionId);
                        } else {
                            vscode.window.showWarningMessage(
                                vscode.l10n.t("No active R session found in the foreground. Please restart R manually.")
                            );
                        }
                    });
                }
            });
        } else {
            vscode.window.showErrorMessage(vscode.l10n.t(template, ...fullArgs));
            if (onAfterError) { onAfterError(); }
        }
    }

    const observer: positron.runtime.ExecutionObserver = {
        // onError: (error: string) => {
        //     errorHandling(stripAnsi(error));
        // },
        onFailed: (error: Error) => {
            errorHandling(stripAnsi(error.message));
        }
    };
    return observer;
}

/**
 * Waits for a file to appear in the file system, periodically checking for its
 * existence until a timeout is reached or the file is found.
 * @param filePath The path to the file to wait for.
 * @param timeout The maximum time to wait for the file to appear, in milliseconds.
 * @returns A promise that resolves when the file is found or rejects when the
 * timeout is reached.
 */
export async function waitForFile(filePath: string, timeout = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
            if (fs.existsSync(filePath)) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                const error = new Error(vscode.l10n.t("Timeout waiting for file: {0}", filePath));
                vscode.window.showErrorMessage(error.message);
                reject(error);
            }
        }, 100);
    });
}

/**
 * Remove ANSI escape codes from a string, so that only the plain text remains.
 * This is for making error messages more readable.
 * @param text The string to remove escape codes from.
 * @returns The string with escape codes removed.
 */
export function stripAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
}