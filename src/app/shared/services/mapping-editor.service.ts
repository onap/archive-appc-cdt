/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.
===================================================================

Unless otherwise specified, all software contained herein is licensed
under the Apache License, Version 2.0 (the License);
you may not use this software except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

============LICENSE_END============================================
*/


import {Injectable} from '@angular/core';
import {ConfigMapping} from '../models/index';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/share';


@Injectable()
export class MappingEditorService {

    editor: any;
    session: any;
    editorContent: string;
    configMappings: Array<ConfigMapping> = [];
    paramContent: string = '{}';

    KEY_EXPRESSION: string = '\\${\\(.+?\\)}';//new RegExp('${.+?}'); // \${.+?}
    KEY_START: string = '${(';
    KEY_MID: string = ')=(';
    KEY_END: string = ')}';
    KEY_START_LENGTH: number = 3;
    KEY_MID_LENGTH: number = 3;
    KEY_END_LENGTH: number = 2;
    SYNC_T_KEY_EXPRESSION: string = '\\${.+?\\}';
    T_KEY_EXPRESSION: string = '\\${.+?}';//new RegExp('${.+?}'); // \${.+?}
    T_KEY_START: string = '${';
    T_KEY_END: string = '}';
    T_KEY_START_LENGTH: number = 2;
    T_KEY_END_LENGTH: number = 1;
    checkSpecialCharsReg: RegExp = /[^\w\s-_]/gi;
    public paramData = [];
    public referenceNameObjects: any;
    prmName: string = '';
    prmValue: string = '';
    navChange$: Observable<any>;
    public fromScreen: any = '';
    public storedTemplateData: any;
    public storedTemplateMappingData: any;
    public fileType: any;
    public hasErrorCode: boolean = false;
    public appDataObject: any;
    public downloadDataObject: any;
    public markedarr: any;
    public tempAllData: any;
    public latestAction: any;
    public selectedWord: any;
    identifier: any;
    private _navItem = {};
    private _observer: Observer<any>;
    private referenceList = [];

    constructor() {
        this.navChange$ = new Observable(observer =>
            this._observer = observer).share();
    }

    setSelectedWord(selectedWord: any) {
        this.selectedWord = selectedWord;
    }

    getSelectedWord() {
        return this.selectedWord;
    }

    changeNav(object) {
        this._navItem = object;
        this.referenceNameObjects = object;
    }

    changeNavAppData(object) {
        this._navItem = object;
        this.appDataObject = object;
    }

    changeNavDownloadData(object) {
        this._navItem = object;
        this.downloadDataObject = object;
    }

    saveLatestAction(data) {
        this.latestAction = data;
    }

    saveLatestIdentifier(identifier) {
        this.identifier = identifier;
    }

    public getParamContent() {
        return this.paramContent;
    }

    saveTempAllData(data) {
        this.tempAllData = data;
    }

    navItem() {
        return this._navItem;
    }

    public setParamContent(paramContent: string): void {
        this.paramContent = paramContent;
        
    }

    public initialise(editor: any, editorContent: string, modal: any): void {
        this.editor = editor;
        this.editor.session = editor.session;
        this.editor.selection.session.$backMarkers = {};
        this.editorContent = editorContent;
        this.editor.$blockScrolling = Infinity;
        this.editor.$blockSelectEnabled = false;
        this.initialiseCommands(modal);
        this.editor.setValue(this.editorContent);
        this.refreshEditor();
    }


    public initialiseCommands(modal): void {
        this.editor.commands.addCommand({
            name: 'keyCompletionCommand',
            bindKey: {win: 'Ctrl-s', mac: 'Command-s'},
            exec: (editor: any) => {
                this.handlekeyCompletion();
            }
        });

        this.editor.commands.addCommand({
            name: 'autoAnnotateCommand',
            bindKey: {win: 'Ctrl-2', mac: 'Command-2'},
            exec: (editor: any) => {
                this.autoAnnotateDataForParams();
            }
        });

        this.editor.commands.addCommand({
            name: 'autoAnnotateCommand',
            bindKey: {win: 'Ctrl-shift-z', mac: 'Command-shift-z'},
            exec: (editor: any) => {
                this.removeTheSelectedMarkers();
            }
        });
    }

    public getStartBeforeAfterSelection(selection: any, beforeCount: number, afterCount: number) {
        let newSelctionRange: any = JSON.parse(JSON.stringify(selection));
        if (selection) {
            let newBeforeColumn: number = selection.start.column - beforeCount;
            let newAfterColumn: number = selection.end.column + afterCount;
            newSelctionRange.start.column = newBeforeColumn;
            newSelctionRange.end.column = newAfterColumn;
        }
        return newSelctionRange;
    }

    public checkToDataAdd(value: string): boolean {
        let toAdd = false;
        if (value && (value.startsWith('"') || value.startsWith('>'))
            && (value.endsWith('"') || value.endsWith('<'))
            && !value.startsWith('"${')
        ) {
            toAdd = true;
        }
        return toAdd;
    }

    public autoAnnotateDataForParams(): boolean {
        this.paramContent = localStorage['paramsContent'];
        var mergeStatus: boolean = false;
        if (this.paramContent) {
            var paramJson: JSON = JSON.parse(this.paramContent);
            for (var prop in paramJson) {
                let value: string = paramJson[prop];
                if (value) {
                    var occurances = this.editor.findAll(value, {regExp: false});
                    var ranges = this.editor.getSelection().getAllRanges();
                    if (ranges && occurances && occurances > 0) {

                        for (var r = 0; r < ranges.length; r++) {
                            let selectedRange: any = ranges[r];
                            let selectedWord: string = this.editor.session.getTextRange(selectedRange);
                            let prefixSuffixselectedWord: string = this.editor.session.getTextRange(this.getStartBeforeAfterSelection(selectedRange, 1, 1));
                            if (selectedWord && this.checkComments(selectedRange) && this.checkDelimiters(selectedRange) && this.checkApplied(selectedRange)) {
                                let replaceWord: any = this.KEY_START + selectedWord + this.KEY_MID + prop + this.KEY_END;
                                this.editor.session.replace(selectedRange, replaceWord);
                                mergeStatus = true;
                            }
                        }
                    }
                }
            }
        }
        return mergeStatus;
    }

    checkComments(selectedRange: any) {
        var tempStartColumn = selectedRange.start.column;
        var result = false;
        selectedRange.start.column = 0;
        if (this.editor.session.getTextRange(selectedRange).trim().startsWith('//')) {
            result = false;
        } else {
            result = true;
        }
        selectedRange.start.column = tempStartColumn;
        return result;
    }

    checkApplied(selectedRange: any) {
        var tempStartColumn = selectedRange.start.column;
        for (var i = selectedRange.start.column; i >= 0; i--) {
            selectedRange.start.column = i;
            if (this.editor.session.getTextRange(selectedRange).startsWith(this.KEY_START)
                || this.editor.session.getTextRange(selectedRange).startsWith(this.T_KEY_START)) {
                selectedRange.start.column = tempStartColumn;
                return false;
            } else if (this.editor.session.getTextRange(selectedRange).startsWith(this.KEY_END)
                || this.editor.session.getTextRange(selectedRange).startsWith(this.T_KEY_END)) {
                selectedRange.start.column = tempStartColumn;
                return true;
            }

        }
        selectedRange.start.column = tempStartColumn;
        return true;

    }

    checkDelimiters(selectedRange: any) {
        let result = false;
        let actualText = this.editor.session.getTextRange(selectedRange);
        var tempStartColumn = selectedRange.start.column;
        var tempEndcolumn = selectedRange.end.column;

        selectedRange.start.column = selectedRange.start.column - 1;
        selectedRange.end.column = selectedRange.end.column + 1;
        if ((this.editor.session.getTextRange(selectedRange).startsWith(' ')
                || this.editor.session.getTextRange(selectedRange).startsWith('"')
                || this.editor.session.getTextRange(selectedRange).startsWith('>'))
            && (this.editor.session.getTextRange(selectedRange).endsWith(' ')
                || this.editor.session.getTextRange(selectedRange).endsWith('"')
                || this.editor.session.getTextRange(selectedRange).endsWith(',')
                || this.editor.session.getTextRange(selectedRange).endsWith(actualText)
                || this.editor.session.getTextRange(selectedRange).endsWith('<'))) {
            result = true;
        }

        //Ignore the JSON key names(which ends with :)
        selectedRange.end.column = selectedRange.end.column + 1;
        if (this.editor.session.getTextRange(selectedRange).endsWith('":')) {
            result = false;
        } else {
            selectedRange.end.column = selectedRange.end.column + 1;
            if (this.editor.session.getTextRange(selectedRange).endsWith('" :')) {
                result = false;
            }
        }
        selectedRange.start.column = tempStartColumn;
        selectedRange.end.column = tempEndcolumn;
        return result;
    }

    checkAppliedForNamesOnly(selectedRange: any) {
        var tempStartColumn = selectedRange.start.column;
        for (var i = selectedRange.start.column; i >= 0; i--) {
            selectedRange.start.column = i;
            if (this.editor.session.getTextRange(selectedRange).startsWith(this.KEY_START)) {
                selectedRange.start.column = tempStartColumn;
                return false;
            } else if (this.editor.session.getTextRange(selectedRange).startsWith(this.KEY_END)) {
                selectedRange.start.column = tempStartColumn;
                return true;
            }

        }
        selectedRange.start.column = tempStartColumn;
        return true;

    }

    checkToDataAddForJson(value: string): boolean {
        let toAdd = false;
        if (value && !value.startsWith('"${') && !value.startsWith('(')) {
            toAdd = true;
        }
        return toAdd;
    }

    public autoAnnotateTemplateForParam(): void {
        var occurances = this.editor.findAll(this.T_KEY_EXPRESSION, {regExp: true});
        var ranges = this.editor.getSelection().getAllRanges();
        if (ranges) {
            for (var r = 0; r < ranges.length; r++) {
                let selectedRange: any = ranges[r];
                let selectedWord: string = this.editor.session.getTextRange(selectedRange);
                if (selectedWord) {
                    let key: string = selectedWord.substring(this.T_KEY_START_LENGTH, selectedWord.lastIndexOf(this.T_KEY_END));
                    let value: string = this.getValueForKey(key);
                    let replaceWord: any = this.KEY_START + value + this.KEY_MID + key + this.KEY_END;
                    this.editor.session.replace(selectedRange, replaceWord);
                }
            }
        }

    }

    /*
     * Once you save command is triggered, We need to re populate all the params, which may be defined new
     * and auto populate the key if any of the values maps to the keys
     */
    public handlekeyCompletion(): void {
        this.refreshEditor();
    }

    public checkMethodCall(modal): void {
    //this.handleAnnotation(modal)
    }

    public refreshEditor(): void {
        if (this.editor) {

            var occurances = this.editor.findAll(this.KEY_EXPRESSION, {regExp: true});
            var ranges = this.editor.getSelection().getAllRanges();
            if (ranges) {
                this.refreshParams(ranges);
            }

            occurances = this.editor.findAll(this.KEY_EXPRESSION, {regExp: true});
            ranges = this.editor.getSelection().getAllRanges();
            if (ranges) {
                this.populateMissingKeys(ranges);
            }
            this.refreshMarker();
        }
        
    }

    replaceNamesWithBlankValues() {
        var occurances = this.editor.findAll(this.SYNC_T_KEY_EXPRESSION, {regExp: true});
        var ranges = this.editor.getSelection().getAllRanges();
        if (occurances > 0) {
            if (ranges) {
                for (var r = 0; r < ranges.length; r++) {
                    let selectedRange: any = ranges[r];
                    let selectedWord: string = this.editor.session.getTextRange(selectedRange);
                    let specialKeys = (selectedWord.substring(2, selectedWord.length - 1)).match(this.checkSpecialCharsReg);
                    if (selectedWord && this.checkAppliedForNamesOnly(selectedRange) && !specialKeys) {
                        let replaceWord: any = this.KEY_START + '' + this.KEY_MID + selectedWord.substring(2, selectedWord.length - 1) + this.KEY_END;
                        this.editor.session.replace(selectedRange, replaceWord);
                    }
                   
                }
            }
        }
    }

    public refreshParams(ranges: any): void {
        var paramData = [];
        if (this.paramContent === undefined) this.paramContent = '{}';
        if (this.editor && ranges) {
            var paramJson: JSON = JSON.parse(this.paramContent);
            this.hasErrorCode = false;
            for (var r = 0; r < ranges.length; r++) {
                let keyValue: string = this.editor.session.getTextRange(ranges[r]);
                if (keyValue && keyValue.startsWith(this.KEY_START) && keyValue.endsWith(this.KEY_END) && keyValue.includes(this.KEY_MID)) {
                    let key: string = keyValue.substring(keyValue.indexOf(this.KEY_MID) + this.KEY_MID_LENGTH, keyValue.indexOf(this.KEY_END));
                    let value: string = keyValue.substring(this.KEY_START_LENGTH, keyValue.indexOf(this.KEY_MID));
                    let specialKeys = key.match(this.checkSpecialCharsReg);
                    if (specialKeys && specialKeys.length) {
                      
                    } else {
                        if (this.fromScreen === 'TemplateScreen') {
                            if (key) {
                                paramJson[key] = value;
                                var obj: any = {'paramName': '', 'paramValue': ''};
                                obj.paramName = key;
                                obj.paramValue = value;
                                paramData.push(obj);
                            }

                        }
                        else if (this.fromScreen === 'MappingScreen') {
                            if (key) {
                                paramJson[key] = value;
                                var obj: any = {'paramName': '', 'paramValue': ''};
                                obj.paramName = key;
                                obj.paramValue = value;

                                paramData.push(obj);

                            }
                        }
                    }
                }
            }
            this.paramData = paramData;
            this.paramContent = JSON.stringify(paramJson);

        }
    }

    public populateMissingKeys(ranges: any): void {
        if (this.editor && ranges) {
            // Populate missing keys
            for (var r = 0; r < ranges.length; r++) {
                let keyValue: string = this.editor.session.getTextRange(ranges[r]);
                if (keyValue && keyValue.startsWith(this.KEY_START) && keyValue.endsWith(this.KEY_END) && keyValue.includes(this.KEY_MID)) {
                    let key: string = keyValue.substring(keyValue.indexOf(this.KEY_MID) + this.KEY_MID_LENGTH, keyValue.indexOf(this.KEY_END));
                    let value: string = keyValue.substring(this.KEY_START_LENGTH, keyValue.indexOf(this.KEY_MID));
                    if (!key && value) {
                        let keyFromStore = '';
                        if (keyFromStore) {
                            let replaceWord: string = '${(' + value + ')=(' + keyFromStore + ')}';
                            this.editor.session.replace(ranges[r], replaceWord);
                        }
                    }
                }
            }

        }
    }

    public refreshMarker(): void {
        if (this.editor) {
            this.hasErrorCode = false;
            var occurances = this.editor.findAll(this.KEY_EXPRESSION, {regExp: true});
            var ranges = this.editor.getSelection().getAllRanges();
            var keysList = [];
            // Populate missing keys
            for (var r = 0; r < ranges.length; r++) {
                let keyValue: string = this.editor.session.getTextRange(ranges[r]);
                if (keyValue && keyValue.startsWith(this.KEY_START) && keyValue.endsWith(this.KEY_END) && keyValue.includes(this.KEY_MID)) {
                    let key: string = keyValue.substring(keyValue.indexOf(this.KEY_MID) + this.KEY_MID_LENGTH, keyValue.indexOf(this.KEY_END));
                    let value: string = keyValue.substring(this.KEY_START_LENGTH, keyValue.indexOf(this.KEY_MID));
                    let specialKeys = key.match(this.checkSpecialCharsReg);
                    if (specialKeys && specialKeys.length) {
                        this.hasErrorCode = true;
                        break;
                    }
                    if (!key && value) {
                        this.editor.session.addMarker(ranges[r], 'warningMarker', 'text');
                    } else {
                        if (keysList.indexOf(key) > -1) {
                            this.editor.session.addMarker(ranges[r], 'warningMarker', 'text');
                        } else {
                            this.editor.session.addMarker(ranges[r], 'keyedMarker', 'text');
                        }
                        keysList.push(key);
                    }
                    // Refresh Markers
                }
            }
            this.editor.clearSelection();
            this.editor.exitMultiSelectMode();
        }
    }

    public getKeysForValues(value: string): string {
        var key: string = undefined;
        if (this.paramContent && value) {
            var paramJson: JSON = JSON.parse(this.paramContent);
            for (var prop in paramJson) {
                if (value === paramJson[prop]) {
                    key = prop;
                }
            }
        }
        return key;
    }

    public getValueForKey(key: string): string {
        var value: string = undefined;
        if (key) {
            var paramJson: JSON = JSON.parse(this.paramContent);
            if (paramJson) {
                value = paramJson[key];
            }
        }
        return value;
    }

    public generateTemplate(templateEditor: any): void {
        if (templateEditor) {
            templateEditor.setValue(this.editor.getValue());
            var occurances = templateEditor.findAll(this.KEY_EXPRESSION, {regExp: true});
            var ranges = templateEditor.getSelection().getAllRanges();
            if (ranges) {
                for (var r = 0; r < ranges.length; r++) {
                    let keyValue: string = templateEditor.session.getTextRange(ranges[r]);
                    if (keyValue && keyValue.startsWith(this.KEY_START) && keyValue.endsWith(this.KEY_END) && keyValue.includes(this.KEY_MID)) {
                        let key: string = keyValue.substring(keyValue.indexOf(this.KEY_MID) + this.KEY_MID_LENGTH, keyValue.indexOf(this.KEY_END));
                        let value: string = keyValue.substring(this.KEY_START_LENGTH, keyValue.indexOf(this.KEY_MID));
                        if (key && value) {
                            let replaceWord: string = '${' + key + '}';
                            templateEditor.session.replace(ranges[r], replaceWord);
                        }
                    }
                }
                templateEditor.clearSelection();
                templateEditor.exitMultiSelectMode();
                templateEditor.session.$backMarkers = {};

            }
        }
    }

    public generateParams(paramsEditor: any, paramsKeyValueEditor: any): JSON {
        if (paramsEditor && paramsKeyValueEditor) {
            var occurances = this.editor.findAll(this.KEY_EXPRESSION, {regExp: true});
            var ranges = this.editor.getSelection().getAllRanges();
            if (ranges) {
                let paramsJSON: JSON = JSON.parse('{}');
                for (var r = 0; r < ranges.length; r++) {
                    let keyValue: string = this.editor.session.getTextRange(ranges[r]);
                    if (keyValue && keyValue.startsWith(this.KEY_START) && keyValue.endsWith(this.KEY_END) && keyValue.includes(this.KEY_MID)) {
                        let key: string = keyValue.substring(keyValue.indexOf(this.KEY_MID) + this.KEY_MID_LENGTH, keyValue.indexOf(this.KEY_END));
                        let value: string = keyValue.substring(this.KEY_START_LENGTH, keyValue.indexOf(this.KEY_MID));
                        if (key) {
                            paramsJSON[key] = value;
                        }
                    }
                }

                var propertyContent = [];
                for (var prop in paramsJSON) {
                    propertyContent.push(prop + '=' + paramsJSON[prop]);
                }
                this.editor.clearSelection();
                this.editor.exitMultiSelectMode();
                return paramsJSON;
            }
        }
    }

    setTemplateDataForStore(templateData: any) {
        this.storedTemplateData = templateData;
    }

    getTemplateDataFromStore() {
        return this.storedTemplateData;
    }

    removeTheSelectedMarkers() {
        var arr: any = [];
        arr = this.markedarr;
        this.editor.selection.session.$backMarkers = {};
    }

    getsaveMarkers() {
        this.markedarr = [...this.editor.selection.session.$selectionMarkers];
    }

    getTemplateMappingDataFromStore() {
        return this.storedTemplateMappingData;
    }

    setTemplateMappingDataFromStore(templateMappingData: any) {
        this.storedTemplateMappingData = templateMappingData;
    }

    public setReferenceList(references) {
        this.referenceList = references;
    }

    public getReferenceList() {
        return this.referenceList;
    }


}