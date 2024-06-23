import * as vscode from "vscode";
import { translate } from '@vitalets/google-translate-api';

async function translateText(
  phrase: string,
  targetLang: string
): Promise<string> {
  try {
    const phraseBuffer = Buffer.from(phrase, 'utf-8');
    const { text } = await translate(phraseBuffer.toString(), { to: targetLang });
    return text;
  } catch (error) {
    console.error(error);
    return "Translation error";
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.translateText",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text) {
          // List of supported languages
          const languages = [
            { label: "English", code: "en" },
            { label: "Spanish", code: "es" },
            { label: "Italian", code: "it" },
            { label: "Portuguese", code: "pt" },
            { label: "French", code: "fr" },
            { label: "German", code: "de" },
          ];

          const languagePick = await vscode.window.showQuickPick(languages, {
            placeHolder: "Select a language to translate to"
          });

          if (languagePick) {
            const targetLang = languagePick.code;
            const translatedText = await translateText(text, targetLang);

            // Create a decoration type
            const decorationType = vscode.window.createTextEditorDecorationType({
              after: {
                contentText: translatedText,
                backgroundColor: 'yellow',
                color: 'black',
                margin: '0 0 0 1em'
              }
            });

            // Apply the decoration
            editor.setDecorations(decorationType, [selection]);

            // Optionally, remove the decoration after a delay
            setTimeout(() => {
              editor.setDecorations(decorationType, []);
            }, 3000);
          } else {
            vscode.window.showInformationMessage("No language selected");
          }
        } else {
          vscode.window.showInformationMessage("No text selected");
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
