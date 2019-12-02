'use strict';
import * as mocha from 'mocha';
import * as chai from 'chai';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtention from '../../extension';

describe('Extension Test Suite', () => {
	
	before(() => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	//仮のテキストとエディターを準備(実際にテキストファイルがあるわけではない。)
	beforeEach(async () => {
		const uri = vscode.Uri.parse("untitled:virtualtext.txt");
		await vscode.window.showTextDocument(uri);
	});

	describe('isSameSetting テストセット', ()=>{
		
		it('同じ内容の`vscode.DecorationRenderOptions`のときはtrueを返す。',()=>{
			let decoBase: vscode.DecorationRenderOptions = {
				borderWidth : '1px',
				borderRadius : '1px',
				borderStyle : 'solid',
				light:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				},
				dark:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				}
			};
			let decoSame: vscode.DecorationRenderOptions = {
				borderWidth : '1px',
				borderRadius : '1px',
				borderStyle : 'solid',
				light:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				},
				dark:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				}
			};
			chai.assert.equal(myExtention.isSameSetting(decoBase,decoSame),true);
		});

		it('異なる内容の`vscode.DecorationRenderOptions`のときはtrueを返す。',()=>{
			let decoBase: vscode.DecorationRenderOptions = {
				borderWidth : '1px',
				borderRadius : '1px',
				borderStyle : 'solid',
				light:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				},
				dark:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				}
			};
			let decoDiff: vscode.DecorationRenderOptions = {
				borderWidth : '2px',
				borderRadius : '1px',
				borderStyle : 'solid',
				light:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				},
				dark:{
					backgroundColor : '#00112233',
					borderColor : '#00112233'
				}
			};
			chai.assert.equal(myExtention.isSameSetting(decoBase,decoDiff),false);
		});

	});

	describe('reloadColorSetting テストセット(グローバル変数を使うため、処理が特殊))', ()=>{

		let bfrOpt:vscode.DecorationRenderOptions = {};
		let bfrDecoType:any = {};

		beforeEach('decoTypeForZenkakuの更新が検出できるようにバックアップする',()=>{
			bfrOpt = Object.create(myExtention.decoTypeOpt);
			bfrDecoType = Object.create(myExtention.decoTypeForZenkaku);
		});

		it('設定の更新がなければ「decoTypeForZenkaku」に変化なし',()=>{
			myExtention.reloadColorSetting(bfrOpt);
			chai.expect(myExtention.decoTypeForZenkaku).deep.equal(bfrDecoType);
		});

		it('設定の更新があれば、その書式設定を持つ書式設定マネージャー「decoTypeForZenkaku」も併せて再生成する',()=>{
			let afrOpt : vscode.DecorationRenderOptions = Object.create(bfrOpt);
			afrOpt.borderWidth = '100px';
			myExtention.reloadColorSetting(afrOpt);
			chai.expect(myExtention.decoTypeForZenkaku).not.deep.equal(bfrDecoType);
			//このディープコピーで十分かは未検証だが、一応「not」を抜くとfailedにはなるので、これでいく。
		});
		
	});

	describe('getSettings テストセット', ()=>{

		it('本拡張機能に必要な設定をsettings.jsonから取得する',()=>{
			let settings = myExtention.getSettings();
			let forAssertSet = {
				borderWidth : '',
				borderRadius : '',
				borderStyle : '',
				light : {
					backgroundColor : '',
					borderColor : ''
				},
				dark : {
					backgroundColor : '',
					borderColor : ''
				}
			};

			chai.expect(settings).to.have.keys(forAssertSet);
			chai.expect(settings.light).to.have.keys(forAssertSet.light);
			chai.expect(settings.dark).to.have.keys(forAssertSet.dark);
		});

	});

	//テスト開始前に準備した仮のテキストとエディターを開放
	afterEach(async () => {
		const commandName = "workbench.action.closeAllEditors";
		await vscode.commands.executeCommand(commandName);
	});
	
});