// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('node:child_process');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
let myStatusBarItem;
let quickPick;
function activate(context) {
	const commandId = 'extension.openDirectory';

	myStatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left, // align type
		50 // weight
	);
	myStatusBarItem.command = commandId;
	myStatusBarItem.text = `$(file-directory) Open`;
	myStatusBarItem.show();
	context.subscriptions.push(myStatusBarItem);

	// create quick pick
	quickPick = vscode.window.createQuickPick();
	quickPick.onDidChangeSelection(selection => {
		execOpen(selection[0].path);
		quickPick.hide();
	});

	// bind click event
	const clickDisposable = vscode.commands.registerCommand(commandId, () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders.length > 0) {
			// Single-folder workspaces
			if (workspaceFolders.length === 1) {
				const currentDocumentUri = workspaceFolders[0].uri;

				// shell command
				execOpen(currentDocumentUri);
			} else {
				// Multi-root workspaces
				quickPick.items = workspaceFolders.map(folder => ({
					label: folder.name,
					path: folder.uri.path
				}));
				quickPick.show();
			}
		} else {
			showInfoMessage();
		}
	});
	context.subscriptions.push(clickDisposable);
}

function showInfoMessage() {
	vscode.window.showInformationMessage('当前没有可供打开的文件目录');
}

function execOpen(path) {
	exec(`open ${path}`, (error, stdout, stderr) => {
		if (error) {
			console.error(`执行的错误: ${error}`);
			this.showInfoMessage();
			return;
		}
		if (stderr) {
			this.showInfoMessage();
			console.log(`stderr: ${stderr}`);
		}
	});
}

// This method is called when your extension is deactivated
function deactivate() {
	myStatusBarItem.dispose();
	quickPick.dispose();
}

module.exports = {
	activate,
	deactivate
}
