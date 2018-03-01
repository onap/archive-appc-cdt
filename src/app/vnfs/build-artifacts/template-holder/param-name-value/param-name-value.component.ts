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

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================
*/

import { Component, ContentChildren, OnInit, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingEditorService } from '../../../../shared/services/mapping-editor.service';
import { HttpUtilService } from '../../../../shared/services/httpUtil/http-util.service';
import { GoldenConfigurationComponent } from '../template-configuration/template-configuration.component';
import { ArtifactRequest } from '../../../../shared/models/index';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';
import { saveAs } from 'file-saver';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from '../../../../shared/confirmModal/confirm.component';
import { BuildDesignComponent } from '../../build-artifacts.component';
import { ParamShareService } from '../../../../shared/services/paramShare.service';
import { NotificationsService } from 'angular2-notifications';
import { Tab } from './tab';
import { environment } from '../../../../../environments/environment';
import { NgProgress } from 'ngx-progressbar';
import * as XLSX from 'xlsx';

type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

declare var $: any;

@Component({
    selector: 'app-golden-configuration-mapping',
    templateUrl: './param-name-value.component.html',
    styleUrls: ['./param-name-value.component.css']
})
export class GoldenConfigurationMappingComponent implements OnInit {
    enableMappingSave: boolean = false;
    aceText: string = '';
    fileName: string = '';
    actionType: any;
    modal: any;
    configMappingEditorContent: any;
    fileType: any = '';
    myfileName: any;
    initialData: any;
    scopeName: any;
    downloadedFileName: any;
    enableSaveToAppc: boolean = false;
    versionNo: any = '0.0.1';
    showVersionDiv: boolean = false;
    initialAction: any;
    title: any;
    message: any;
    enableMappingBrowse: boolean = true;
    enableDownload: boolean = false;
    showMappingDownloadDiv: boolean = false;
    mapppingDownloadType: any;
    action: any;
    artifactName: any;
    enableMerge: boolean = false;
    apiToken = localStorage['apiToken'];
    userId = localStorage['userId'];
    public uploadTypes = [
        {
            value: 'Mapping Data',
            display: 'Sample Json Param File'
        }
    ];
    selectedUploadType: string = this.uploadTypes[0].value;
    options = {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };
    artifactRequest: ArtifactRequest = new ArtifactRequest();
    @ViewChild(GoldenConfigurationComponent) mappingComponent: GoldenConfigurationComponent;
    @ViewChild('templateeditor') templateeditor;
    @ViewChild('myInputParam') myInputParam: any;
    @ViewChild(ModalComponent) modalComponent: ModalComponent;
    @ContentChildren(Tab) tabs: QueryList<Tab>;
    public subscription: any;
    public item: any = {};

    public Actions = [
        { action: 'ConfigBackup', value: 'ConfigBackup' },
        { action: 'ConfigModify', value: 'ConfigModify' },
        { action: 'ConfigRestore', value: 'ConfigRestore' },
        { action: 'Configure', value: 'Configure' },
        { action: 'GetRunningConfig', value: 'GetRunningConfig' },
        { action: 'HealthCheck', value: 'HealthCheck' },
        { action: 'StartApplication', value: 'StartApplication' },
        { action: 'StopApplication', value: 'StopApplication' }
    ];
    vnfType: any;
    vnfcType: any;
    protocol: any;
    refObj: any;
    public paramsContent = localStorage['paramsContent'];

    constructor (private buildDesignComponent: BuildDesignComponent, private paramShareService: ParamShareService, private router: Router, private httpUtil: HttpUtilService, private dialogService: DialogService, private activeRoutes: ActivatedRoute, private mappingEditorService: MappingEditorService, private notificationService: NotificationService, private nService: NotificationsService, private ngProgress: NgProgress) {
        this.artifactRequest.action = '';
        this.artifactRequest.version = '';
        this.artifactRequest.paramKeysContent = '';
    }

    ngOnInit() {
        var refObj = this.refObj = this.prepareFileName();
        if (refObj && refObj != undefined) {
            if (this.paramsContent && this.paramsContent != undefined && this.paramsContent !== '{}') {
                this.artifactRequest.paramsContent = this.formatNameValuePairs(this.paramsContent);
                // this.artifactRequest.paramsContent = this.paramsContent;

            }
            else {
                this.artifactRequest.paramsContent = '{}';
            }

            //  refObj = refObj[refObj.length - 1];
            this.item = refObj;
            this.vnfType = this.item.scope['vnf-type'];
            this.vnfcType = this.item.scope['vnfc-type'];
            this.protocol = this.item['device-protocol'];
            this.action = this.item.action;
            var artifactList = this.item['artifact-list'];
            for (var i = 0; i < artifactList.length; i++) {
                var artifactName = artifactList[i]['artifact-name'];
                var array = artifactName.split('_');
                if (array[0].toUpperCase() === 'TEMPLATE') {
                    this.artifactName = artifactName;
                }
            }
        }
        else {
            this.item = {
                'action': '',
                'scope': { 'vnf-type': '', 'vnfc-type': '' },
                'vm': [],
                'protocol': '',
                'download-dg-reference': '',
                'user-name': '',
                'port-number': '',
                'artifact-list': [],
                'deviceTemplate': '',
                'scopeType': ''
            };
        }
        this.initialAction = this.item.action;
        this.activeRoutes.url.subscribe(UrlSegment => {
            this.actionType = UrlSegment[0].path;
        });
        if (this.actionType === 'configureTemplate') {
            this.mappingEditorService.fromScreen = 'TemplateScreen';
        }
        if (this.actionType === 'myTemplates') {
            this.mappingEditorService.fromScreen = 'MappingScreen';
        }
        this.mappingEditorService.paramData = [];


    }

    //========================== End of ngOnInit() Method============================================
    browseOption() {
        $('#filesparam').trigger('click');
    }

    //========================== End of browseOption() Method============================================
    selectedNavItem(item: any) {
        this.item = item;
    }

    //========================== End of selectedNavItem() Method============================================
    ngOnDestroy() {
        this.prepareFileName();
    }

    //========================== End of ngOnDestroy() Method============================================
    ngAfterViewInit() {
        if (this.mappingEditorService.fromScreen === 'MappingScreen') {
            this.configMappingEditorContent = this.mappingEditorService.getTemplateMappingDataFromStore();
            this.fileType = sessionStorage.getItem('fileType');
            if (this.configMappingEditorContent)
                this.mappingEditorService.initialise(this.mappingComponent.templateeditor.getEditor(), this.configMappingEditorContent, this.modal);
        }
        if (this.refObj) {

            this.artifactRequest.action = this.item.action;
            this.artifactRequest.vnfType = this.vnfType;
            if (this.vnfcType && this.vnfcType.length != 0) {
                this.scopeName = this.vnfcType;
            }
            else {
                this.scopeName = this.vnfType;
            }
        }
        else {
            this.Actions = [];
            this.enableMappingBrowse = false;
        }
    }

    //========================== End of ngAfterViewInit() Method============================================
    upload(evt: any) {
        /* wire up file reader */
        if (evt.target.files[0]) {
            const target: DataTransfer = <DataTransfer>(evt.target);
            this.myfileName = evt.target.files[0].name;
            var fileExtension = this.myfileName.substr(this.myfileName.lastIndexOf('.') + 1);
            if (fileExtension.toUpperCase() === 'xls'.toUpperCase()) {
                if (target.files.length != 1) {
                    throw new Error('Cannot upload multiple files on the entry');
                }
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    /* read workbook */
                    const bstr = e.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    /* grab first sheet */
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    /* save data */
                    let arrData = (<AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 })));
                    var jsonStr = arrData.toString();
                    var JsonArr = jsonStr.split(',');
                    var finalStr = '{\r\n';
                    for (var i = 0; i < JsonArr.length; i = i + 2) {
                        var key = JsonArr[i];
                        var value = JsonArr[i + 1];
                        finalStr = finalStr + key + ':' + value + ',\r\n';
                    }
                    finalStr = finalStr.substring(0, finalStr.length - 3) + '\r\n}';
                    this.artifactRequest.paramsContent = finalStr;
                    this.initialData = finalStr;
                    this.enableMappingSave = true;
                };
                reader.readAsBinaryString(target.files[0]);
                if ('Mapping Data' === this.selectedUploadType) {
                    this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
                    this.mappingEditorService.setParamContent(this.artifactRequest.paramsContent);
                }
            }
            else {
                let reader = new FileReader();
                this.readFile(evt.target.files[0], reader, (result) => {
                    if ('Mapping Data' === this.selectedUploadType) {
                        var jsonObject = JSON.parse(result);
                        this.artifactRequest.paramsContent = JSON.stringify(jsonObject, null, 1);
                        this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
                        this.mappingEditorService.setParamContent(this.artifactRequest.paramsContent);
                    }
                    this.initialData = result;
                    this.enableMappingSave = true;
                });
            }
        }
        else {
            this.notificationService.notifyErrorMessage('Failed to reading file..');
        }
        this.myInputParam.nativeElement.value = '';
    }

    //========================== End of upload() Method============================================
    //uncommenting for 1710
    public fileParamChange(input) {
        if (input.files && input.files[0]) {
            this.enableMappingSave = true;
            this.myfileName = input.files[0].name;
            var fileExtension = this.myfileName.substr(this.myfileName.lastIndexOf('.') + 1);
            if (this.validateUploadedFile(fileExtension)) {
                // Create the file reader
                let reader = new FileReader();
                this.readFile(input.files[0], reader, (result) => {
                    if ('Mapping Data' === this.selectedUploadType) {
                        var jsonObject = JSON.parse(result);
                        this.artifactRequest.paramsContent = JSON.stringify(jsonObject, null, 1);
                        this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
                        this.mappingEditorService.setParamContent(this.artifactRequest.paramsContent);
                        localStorage['paramsContent'] = this.artifactRequest.paramsContent;
                    }
                    this.enableMerge = true;
                    this.initialData = result;
                });
            }
            else {
                this.nService.error("Error", "Incorrect File Format")
                this.artifactRequest.paramsContent = ''
            }
        }
        else {
            this.nService.error("Error", "Failed to read file");
        }
        this.myInputParam.nativeElement.value = '';
    }

    //========================== End of fileParamChange() Method============================================
    validateUploadedFile(fileExtension) {

        if (fileExtension.toUpperCase() === 'json'.toUpperCase()) {
            return true;
        }
        else {
            return false;
        }

    }
    //========================== End of validateUploadedFile() Method============================================
    public readFile(file, reader, callback) {
        // Set a callback funtion to fire after the file is fully loaded
        reader.onload = () => {
            // callback with the results
            callback(reader.result);
        };
        this.notificationService.notifySuccessMessage('Uploading File ' + file.name + ':' + file.type + ':' + file.size);
        // Read the file
        reader.readAsText(file, 'UTF-8');
    }

    //========================== End of readFile() Method============================================
    public onParamChanges(data) {
        this.artifactRequest.paramsContent = data;
        localStorage['paramsContent'] = this.artifactRequest.paramsContent;
    }

    //========================== End of onParamChanges() Method============================================
    onDownloadParameter() {
        let refObj = this.refObj;
        if (refObj) {
            // refObj = refObj[refObj.length - 1];
            let paramsKeyValueFromEditor: JSON;
            this.initialData = this.artifactRequest.paramsContent;
            paramsKeyValueFromEditor = JSON.parse(this.artifactRequest.paramsContent);
            let theJSON = JSON.stringify(paramsKeyValueFromEditor, null, '\t');
            var blob = new Blob([theJSON], {
                type: 'text/json'
            });
            this.showVersionDiv = true;
            let fileName: any;
            fileName = this.updateFileName(refObj.action, this.scopeName, this.versionNo);
            saveAs(blob, fileName);
        }
        else {
            this.nService.error('Error', 'Please enter Action and VNF type in Reference Data screen');

        }
    }

    //========================== End of onDownloadParameter() Method============================================
    JSONToCSVConvertor(JSONData, fileName, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        var CSV = '';
        //This condition will generate the Label/Header
        if (ShowLabel) {
            var testRow = '';
            for (var index in arrData[0]) {
                CSV += index + '\t' + arrData[0][index] + '\r\n';
            }
        }
        if (CSV == '') {
            return;
        }
        //Initialize file format you want csv or xls
        var uri = 'data:application/vnd.ms-excel,' + encodeURI(CSV);
        var link = document.createElement('a');
        link.href = uri;
        link.download = fileName + '.xls';
        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    //========================== End of JSONToCSVConvertor() Method============================================
    updateFileNameForXls(action: any, scopeName: any, versionNo: any) {
        let fileName = 'param_' + action + '_' + scopeName + '_' + versionNo + 'V';
        return fileName;
    }

    //========================== End of updateFileNameForXls() Method============================================
    appendSlashes(artifactData) {
        let x = artifactData.replace(new RegExp(',"', 'g'), ',\"');
        let y = x.replace(new RegExp('":', 'g'), '\":');
        let z = y.replace(new RegExp('{"', 'g'), '{\"');
        let t = z.replace(new RegExp(':"', 'g'), ':\"');
        let m = t.replace(new RegExp('",', 'g'), '\",');
        let n = y.replace(new RegExp('"}', 'g'), '\"}');
        let nw = n.replace(new RegExp('{"', 'g'), '{\"');
        let nw1 = nw.replace(new RegExp(':"', 'g'), ':\"');
        let nw2 = nw1.replace(new RegExp('",', 'g'), '\",');
        return nw2;
    }

    //========================== End of appendSlashes() Method============================================
    updateFileName(action: any, scopeName: any, versionNo: any) {
        let fileName = 'param_' + action + '_' + scopeName + '_' + versionNo + 'V.json';
        this.downloadedFileName = fileName;
        return fileName;
    }

    //========================== End of updateFileName() Method============================================
    prepareFileName(): any {
        let fileNameObject: any = this.mappingEditorService.latestAction;
        return fileNameObject;
    }

    //========================== End of prepareFileName() Method============================================
    openModel(toShow: any, message: any, title: any) {
        this.message = message;
        this.title = title;
        $('#modalButton').trigger('click');
    }

    //========================== End of openModel() Method============================================
    checkSave(selectedAction): void {
        if (this.actionType === 'updateTemplate') {
            if (!this.buildDesignComponent.isReferenceFound(selectedAction, this.mappingEditorService.getReferenceList())) {
                this.nService.error('Error', 'Reference Data not found. Please add Reference Data for Action:' + selectedAction);
            }
        }
        if (this.initialData != this.artifactRequest.paramsContent) {
            this.showConfirm(this.initialData);
        }
        else {
            this.initialAction = this.item.action;
        }
    }

    //========================== End of checkSave() Method============================================
    showConfirm(initialData) {
        let disposable = this.dialogService.addDialog(ConfirmComponent, {
            title: 'Confirm title',
            message: 'Confirm message'
        })
            .subscribe((isConfirmed) => {
                //We get dialog result
                if (isConfirmed) {
                    this.artifactRequest.paramsContent = initialData;
                    this.initialAction = this.item.action;
                }
                else {
                    this.item.action = this.initialAction;
                }
            });
    }

    //========================== End of showConfirm() Method============================================
    retrieveNameValueFromAppc() {
        let refObj = this.refObj;
        if (refObj && refObj != undefined) {
            // console.log("REF OBJECT IN RETRIVE"+JSON.stringify(refObj));
            this.enableMerge = true;
            var scopeName = this.scopeName.replace(/ /g, '').replace(new RegExp('/', "g"), '_').replace(/ /g, '');
            let fileName = this.updateFileName(this.item.action, scopeName, this.versionNo);
            let payload = '{"userID": "' + this.userId + '", "action": "' + this.item.action + '", "vnf-type" : "' + this.vnfType + '", "artifact-type":"APPC-CONFIG", "artifact-name":"' + fileName + '"}';
            // console.log("payload OBJECT IN RETRIVE"+JSON.stringify(payload));
            let input = {
                'input': {
                    'design-request': {
                        'request-id': this.apiToken,
                        'action': 'getArtifact',
                        'payload': payload
                    }
                }
            };

            console.log('Retrieve name value from appc payload===>>' + payload);
            let artifactContent: any;
            this.ngProgress.start();
            this.httpUtil.post({
                url: environment.getDesigns,
                data: input
            }).subscribe(resp => {
                if (resp.output.status.code === '400' && resp.output.status.message === 'success') {
                    this.nService.success('Success', 'Name/value pairs retrieved successfully from APPC');
                    this.enableMerge = true;
                    let result = JSON.parse(resp.output.data.block).artifactInfo[0];
                    result = result['artifact-content'];
                    var string = result.substring(2, result.length - 2);
                    var stringArr = string.split(',');
                    var newStringArr = [];
                    var resultStr = '{\r\n';
                    for (var index in stringArr) {
                        newStringArr[index] = stringArr[index] + ',\r\n';
                    }
                    for (var index in newStringArr) {
                        resultStr = resultStr + newStringArr[index];
                    }
                    resultStr = resultStr.substring(0, resultStr.length - 3) + '\r\n}';
                    this.artifactRequest.paramsContent = resultStr;
                    this.mappingEditorService.setParamContent(resultStr);
                    localStorage['paramsContent'] = resultStr;
                    this.enableMappingSave = true;
                }
                else {
                    this.nService.info('Information', 'There are no name value pairs saved in APPC for the selected action!');
                }
                this.ngProgress.done();
            },
                error => this.nService.error('Error', 'Error in connecting to APPC Server'));
        }
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    //========================== End of retrieveNameValueFromAppc() Method============================================
    saveNameValueToAppc() {
        let refObj = this.refObj;
        if (refObj && refObj != undefined) {
            // refObj = refObj[refObj.length - 1];
            let paramsKeyValueFromEditor = JSON.parse(this.artifactRequest.paramsContent);
            let action = this.item.action;
            let fileName = this.updateFileName(refObj.action, this.scopeName, this.versionNo);
            let vnfType = this.vnfType;
            let Json = [paramsKeyValueFromEditor];
            let slashedPayload = this.appendSlashes(JSON.stringify(Json));
            let newPayload =
                {
                    'userID': this.userId,
                    'vnf-type': this.vnfType,
                    'action': action,
                    'artifact-name': fileName,
                    'artifact-type': 'APPC-CONFIG',
                    'artifact-version': this.versionNo,
                    'artifact-contents': slashedPayload
                };
            let data =
                {
                    'input': {
                        'design-request': {
                            'request-id': this.apiToken,
                            'action': 'uploadArtifact',
                            'payload': JSON.stringify(newPayload)
                        }
                    }
                };
            this
                .httpUtil
                .post(
                { url: environment.getDesigns, data: data })
                .subscribe(resp => {
                    if (resp.output.status.code === '400' && resp.output.status.message === 'success') {
                        this.nService.success('Success', 'Name/value pairs saved successfully to APPC');
                    }
                    if (resp.output.status.code === '401') {
                        this.nService.error('Error', resp.output.status.message);
                    }
                },
                error => this.nService.error('Error', 'Could not save name value pairs. Error in connecting APPC Server'));
        }
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    //========================== End of saveNameValueToAppc() Method============================================
    formatNameValuePairs(namevaluePairs: string) {
        //var string = namevaluePairs.substring(2, namevaluePairs.length - 2);
        /*  var stringArr = string.split(",");
          var newStringArr = [];
          var resultStr = "{\r\n\"";
          for (var index in stringArr) {
            newStringArr[index] = stringArr[index] + ",\r\n";
          }
          for (var index in newStringArr) {
            resultStr = resultStr + newStringArr[index];
          }
          resultStr = resultStr.substring(0, resultStr.length - 3) + "\"\r\n}"
          return resultStr;*/

        var string = namevaluePairs.substring(1, namevaluePairs.length - 1);
        var stringArr = string.split(',');
        var newStringArr = [];
        var resultStr = '{\r\n';
        for (var index in stringArr) {
            newStringArr[index] = stringArr[index] + ',\r\n';
        }
        for (var index in newStringArr) {
            resultStr = resultStr + newStringArr[index];
        }
        resultStr = resultStr.substring(0, resultStr.length - 3) + '\r\n}';
        return resultStr;
    }

    //========================== End of formatNameValuePairs() Method============================================

    public syncParam() {
        var paramNameValuesStr = localStorage['paramsContent'];
        var pdData = this.paramShareService.getSessionParamData();
        var paramNameValues = [];
        var pdDataArrayForParamShare = [];
        var pdDataArrayForSession = [];
        try {
            paramNameValues = JSON.parse(paramNameValuesStr);
            console.log('Param Name values array==' + JSON.stringify(paramNameValues));
            if (paramNameValues && paramNameValues != undefined) {
                for (var index in paramNameValues) {
                    var json = {
                        'paramName': index,
                        'paramValue': paramNameValues[index]
                    };
                    pdDataArrayForParamShare.push(json);

                    pdDataArrayForSession.push({
                        'name': index,
                        'type': null,
                        'description': null,
                        'required': null,
                        'default': null,
                        'source': 'Manual',
                        'rule-type': null,
                        'request-keys': [{
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }],
                        'response-keys': [{
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }, {
                            'key-name': null,
                            'key-value': null
                        }],
                        'ruleTypeValues': [null]

                    });

                }
                this.paramShareService.setTemplateData(pdDataArrayForParamShare);

                if (pdData && pdData != undefined) {
                    for (var i = 0; i < pdDataArrayForSession.length; i++) {

                        pdData.forEach(function (arr2item) {
                            if (pdDataArrayForSession[i].name === arr2item.name) {

                                var json = {
                                    'name': arr2item.name,
                                    'type': arr2item.type,
                                    'description': arr2item.description,
                                    'required': arr2item.required,
                                    'default': arr2item.default,
                                    'source': arr2item.source,
                                    'rule-type': arr2item['rule-type'],
                                    'request-keys': arr2item['request-keys'],
                                    'response-keys': arr2item['response-keys'],
                                    'ruleTypeValues': arr2item.ruleTypeValues
                                };
                                pdDataArrayForSession.splice(i, 1, json);
                                //  console.log("Result array index ==" + JSON.stringify(resultArr[i]))
                            }

                        });

                    }
                }

                this.paramShareService.setSessionParamData(pdDataArrayForSession);

                this.router.navigate(['../../../vnfs/design/parameterDefinitions/create']);

            }
        }
        catch (error) {
            console.log('Error occured in syncing param names' + JSON.stringify(error));
            this.nService.error('Error', 'Error synchronising with name values. Please check the format of json uploaded/ retrieved');
        }
    }

}