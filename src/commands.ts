/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2023-2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
// import { checkInstalled } from './session';
// import { RRuntimeManager } from './runtime-manager';
// import { getRPackageTasks } from './tasks';
import { onDidDiscoverTestFiles } from './testing/testing';

export async function registerCommands(context: vscode.ExtensionContext) {

    context.subscriptions.push(

        // vscode.commands.registerCommand('r.packageTest', async () => {
        //     const tasks = await getRPackageTasks();
        //     const task = tasks.filter(task => task.definition.task === 'r.task.packageTest')[0];
        //     const isInstalled = await checkInstalled(task.definition.pkg);
        //     if (isInstalled) {
        //         vscode.tasks.executeTask(task);
        //     }
        // }),

        vscode.commands.registerCommand('r.TestExplorer', async () => {
            vscode.commands.executeCommand('workbench.view.testing.focus');

            if (context.workspaceState.get('positron.r.testExplorerSetUp') === true) {
                vscode.commands.executeCommand('testing.runAll');
            } else {
                // if this is first time opening the test explorer, wait for tests to be discovered
                onDidDiscoverTestFiles(() => {
                    vscode.commands.executeCommand('testing.runAll');
                });
            }
        }),
    );
}

export async function getEditorFilePathForCommand() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        // No editor; nothing to do
        return;
    }

    const filePath = editor.document.uri.fsPath;
    if (!filePath) {
        // File is unsaved; show a warning
        vscode.window.showWarningMessage('Cannot save untitled file.');
        return;
    }

    // Save the file before executing command to ensure that the contents are
    // up to date with editor buffer.
    await vscode.commands.executeCommand('workbench.action.files.save');

    // Check to see if the fsPath is an actual path to a file using
    // the VS Code file system API.
    const fsStat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));

    // Return the full path, with POSIX path separators. Any additional path
    // math, escaping, or quoting is the responsibility of the caller.
    if (fsStat) {
        return filePath.replace(/\\/g, '/');
    }
    return;
}
