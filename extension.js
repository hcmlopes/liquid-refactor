const vscode = require('vscode');
const path = require('path');
const fs = require('fs');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "liquid-refactor" is now active!');

  let disposable = vscode.commands.registerTextEditorCommand('extension.moveCodeToSnippet', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      // Prompt the user for the snippet file name
      vscode.window.showInputBox({
        prompt: 'Enter the snippet file name',
        placeHolder: 'snippet or snippet.liquid'
      }).then((snippetFileName) => {
        if (snippetFileName) {
          if (!snippetFileName.endsWith('.liquid')) {
            snippetFileName += '.liquid';
          }

          // Specify the project root and snippet folder paths
          const projectRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
          const snippetFolderPath = path.join(projectRoot, 'snippets');

          // Create the snippet folder if it doesn't exist
          if (!fs.existsSync(snippetFolderPath)) {
            fs.mkdirSync(snippetFolderPath);
          }

          // Specify the snippet file path
          const snippetFilePath = path.join(snippetFolderPath, snippetFileName);

          // Write the selected text to the snippet file
          fs.writeFileSync(snippetFilePath, selectedText);

          // Replace the selected text with a snippet reference
          const snippetReference = `{% render '${snippetFileName.replace('.liquid', '')}' %}`;
          editor.edit((editBuilder) => {
            // Insert the snippet reference and remove the selected code
            editBuilder.replace(selection, snippetReference);
          }).then(() => {
            vscode.window.showInformationMessage('Code moved to snippet file!');
          });
        }
      });
    }
  });

  context.subscriptions.push(disposable);
}

module.exports = {
  activate
}