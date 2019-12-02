'use strict';
import * as vscode from 'vscode';

//----------------------------------------------------------------グローバル関数


/** 書式設定 */
export let decoTypeOpt: vscode.DecorationRenderOptions = getSettings();

/** 書式設定マネージャー */
export let decoTypeForZenkaku: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType(decoTypeOpt);

//----------------------------------------------------------------グローバル関数ここまで

export function activate(context: vscode.ExtensionContext) {

	//console.log('flexibleZenkaku is Activated!');

	//----------------------------------------------------------------とりあえず、activate時に行われる処理はここまで。

	//各イベント間共通で持っておきたい准グローバル変数があるなら、
	//このようにして、function内に閉じ込めて、onDidOpenTextDocumentイベントの処理に登録して、
	//クロージャ化しておく必要がある。

	let timeout: NodeJS.Timer | undefined = undefined;

	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		triggerUpdate();
	}

	//----------------------------------------------------------------activate時には大体ドキュメントが選択されているときなので、
	//----------------------------------------------------------------ここまでは最初にまず実行されると思っていい。以後は、各イベント発火時の処理の登録。

	//editorを引数にした{}の関数を渡す。イベント発火時に、これを実行する。
	//また、context.subscriptionsにdispose対象として追加する。
	vscode.window.onDidChangeActiveTextEditor( (editor) : void => {
		activeEditor = editor;
		if (editor) {
			triggerUpdate();
		}
	}, null, context.subscriptions);

	//editorを引数にした{}の関数を渡す。イベント発火時に、これを実行する。
	//また、context.subscriptionsにdispose対象として追加する。
	vscode.workspace.onDidChangeTextDocument( (event) : void => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdate();
		}
	}, null, context.subscriptions);

	
	//----------------------------------------------------------------各イベント発火時の処理の登録はここまで。
	//----------------------------------------------------------------以降は、処理が実行する関数の定義が並ぶ。

	/**
	 * 連続入力を考慮して、500msに1回実行される。
	 */
	function triggerUpdate() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 100);
	}

	/**
	 * 設定を読み込み、全角スペースに色情報を適用する。
	 */
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		//「設定」で色変更があったときは、いったん色情報をクリアする。
		reloadColorSetting(decoTypeOpt);

		// decoTypeForZenkakuをグローバル変数にせず、都度settingsの値を取るようにすると、色が重なって適用される。
		// vscode.window.createTextEditorDecorationType(vscode.DecorationRenderOptions)の実行は一度しか行えないと思われる。

		const regExSpace = /\u3000/g;
		const text = activeEditor.document.getText();
		const zenkakuChars = [];

		let match;
		while (match = regExSpace.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos) };
			//このpushは配列へのpush。(末尾に追加)。操作対象のテキストの座標を集めている。
			zenkakuChars.push(decoration);
		}
		//エディタの書式設定関数へ、書式設定マネージャーと、対象のテキスト情報を出力する。
		//操作対象のテキストの座標と、行う書式設定操作を引数として渡す。
		activeEditor.setDecorations(decoTypeForZenkaku, zenkakuChars);
	}
}


/**
 * settingに記述した書式設定を取得する
 * @returns 取得した書式設定
 */
export function getSettings(): vscode.DecorationRenderOptions {
	return {
		borderWidth: vscode.workspace.getConfiguration("flexibleZenkaku").get("borderWidth") + 'px',
		borderRadius: vscode.workspace.getConfiguration("flexibleZenkaku").get("borderRadius") + 'px',
		borderStyle: (String)(vscode.workspace.getConfiguration("flexibleZenkaku").get("borderStyle")).toString(),
		light: {
			backgroundColor: vscode.workspace.getConfiguration("flexibleZenkaku").get("light_backgroundColor"),
			borderColor: vscode.workspace.getConfiguration("flexibleZenkaku").get("light_borderColor")
		},
		dark: {
			backgroundColor: vscode.workspace.getConfiguration("flexibleZenkaku").get("dark_backgroundColor"),
			borderColor: vscode.workspace.getConfiguration("flexibleZenkaku").get("dark_borderColor")
		}
	};
}

/**
 * 設定を取得しdecoTypeOptを最新に更新する。
 * 更新したら、その書式設定を持つ書式設定マネージャー「decoTypeForZenkaku」も併せて再生成する。
 * @param decoTypeOpt decoTypeForZenkakuに適用する書式
 */
export function reloadColorSetting(decoTypeOpt: vscode.DecorationRenderOptions) {

		let setting = getSettings();
		if (isSameSetting(decoTypeOpt, setting)) {
			//現在の設定と変化ないときは処理なし
		} else {
			decoTypeOpt = setting;
			decoTypeForZenkaku.dispose();
			decoTypeForZenkaku = vscode.window.createTextEditorDecorationType(decoTypeOpt);
		}
}


/**
 * 設定を比較する。
 * @param deco1 変更前の設定内容
 * @param deco2 変更後の設定内容
 * @returns true:前後は同じ設定。false:前後が異なる設定
 */
export function isSameSetting(deco1: vscode.DecorationRenderOptions, deco2: vscode.DecorationRenderOptions): boolean {

	let result: boolean = true;

	if (deco1.borderWidth === deco2.borderWidth) { } else { result = false; }
	if (deco1.borderRadius === deco2.borderRadius) { } else { result = false; }
	if (deco1.borderStyle === deco2.borderStyle) { } else { result = false; }
	if ((deco1.light && deco1.light.backgroundColor) === (deco2.light && deco2.light.backgroundColor)) { } else { result = false; }
	if ((deco1.light && deco1.light.borderColor) === (deco2.light && deco2.light.borderColor)) { } else { result = false; }
	if ((deco1.dark && deco1.dark.backgroundColor) === (deco2.dark && deco2.dark.backgroundColor)) { } else { result = false; }
	if ((deco1.dark && deco1.dark.borderColor) === (deco2.dark && deco2.dark.borderColor)) { } else { result = false; }

	return result;
}