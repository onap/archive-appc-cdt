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

import * as XLSX from 'xlsx';
import * as _ from 'underscore';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BuildDesignComponent } from '../build-artifacts.component';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { Location } from '@angular/common';
import { MappingEditorService } from '../../..//shared/services/mapping-editor.service';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { NgProgress } from 'ngx-progressbar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationsService } from 'angular2-notifications';
import { ParamShareService } from '../../..//shared/services/paramShare.service';
import { environment } from '../../../../environments/environment';
import { saveAs } from 'file-saver';
declare var $: any;
type AOA = Array<Array<any>>;

@Component({
    selector: 'reference-dataform',
    templateUrl: './reference-dataform.component.html',
    styleUrls: ['./reference-dataform.component.css']
})
export class ReferenceDataformComponent implements OnInit {
    @ViewChild(ModalComponent) modalComponent: ModalComponent;
    public showUploadStatus: boolean = false;
    public fileUploaded: boolean = false;
    public uploadedData: any;
    public statusMsg: string;
    public uploadStatus: boolean = false;
    public isCollapsedContent: boolean = true;
    public vnfcCollLength: number = 0;
    public vfncCollection = [];
    public userForm: any;
    public actionType: any;
    numberTest: RegExp = /^[^.a-z]+$/;
    public numberOfVmTest: boolean = true;
    public tempAllData = [];
    disableGrpNotationValue: boolean;
    public noRefData = false;
    public disableRetrieve = false;
    public getRefStatus = false;
    public uploadStatusError: boolean;
    public showUploadErrorStatus: boolean;
    public noData: string;
    selectedActions = [];
    public appData = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
    public downloadData = {
        reference: {},
        template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
        pd: { pdData: '', pdFileName: '' }
    };
    fileName: any;
    public uploadFileName: any;
    public addVmClickedFlag: boolean = false;
    public getExcelUploadStatus: boolean = false;
    public uploadedDataArray: any;
    public actionFlag = false;
    currentAction: any;
    oldAction: any;
    nonConfigureAction: any;
    templateId;
    templateIdentifier;
    public actionLevels = [
        'vnfc', 'vnf'
    ];
    oldtemplateIdentifier: any
    identifierDrp: any;
    identifierDrpValues: any = [];
    //settings for the notifications.
    options = {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };
    //initializing this object to contain all the parameters to be captured
    public referenceDataObject = {
        action: '',
        'action-level': 'vnf',
        scope: { 'vnf-type': '', 'vnfc-type': '' },
        'template': 'Y',
        vm: [],
        'device-protocol': '',
        'user-name': '',
        'port-number': '',
        'artifact-list': []
    };
    public refernceScopeObj = { sourceType: '', from: '', to: '' };
    public actions = ['', 'Configure', 'ConfigModify', 'ConfigBackup', 'ConfigRestore', 'GetRunningConfig', 'HealthCheck', 'StartApplication', 'StopApplication', 'QuiesceTraffic', 'ResumeTraffic', 'UpgradeBackout', 'UpgradeBackup', 'UpgradePostCheck', 'UpgradePreCheck', 'UpgradeSoftware', 'OpenStack Actions', 'ConfigScaleOut'];
    public groupAnotationValue = ['', 'Pair'];
    public groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value'];
    public deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'NETCONF-XML', 'REST', 'CLI', 'RESTCONF'];
    public deviceTemplates = ['', 'Y', 'N'];
    public sourceTypeColl = ['', 'vnfType', 'vnfcType'];
    public ipAddressBoolean = ['', 'Y', 'N'];
    public Sample: any = {
        'vnfc-instance': '1',
        'vnfc-function-code': '',
        'ipaddress-v4-oam-vip': '',
        'group-notation-type': '',
        'group-notation-value': ''
    };
    hideModal: boolean = false;
    public self: any;
    public uploadTypes = [{
        value: 'Reference Data',
        display: 'Sample Json Param File'
    },
    {
        value: 'Mapping Data',
        display: 'Sample Json Param File'
    }
    ];
    public selectedUploadType: string = this.uploadTypes[0].value;
    public vnfcTypeData: string = '';
    public title: string;
    public allowAction: boolean = true;
    public actionExist: boolean = false;
    public disableVnftype: boolean = false;
    public otherActions: boolean = false;
    public actionHealthCheck: boolean = false;
    public actionChanged: boolean = false;
    public initialAction: string = '';
    public noCacheData: boolean;
    public updateParams: any;
    public vnfParams: any;
    public firstArrayElement = [];
    public remUploadedDataArray = [];
    isConfigScaleOut = false
    configScaleOutExist: boolean
    constructor(private buildDesignComponent: BuildDesignComponent, private httpUtils: HttpUtilService, private route: Router, private location: Location, private activeRoutes: ActivatedRoute, private notificationService: NotificationService,
        private paramShareService: ParamShareService, private mappingEditorService: MappingEditorService, private modalService: NgbModal, private nService: NotificationsService, private ngProgress: NgProgress) {
    }

    ngOnInit() {
        this.configScaleOutExist = require('../../../cdt.application.properties.json').showconfigsaleout;
        if (this.configScaleOutExist) {
            this.actions = ['', 'Configure', 'ConfigModify', 'ConfigBackup', 'ConfigRestore', 'GetRunningConfig', 'HealthCheck', 'StartApplication', 'StopApplication', 'QuiesceTraffic', 'ResumeTraffic', 'UpgradeBackout', 'UpgradeBackup', 'UpgradePostCheck', 'UpgradePreCheck', 'UpgradeSoftware', 'OpenStack Actions', 'ConfigScaleOut'];
        } else {
            this.actions = ['', 'Configure', 'ConfigModify', 'ConfigBackup', 'ConfigRestore', 'GetRunningConfig', 'HealthCheck', 'StartApplication', 'StopApplication', 'QuiesceTraffic', 'ResumeTraffic', 'UpgradeBackout', 'UpgradeBackup', 'UpgradePostCheck', 'UpgradePreCheck', 'UpgradeSoftware', 'OpenStack Actions'];
        }
        this.self = this;
        let path = this.location.path;
        this.title = 'Reference Data';
        this.referenceDataObject = {
            action: '',
            'action-level': 'vnf',
            scope: { 'vnf-type': '', 'vnfc-type': '' },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        this.updateParams = sessionStorage.getItem('updateParams');
        let cacheData = this.mappingEditorService.referenceNameObjects;
        if (cacheData != undefined && cacheData != null && cacheData.length > 0) {
            this.tempAllData = cacheData;
            if (this.mappingEditorService.latestAction != undefined) {
                this.referenceDataObject = this.mappingEditorService.latestAction;
                this.toggleIdentifier(this.referenceDataObject.action);
                this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                this.oldAction = this.referenceDataObject.action;
                this.populateExistinAction(this.referenceDataObject.action);
            }
        } else if (this.updateParams != 'undefined') {
            this.getArtifact();
        }
        var appData = this.mappingEditorService.appDataObject;
        if (appData != null || appData != undefined) this.appData = appData;
        var downloadData = this.mappingEditorService.downloadDataObject;
        if (downloadData != null || downloadData != undefined) this.downloadData = downloadData;
        this.vnfParams = JSON.parse(sessionStorage.getItem('vnfParams'));
        if (this.vnfParams && this.vnfParams.vnfType) {
            this.referenceDataObject['scope']['vnf-type'] = this.vnfParams.vnfType;
        }
        if (this.vnfParams && this.vnfParams.vnfcType) {
            this.referenceDataObject['scope']['vnfc-type'] = this.vnfParams.vnfcType;
        }
        this.uploadedDataArray = [];
        this.remUploadedDataArray = [];
        this.firstArrayElement = [];
        this.uploadFileName = '';
        this.templateIdentifier = this.mappingEditorService.identifier
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData(this.referenceDataObject);
        this.configDrp(this.referenceDataObject.action)
    }
    toggleIdentifier(data) {
        if (data == 'ConfigScaleOut') {
            this.isConfigScaleOut = true

        } else {
            this.isConfigScaleOut = false
        }
    }

    //to retrive the data from appc and assign it to the vaiables, if no data display the message reterived from the API
    getArtifact() {
        try {
            let payload = JSON.parse(sessionStorage.getItem('updateParams'));
            payload['userID'] = localStorage['userId'];
            payload = JSON.stringify(payload);
            let data = {
                'input': {
                    'design-request': {
                        'request-id': localStorage['apiToken'],
                        'action': 'getArtifact',
                        'payload': payload
                    }
                }
            };
            this.ngProgress.start();
            this.httpUtils.post({
                url: environment.getDesigns,
                data: data
            }).subscribe(resp => {
                if (resp.output.data.block != undefined) {
                    this.nService.success('Status', 'data fetched ');
                    let artifactInfo = JSON.parse(resp.output.data.block).artifactInfo[0];
                    let reference_data = JSON.parse(artifactInfo['artifact-content'])['reference_data'][0];
                    this.referenceDataObject = reference_data;
                    this.toggleIdentifier(this.referenceDataObject.action);
                    if (this.referenceDataObject.action == 'ConfigScaleOut') {
                        this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value', 'existing-group-name'];
                    }

                    // Enable or Block Template and PD Tabs
                    this.buildDesignComponent.getRefData(this.referenceDataObject);
                    this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                    this.mappingEditorService.getReferenceList().push(JSON.parse(artifactInfo['artifact-content']));
                    this.tempAllData = JSON.parse(artifactInfo['artifact-content'])['reference_data'];
                    this.oldAction = this.referenceDataObject.action;
                    if (this.referenceDataObject.action === 'OpenStack Actions') {
                        this.deviceProtocols = ['', 'OpenStack'];
                        this.buildDesignComponent.tabs = [
                            {

                                name: 'Reference Data',
                                url: 'references',
                            }];
                    }
                    else {
                        this.buildDesignComponent.tabs = [
                            {
                                name: 'Reference Data',
                                url: 'references',
                            }, {
                                name: 'Template',
                                url: 'templates/myTemplates',
                            }, {
                                name: 'Parameter Definition',
                                url: 'parameterDefinitions/create'
                            }/*, {
                                name: "Test",
                                url: 'test',
                            }*/
                        ];
                    }
                    this.getArtifactsOpenStack();
                } else {
                    this.nService.success('Status', 'Sorry !!! I dont have any artifact Named : ' + (JSON.parse(payload))['artifact-name']);
                }
                this.ngProgress.done();
            });
        }
        catch (e) {
            this.nService.warn('status', 'error while reteriving artifact');
        }
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    //reinitializing the required values
    ngOnDestroy() {
        let referenceObject = this.prepareReferenceObject();
        this.mappingEditorService.changeNavAppData(this.appData);
        this.mappingEditorService.changeNavDownloadData(this.downloadData);
        this.uploadedDataArray = [];
        this.remUploadedDataArray = [];
        this.firstArrayElement = [];
        this.uploadFileName = '';
    }

    numberValidation(event: any) {
        if (this.numberTest.test(event) && event != 0) {
            this.numberOfVmTest = true;
        }
        else {
            this.numberOfVmTest = false;
        }
    }

    updateSessionValues(event: any, type: string) {
        if (type === 'action') {
            sessionStorage.setItem('action', event);
        }
        if (type === 'vnfType') {
            sessionStorage.setItem('vnfType', event);
        }
    }

    addVnfcData(vmNumber: number) {
        var newObj = {
            'vnfc-instance': this.referenceDataObject.vm[vmNumber].vnfc.length + 1,
            'vnfc-type': this.vnfcTypeData,
            'vnfc-function-code': '',
            'ipaddress-v4-oam-vip': '',
            'group-notation-type': '',
            'group-notation-value': ''
        };
        this.referenceDataObject.vm[vmNumber].vnfc.push(newObj);
    }

    //to remove the VM's created by the user
    removeFeature(vmNumber: any, index: any, templateId) {
        if (this.referenceDataObject.action == "Configure") {
            this.referenceDataObject.vm.splice(vmNumber, 1);
            this.referenceDataObject.vm.forEach((obj, arrIndex) => {
                if (arrIndex >= vmNumber) {
                    obj["vm-instance"] = obj["vm-instance"] - 1
                }
            })
        } else {
            let data = this.referenceDataObject.vm.filter(obj => {
                return obj['template-id'] == templateId;
            })

            let vmIndex = this.findVmindex(data, vmNumber, templateId)
            this.referenceDataObject.vm.splice(vmIndex, 1);
            let index = 0
            this.referenceDataObject.vm.forEach((obj, arrIndex) => {
                if (obj['template-id'] == templateId) {

                    obj["vm-instance"] = index + 1
                    index++
                }

            })
        }

    }
    findVmindex(data, vmNumber, templateId) {
        return this.referenceDataObject.vm.findIndex(obj => {
            let x = obj['vm-instance'] == (vmNumber + 1) && templateId == obj['template-id']//true
            return x
        })

    }

    //add new VM's to the configure
    addVms() {
        let arr = [];
        let mberOFVm = Number(this.refernceScopeObj.from);
        if (this.referenceDataObject.action == 'ConfigScaleOut') {
            let existingVmsLength = this.referenceDataObject.vm.filter(obj => {
                return obj['template-id'] == this.templateIdentifier
            }).length;
            mberOFVm = existingVmsLength + mberOFVm;
            let index = 0;
            for (var i = (existingVmsLength); i < mberOFVm; i++) {

                this.referenceDataObject.vm.push({ 'template-id': this.templateIdentifier, 'vm-instance': (existingVmsLength + index + 1), vnfc: [Object.assign({}, this.Sample)] });
                index++;
            }

        } else {
            let arrlength = this.referenceDataObject.vm.length;
            mberOFVm = arrlength + mberOFVm;
            for (var i = (arrlength); i < mberOFVm; i++) {
                if (this.referenceDataObject.action == 'ConfigScaleOut') {
                    this.referenceDataObject.vm.push({ 'template-id': this.templateIdentifier, 'vm-instance': (i + 1), vnfc: [Object.assign({}, this.Sample)] });
                } else {
                    this.referenceDataObject.vm.push({ 'vm-instance': (i + 1), vnfc: [Object.assign({}, this.Sample)] });
                }
            }
        }
    }

    //Reference object to create reference data
    prepareReferenceObject(isSaving?: any) {
        let scopeName = this.resetParamsOnVnfcType();
        let extension = this.decideExtension();
        this.prepareArtifactList(scopeName, extension);
        if (this.referenceDataObject.action === 'OpenStack Actions') {
            this.referenceDataObject['template'] = 'N';
            this.referenceDataObject['artifact-list'] = [];
        }
        //detaching the object from the form and processing further
        let newObj = $.extend(true, {}, this.referenceDataObject);
        let action = this.referenceDataObject.action;
        newObj = this.deleteVmsforNonActions(newObj, action)
        this.pushOrReplaceTempData(newObj, action);
        this.addAllActionObj(newObj, scopeName);
        this.resetTempData()
        //saving data to service
        this.mappingEditorService.getReferenceList().push(JSON.parse(JSON.stringify(this.referenceDataObject)));
        this.buildDesignComponent.updateAccessUpdatePages(this.referenceDataObject.action, this.mappingEditorService.getReferenceList());
        this.mappingEditorService.changeNav(this.tempAllData);
        //on action change or template identifier change reset the form by restting values of Reference data object
        this.resetVmsForScaleout(this.currentAction)
        return { totlaRefDtaa: this.tempAllData, scopeName: scopeName };
    }

    public checkIfelementExistsInArray(element, array) {
        //// console.log("Element==" + element)
        var result: boolean = false;

        array.forEach(function (item) {
            // // console.log("Item==" + item)
            if (element === item) {
                // console.log('Element==' + element + 'Item==' + item);
                result = true;
            }
        }
        );
        return result;
    }

    upload(evt: any) {
        /*  // console.log("This uploaded array==" + JSON.stringify(this.uploadedDataArray))
          // // console.log("This template data before==" + JSON.stringify(this.tempAllData))
          if (this.uploadedDataArray && this.uploadedDataArray != undefined && this.uploadedDataArray.length!=0) {
              /*  for (var i = 0; i < this.uploadedDataArray.length; i++) {
                    var action = this.uploadedDataArray[i][0];
                    for (var j = 0; j < this.tempAllData.length; j++) {
                        if (action === this.tempAllData[j].action) {
                            this.tempAllData.splice(j);
                            // console.log("This template data===" + this.tempAllData[j]);
                        }
                    }
                }
               if (this.tempAllData && this.tempAllData != undefined) {
                  for (var i = 0; i < this.tempAllData.length; i++) {
                      // alert(this.checkIfelementExistsInArray(this.tempAllData[i].action,this.actions))
                      var result = this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions);
                      if (this.tempAllData[i].action === "AllAction") result = true;
                      if (!result) {
                          // console.log("Removing VM action==" + this.tempAllData[i].action)
                          this.tempAllData.splice(i, 1);
                      }
     
                  }
              }
          }
          // // console.log("This template data after==" + JSON.stringify(this.tempAllData))
          /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(evt.target);
        //// console.log("filename========" + evt.target.files[0].name)
        this.uploadFileName = evt.target.files[0].name;
        var fileExtension = this.uploadFileName.substr(this.uploadFileName.lastIndexOf('.') + 1);
        if (target.files.length != 1) {
            throw new Error('Cannot upload multiple files on the entry');
        }
        if (fileExtension.toUpperCase() === 'XLS' || fileExtension.toUpperCase() === 'XLSX') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                /* read workbook */
                const bstr = e.target.result;
                //      // console.log("print 1---" + bstr);
                const wb = XLSX.read(bstr, { type: 'binary' });
                //    // console.log("print 2---" + JSON.stringify(wb));
                /* grab first sheet */
                const wsname = wb.SheetNames[0];
                //  // console.log("Name:---" + wsname);
                const ws = wb.Sheets[wsname];

                /* save data */

                let arrData = (<AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 })));
                this.uploadedDataArray = arrData;
                this.firstArrayElement = arrData[0];
                var remUploadedDataArray = arrData;
                remUploadedDataArray.shift();
                this.remUploadedDataArray = remUploadedDataArray;
                if (arrData != null) {
                    this.getExcelUploadStatus = true;
                    this.nService.success('Success', 'Vm capabilities data uploaded successfully');

                }
                else {
                    this.nService.success('Error', 'Empty Vm capabilities file uploaded');
                }
            };
            reader.readAsBinaryString(target.files[0]);
        }
        else {
            this.nService.error('Error', 'Incorrect VM capabilities file uploaded');
        }

    }

    addVmCapabilitiesData() {
        for (var i = 0; i < this.uploadedDataArray.length; i++) {
            var vnfcFuncCodeArray = [];
            var data = this.uploadedDataArray[i];
            for (var j = 1; j < data.length; j++) {
                if (data[j] != undefined) {
                    if (data[j].toUpperCase() === 'Y') {
                        vnfcFuncCodeArray.push(this.firstArrayElement[j]);
                    }
                }
            }
            var action = this.uploadedDataArray[i][0];
            if (action && action != undefined) {
                var json = {
                    'action': action,
                    'action-level': 'vm',
                    'scope': {
                        'vnf-type': this.referenceDataObject['scope']['vnf-type'], //need to confirm what should be this value
                        'vnfc-type': null
                    },
                    'vnfc-function-code-list': vnfcFuncCodeArray,
                    'template': 'N',
                    'device-protocol': 'OS'
                };

                this.tempAllData.push(json);
            }

        }
    }

    //download template
    save(form: any, isValid: boolean) {
        if (this.referenceDataObject.action === '') {
            this.nService.error('Error', 'Select a valid Action');
            return;
        }
        if (this.referenceDataObject['device-protocol'] === '') {
            this.nService.error('Error', 'Select a valid Device protocol');
            return;
        }

        if (isValid) {
            let referenceObject = this.prepareReferenceObject();
            let theJSON = JSON.stringify({ 'reference_data': this.tempAllData }, null, '\t');
            let uri = 'data:application/json;charset=UTF-8,' + encodeURIComponent(theJSON);
            this.downloadData.reference = theJSON;
            this.validateTempAllData();
            var blob = new Blob([theJSON], {
                type: 'text/plain'
            });
            let fileName = 'reference_AllAction_' + referenceObject.scopeName + '_' + '0.0.1V.json';
            this.downloadFile(blob, fileName, 100)
            var templateData = JSON.stringify(this.downloadData.template.templateData);
            var nameValueData = JSON.stringify(this.downloadData.template.nameValueData);
            var pdData = this.downloadData.pd.pdData;
            if (templateData != '{}' && templateData != null && templateData != undefined) this.downloadTemplate();
            if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.downloadNameValue();
            if (pdData != '' && pdData != null && pdData != undefined) this.downloadPd();
        }
    }
    downloadFile(blob, fileName, delay) {
        setTimeout(() => {
            saveAs(blob, fileName);
        }, delay)
    }

    downloadTemplate() {
        var fileName = this.downloadData.template.templateFileName;
        var theJSON = this.downloadData.template.templateData;
        if (fileName != null || fileName != '') {
            var fileExtensionArr = fileName.split('.');
            var blob = new Blob([theJSON], {
                type: 'text/' + fileExtensionArr[1]
            });
            this.downloadFile(blob, fileName, 130)
        }
    }

    downloadNameValue() {
        var fileName = this.downloadData.template.nameValueFileName;
        var theJSON = this.downloadData.template.nameValueData;
        var blob = new Blob([theJSON], {
            type: 'text/json'
        });

        this.downloadFile(blob, fileName, 160)
    }

    downloadPd() {
        let fileName = this.downloadData.pd.pdFileName;
        let theJSON = this.downloadData.pd.pdData;
        var blob = new Blob([theJSON], {
            type: 'text/plain'
        });

        this.downloadFile(blob, fileName, 180)
    }

    saveToAppc(valid, form, event) {
        if (this.referenceDataObject.action === '') {
            this.nService.error('Error', 'Select a valid Action');
            return;
        }
        if (this.referenceDataObject['device-protocol'] === '') {
            this.nService.error('Error', 'Select a valid Device protocol');
            return;
        }

        try {
            form._submitted = true;
            if (valid) {

                let referenceObject = this.prepareReferenceObject(true);
                this.validateTempAllData();
                let theJSON = JSON.stringify(this.tempAllData, null, '\t');
                let fileName = 'reference_AllAction_' + referenceObject.scopeName + '_' + '0.0.1V.json';
                this.uploadArtifact(JSON.stringify({ reference_data: this.tempAllData }), this.tempAllData[this.tempAllData.length - 1], fileName);
                var templateData = JSON.stringify(this.appData.template.templateData);
                var nameValueData = JSON.stringify(this.appData.template.nameValueData);
                var pdData = JSON.stringify(this.appData.pd);
                if (templateData != '{}' && templateData != null && templateData != undefined) this.saveTemp();
                if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.saveNameValue();
                if (pdData != '{}' && pdData != null && pdData != undefined) this.savePd();
                if (this.actionChanged) {
                    this.clearVnfcData()
                    if (this.currentAction) {
                        this.referenceDataObject.action = this.currentAction;
                    }

                    this.populateExistinAction(this.referenceDataObject.action);
                    this.actionChanged = false;
                }
            }
        }
        catch (e) {
            this.nService.warn('status', 'unable to save the artifact');
        }
    }

    validateTempAllData() {
        if (this.tempAllData) {
            var updatedData = [];
            this.tempAllData.forEach(data => {
                if (data.action) {
                    updatedData.push(data);
                }
            });
            this.tempAllData = updatedData;
        }
    }

    appendSlashes(artifactData) {
        return artifactData.replace(/"/g, '\\"');
    }

    uploadArtifact(artifactData, dataJson, fileName) {
        let data = [];
        let slashedPayload = this.appendSlashes(artifactData);
        let newPyaload = '{"userID": "' + localStorage['userId'] + '","vnf-type" : "' + dataJson['scope']['vnf-type'] + '","action" : "AllAction","artifact-name" : "' + fileName + '","artifact-type" : "APPC-CONFIG","artifact-version" : "0.1","artifact-contents" :" ' + slashedPayload + '"}';
        let payload = {
            'input': {
                'design-request': {
                    'request-id': localStorage['apiToken'],
                    'action': 'uploadArtifact',
                    'payload': newPyaload,
                }
            }
        };
        this.ngProgress.start();
        this.httpUtils.post({
            url: environment.getDesigns,
            data: payload
        }).subscribe((resp) => {
            if (resp != null && resp.output.status.code == '400') {
                window.scrollTo(0, 0);
                this.nService.success('Status', 'successfully uploaded the Reference Data');
            } else {
                this.nService.warn('Status', 'Error while saving Reference Data');
            }
            this.uploadStatusError = false;
            this.getRefStatus = false;
            this.ngProgress.done();
        }, (err) => {
            this.nService.error('Status', 'Error Connecting to the APPC Network');
            window.scrollTo(0, 0);
        });
        this.appData.reference = payload;
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    retriveFromAppc() {
        if (sessionStorage.getItem('updateParams') != 'undefined') {
            this.getArtifact();
            this.noCacheData = false;
        } else {
            this.noCacheData = true;
        }
    }

    cloneMessage(servermessage) {
        var clone = {};
        for (var key in servermessage) {
            if (servermessage.hasOwnProperty(key)) //ensure not adding inherited props
                clone[key] = servermessage[key];
        }
        return clone;
    }

    public showUpload() {
        this.selectedUploadType = this.uploadTypes[0].value;
    };

    public fileChange(input) {
        this.fileName = input.target.files[0].name.replace(/C:\\fakepath\\/i, '');
        this.fileUploaded = true;
        this.disableRetrieve = true;
        if (input.target.files && input.target.files[0]) {
            // Create the file reader
            let reader = new FileReader();
            this.readFile(input.target.files[0], reader, (result) => {
                // After the callback fires do:
                if ('Reference Data' === this.selectedUploadType) {
                    try {
                        let obj: any;
                        let jsonObject = (JSON.parse(result))['reference_data'];
                        this.uploadedData = JSON.parse(JSON.stringify(jsonObject));
                        this.tempAllData = JSON.parse(JSON.stringify(jsonObject));
                        this.notificationService.notifySuccessMessage('Reference Data file successfully uploaded..');
                        if (jsonObject instanceof Array) {
                            this.referenceDataObject = jsonObject[0];
                            jsonObject.forEach(obj => {
                                this.selectedActions.push(obj.action);
                            });
                        } else {
                            this.referenceDataObject = jsonObject;

                            this.selectedActions.push(jsonObject.action);
                        }
                        this.toggleIdentifier(this.referenceDataObject.action)
                        this.configDrp(this.referenceDataObject.action)
                        if (this.referenceDataObject.action === 'OpenStack Actions') {
                            this.deviceProtocols = ['', 'OpenStack'];
                            this.buildDesignComponent.tabs = [
                                {
                                    type: 'dropdown',
                                    name: 'Reference Data',
                                    url: 'references',
                                }];
                        }
                        else {
                            this.buildDesignComponent.tabs = [
                                {
                                    name: 'Reference Data',
                                    url: 'references',
                                }, {
                                    name: 'Template',
                                    url: 'templates/myTemplates',
                                }, {
                                    name: 'Parameter Definition',
                                    url: 'parameterDefinitions/create'
                                } /*, {
        name: "Test",
        url: 'test',
      }*/
                            ];
                        }
                        if (this.referenceDataObject.template == null) {
                            this.referenceDataObject.template = 'Y';
                        }
                        if (this.referenceDataObject['action-level'] == null) {
                            this.referenceDataObject['action-level'] = 'VNF';
                        }
                        // Enable or Block Template and PD Tabs
                        this.buildDesignComponent.getRefData(this.referenceDataObject);
                    } catch (e) {
                        this.nService.error('Error', 'Incorrect file format');
                    }
                }
                this.hideModal = true;
            });
        } else {
            this.notificationService.notifyErrorMessage('Failed to read file..');
        }
    }

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

    fileChangeEvent(fileInput: any) {
        let obj: any = fileInput.target.files;
    }

    clearVnfcData() {
        this.Sample = {
            'vnfc-instance': '1',
            'vnfc-function-code': '',
            'ipaddress-v4-oam-vip': '',
            'group-notation-type': '',
            'group-notation-value': ''
        };
    }

    setVmInstance(index) {
        this.referenceDataObject.vm[index]['vm-instance'] = index + 1;
    }

    setVnfcType(str: String) {
        this.Sample['vnfc-type'] = str;
    }

    getChange(value: String) {
        if (value === 'vnfType') {
            this.referenceDataObject.scope['vnfc-type'] = '';
        }
    }

    resetForm() {
        this.referenceDataObject['action-level'] = 'vnf';
        this.referenceDataObject.template = 'Y';
        this.referenceDataObject['device-protocol'] = '';
        this.referenceDataObject['user-name'] = '';
        this.referenceDataObject['port-number'] = '';
        this.refernceScopeObj.sourceType = '';
        this.Sample['vnfc-type'] = '';
    }

    populateExistinAction(data) {
        let existAction = this.tempAllData.findIndex(obj => {
            return obj.action == data;
        });
        if (existAction > -1) {
            let obj = $.extend(true, {}, this.tempAllData[existAction]);
            this.referenceDataObject = obj;
            this.referenceDataObject.scope['vnf-type'] = obj['scope']['vnf-type'];
            this.referenceDataObject.scope['vnfc-type'] = obj['scope']['vnfc-type'];
            this.referenceDataObject['device-protocol'] = obj['device-protocol'];
            this.refernceScopeObj['sourceType'] = obj['scopeType'];
        } else {
            this.resetForm();
            this.referenceDataObject.action = data;
        }
        //# iof healthCeck change deviceprotocol drp vaues
        if (data == 'HealthCheck') {
            this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'REST'];
            this.actionHealthCheck = true;
        } else if (data == 'UpgradeBackout' || data == 'ResumeTraffic' || data == 'QuiesceTraffic' || data == 'UpgradeBackup' || data == 'UpgradePostCheck' || data == 'UpgradePreCheck' || data == 'UpgradeSoftware' || data == 'ConfigBackup' || data == 'ConfigRestore' || data == 'StartApplication' || data == 'StopApplication' || data == 'GetRunningConfig') {
            this.deviceProtocols = ['', 'CHEF', 'ANSIBLE'];
        } else if (data == 'OpenStack Actions') {
            this.deviceProtocols = ['', 'OpenStack'];
        } else if (data == 'ConfigScaleOut') {
            this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF'];
        }
        else {
            this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'NETCONF-XML', 'RESTCONF', 'CLI'];
            this.actionHealthCheck = false;
        }
    }

    //Modal pop up for action change with values entered.
    actionChange(data, content, userForm) {
        this.disableGrpNotationValue = false
        if (data == null) {
            return;
        }
        if ((userForm.valid) && this.oldAction != '' && this.oldAction != undefined) {
            this.actionChanged = true;
            this.modalService.open(content, { backdrop: 'static', keyboard: false }).result.then(res => {
                if (res == 'yes') {
                    this.currentAction = this.referenceDataObject.action;
                    this.referenceDataObject.action = this.oldAction;
                    $('#saveToAppc').click();//make sure the save all is done before the tempall obj is saved form the API
                    this.toggleIdentifier(data)
                    this.oldAction = this.currentAction;// this.referenceDataObject.action + '';
                    this.referenceDataObject.action = this.currentAction

                    this.populateExistinAction(data);
                    if (this.oldAction === 'OpenStack Actions') {

                        this.uploadedDataArray = [];
                        this.remUploadedDataArray = [];
                        this.firstArrayElement = [];
                        this.uploadFileName = '';
                        //this.tempAllData = [];
                    }
                    this.clearCache();
                    this.refernceScopeObj.from = '';
                    this.getArtifactsOpenStack()
                } else {
                    this.toggleIdentifier(data)
                    this.currentAction = this.referenceDataObject.action;
                    this.populateExistinAction(data);
                    this.resetVmsForScaleout(data);
                    this.oldAction = this.referenceDataObject.action + '';
                    this.clearCache();
                    this.clearVnfcData()
                    this.refernceScopeObj.from = '';
                }

                // Enable or Block Template and PD Tabs
                if (this.currentAction == 'ConfigScaleOut' && this.templateIdentifier) {
                    let referenceDataObjectTemp = this.referenceDataObject;
                    referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                    this.buildDesignComponent.getRefData(referenceDataObjectTemp);
                } else {
                    this.buildDesignComponent.getRefData(this.referenceDataObject);
                }
            });
        } else {
            this.actionChanged = true;
            this.currentAction = this.referenceDataObject.action;
            this.oldAction = this.referenceDataObject.action + '';
            this.populateExistinAction(data);
            this.resetVmsForScaleout(data);
            this.toggleIdentifier(data);

            // Enable or Block Template and PD Tabs
            if (this.currentAction == 'ConfigScaleOut' && this.templateIdentifier) {
                let referenceDataObjectTemp = this.referenceDataObject;
                referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                this.buildDesignComponent.getRefData(referenceDataObjectTemp);
            } else {
                this.buildDesignComponent.getRefData(this.referenceDataObject);
            }
        }
        this.configDrp(data)
    }

    configDrp(data) {
        if (data == 'ConfigScaleOut') {
            this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value', 'existing-group-name'];
        } else {
            this.groupAnotationType = ['', 'first-vnfc-name', 'fixed-value', 'relative-value'];
        }
        if (data == 'OpenStack Actions') {
            this.buildDesignComponent.tabs = [
                {
                    type: 'dropdown',
                    name: 'Reference Data',
                    url: 'references',
                }];
        }
        else {
            this.buildDesignComponent.tabs = [
                {
                    name: 'Reference Data',
                    url: 'references',
                }, {
                    name: 'Template',
                    url: 'templates/myTemplates',
                }, {
                    name: 'Parameter Definition',
                    url: 'parameterDefinitions/create'
                }/*, {
                    name: "Test",
                    url: 'test',
                }*/
            ];
        }
        if (data == 'Configure' || data == 'ConfigModify') {
            this.nonConfigureAction = false;
        } else {
            this.nonConfigureAction = true;
        }
    }

    deviceProtocolChange() {
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData(this.referenceDataObject)
    }

    // For the issue with multiple template changes
    idChange(data, content, userForm) {
        if (data == null) {
            return;
        }
        // Enable or Block Template and PD Tabs
        let referenceDataObjectTemp = this.referenceDataObject;
        referenceDataObjectTemp['template-id'] = data;
        this.buildDesignComponent.getRefData(referenceDataObjectTemp);

        if ((userForm.valid) && this.oldtemplateIdentifier != '' && this.oldtemplateIdentifier != undefined) {
            this.currentAction = "ConfigScaleOut"
            this.oldtemplateIdentifier = this.templateIdentifier
            let referenceObject = this.prepareReferenceObject();
            this.actionChanged = true;
            if (this.templateIdentifier) {
                this.modalService.open(content).result.then(res => {
                    if (res == 'yes') {
                        this.validateTempAllData();
                        let theJSON = JSON.stringify(this.tempAllData, null, '\t');
                        let fileName = 'reference_AllAction_' + referenceObject.scopeName + '_' + '0.0.1V.json';
                        this.uploadArtifact(JSON.stringify({ reference_data: this.tempAllData }), this.tempAllData[this.tempAllData.length - 1], fileName);
                        var templateData = JSON.stringify(this.appData.template.templateData);
                        var nameValueData = JSON.stringify(this.appData.template.nameValueData);
                        var pdData = JSON.stringify(this.appData.pd);
                        if (templateData != '{}' && templateData != null && templateData != undefined) this.saveTemp();
                        if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.saveNameValue();
                        if (pdData != '{}' && pdData != null && pdData != undefined) this.savePd();
                        this.clearCache();
                        this.clearVnfcData()
                        this.refernceScopeObj.from = '';
                    }
                    else {
                        this.clearCache();
                        this.refernceScopeObj.from = '';
                    }
                });
            }
        }
    }

    clearCache() {
        // get the value and save the userid and persist it.
        this.clearTemplateCache();
        this.clearPdCache();
        this.appData = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
        this.downloadData = {
            reference: {},
            template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
            pd: { pdData: '', pdFileName: '' }
        };
    }

    clearTemplateCache() {
        this.mappingEditorService.setTemplateMappingDataFromStore(undefined);
        localStorage['paramsContent'] = '{}';
    }
    clearPdCache() {
        this.mappingEditorService.setParamContent(undefined);
        this.paramShareService.setSessionParamData(undefined);
    }

    saveTemp() {
        this
            .httpUtils
            .post(
                { url: environment.getDesigns, data: this.appData.template.templateData })
            .subscribe(resp => {
                if (resp.output.status.code === '400' && resp.output.status.message === 'success') {
                    this.nService.success('Status', 'Successfully uploaded the Template Data');
                }
                if (resp.output.status.code === '401') {
                    this.nService.warn('Status', 'Error in saving the Template to Appc');

                }
            },
                (err) => this.nService.error('Status', 'Error Connecting to the APPC Network'));
    }

    saveNameValue() {
        this
            .httpUtils
            .post(
                {
                    url: environment.getDesigns, data: this.appData.template.nameValueData
                })
            .subscribe(resp => {
                if (resp.output.status.code === '400' && resp.output.status.message === 'success') {
                    this.nService.success('Status', 'Successfully uploaded the Name Value Pairs');
                }
                if (resp.output.status.code === '401') {
                    this.nService.warn('Status', 'Error in saving the Name value pairs to Appc');
                }
            },
                error => {
                    this.nService.error('Status', 'Error Connecting to the APPC Network');
                    return false;
                });
    }

    savePd() {
        this
            .httpUtils
            .post(
                {
                    url: environment.getDesigns, data: this.appData.pd
                })
            .subscribe(resp => {
                if (resp.output.status.code === '400' && resp.output.status.message === 'success') {
                    this.nService.success('Status', 'Successfully uploaded PD file');
                }
                if (resp.output.status.code === '401') {
                    this.nService.warn('Status', 'Error in saving the PD to Appc');
                }
            },
                error => {
                    this.nService.error('Status', 'Error Connecting to the APPC Network');
                    return false;
                });
    }

    openModel(toShow: any, message: any, title: any) {
        this.modalComponent.isShow = toShow;
        this.modalComponent.message = message;
        this.modalComponent.title = title;
    }

    browseOption() {
        $('#inputFile').trigger('click');
    }

    excelBrowseOption() {
        $('#excelInputFile').trigger('click');
    }

    showIdentifier() {
        $('#identifierModal').modal();
    }

    addToIdentDrp() {
        if (!(this.referenceDataObject['template-id-list'])) {
            this.referenceDataObject['template-id-list'] = [];
        }
        if (!(this.referenceDataObject['template-id-list'].indexOf(this.templateId.trim()) > -1)) {
            this.referenceDataObject['template-id-list'].push(this.templateId.trim());
        }
    }

    resetVms() {
        this.referenceDataObject.vm = [];
    }

    dataModified() {
        //  this.referenceDataObject.vm = this.referenceDataObject.vm;
    }

    resetGroupNotation() {
        if (this.Sample['group-notation-type'] == "existing-group-name") {
            this.Sample['group-notation-value'] = ""
            this.disableGrpNotationValue = true
        } else {
            this.disableGrpNotationValue = false
        }
    }

    resetVmsForScaleout(action) {
        //reset currentform vms based on action
        if (action == "ConfigScaleOut" || action == "Configure") {
            let ConfigScaleOutIndex = this.tempAllData.findIndex(obj => {
                return obj['action'] == action
            });
            if (ConfigScaleOutIndex > -1) {
                this.referenceDataObject.vm = this.tempAllData[ConfigScaleOutIndex].vm
            } else {
                if (this.actionChanged) {
                    this.referenceDataObject.vm = []
                }
            }
        }
    }

    resetParamsOnVnfcType() {
        let scopeName = '';
        //if only vnf is there
        if (this.referenceDataObject.scope['vnfc-type'] == '' || this.referenceDataObject.scope['vnfc-type'] == null || this.referenceDataObject.scope['vnfc-type'] == 'null') {
            scopeName = this.referenceDataObject.scope['vnf-type'];
            this.referenceDataObject.scope['vnfc-type'] = '';
            this.referenceDataObject['action-level'] = 'vnf';
            this.referenceDataObject['scopeType'] = 'vnf-type';
        }
        //if VNFC is entered set action level & Scope type to VNFC for configure and configure modify, and default the values to vnf and vnf type for all other actions  
        else {
            scopeName = this.referenceDataObject.scope['vnfc-type'];
            if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify') {
                this.referenceDataObject['action-level'] = 'vnfc';
                this.referenceDataObject['scopeType'] = 'vnfc-type';
            } else {
                this.referenceDataObject['action-level'] = 'vnf';
                this.referenceDataObject['scopeType'] = 'vnf-type';
            }
        }
        //replacing / with _ and removing spaces in the scopeName
        if (scopeName) {
            scopeName = scopeName.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
        }
        return scopeName
    }
    decideExtension() {
        //marking the extension based on the device-protocol selected by the user 
        let extension = 'json';
        if (this.referenceDataObject['device-protocol'] == 'ANSIBLE' || this.referenceDataObject['device-protocol'] == 'CHEF' || this.referenceDataObject['device-protocol'] == 'CLI') {
            extension = 'json';
        } else if (this.referenceDataObject['device-protocol'] == 'NETCONF-XML' || this.referenceDataObject['device-protocol'] == 'REST') {
            extension = 'xml';
        }
        return extension
    }
    prepareArtifactList(scopeName, extension) {
        this.referenceDataObject['artifact-list'] = [];
        //preparing the artifact list array file names along with extension
        let config_template_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V.' + extension;
        let pd_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V.yaml';
        let reference_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V.json';
        let configTemplate = {
            'artifact-name': 'template_' + config_template_fileName,
            'artifact-type': 'config_template'
        };
        let pdTemplate = {
            'artifact-name': 'pd_' + pd_fileName,
            'artifact-type': 'parameter_definitions'
        };
        if (this.referenceDataObject.action != 'ConfigScaleOut') {
            this.referenceDataObject['artifact-list'].push(configTemplate,
                pdTemplate
            );
        } else {
            let identifiers = this.referenceDataObject['template-id-list'];
            if (identifiers) {
                for (var x = 0; x < identifiers.length; x++) {
                    //for replacing spaces and "/" with "_"
                    identifiers[x] = identifiers[x].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
                    pd_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V_' + identifiers[x] + '.yaml';
                    config_template_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V_' + identifiers[x] + '.' + extension;

                    configTemplate = {
                        'artifact-name': 'template_' + config_template_fileName,
                        'artifact-type': 'config_template'
                    };
                    pdTemplate = {
                        'artifact-name': 'pd_' + pd_fileName,
                        'artifact-type': 'parameter_definitions'
                    };
                    this.referenceDataObject['artifact-list'].push(configTemplate,
                        pdTemplate
                    );
                }
            }

        }
    }
    deleteVmsforNonActions(newObj, action) {
        let configureObject = (action == 'Configure');
        let ConfigScaleOut = (action == 'ConfigScaleOut');
        //delete VM's if selected action is not configure.
        if (!ConfigScaleOut && !configureObject && this.tempAllData.length != 0) {
            if (ConfigScaleOut) {
            } else {
                newObj.vm = [];
            }
        } else {
            if (ConfigScaleOut) {
            } else {
                delete newObj['template-id-list'];
            }
        }
        return newObj
    }
    pushOrReplaceTempData(newObj, action) {
        let actionObjIndex = this.tempAllData.findIndex(obj => {
            return obj['action'] == action;
        });
        if (newObj.action != 'HealthCheck') {
            delete newObj['url'];
        }

        if (actionObjIndex > -1) {
            this.tempAllData[actionObjIndex] = newObj;
            this.mappingEditorService.saveLatestAction(this.tempAllData[actionObjIndex]);
            if (newObj.action == "ConfigScaleOut") {
                this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier);
            }
            else {
                this.templateIdentifier = ('')
                this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier)
            }
        } else {
            if (newObj.action != '') {
                this.tempAllData.push(newObj);
                this.mappingEditorService.saveLatestAction(newObj);
                if (newObj.action == "ConfigScaleOut") {
                    this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier);
                }
                else {
                    this.templateIdentifier = ('')
                    this.mappingEditorService.saveLatestIdentifier(this.templateIdentifier)
                }
            }
        }

    }

    addAllActionObj(newObj, scopeName) {
        //Creating all action block to allow mulitple actions at once
        let allAction = {
            action: 'AllAction',
            'action-level': 'vnf',
            scope: newObj.scope,
            'artifact-list': [{
                'artifact-name': 'reference_AllAction' + '_' + scopeName + '_' + '0.0.1V.json',
                'artifact-type': 'reference_template'
            }]
        };
        let allActionIndex = this.tempAllData.findIndex(obj => {
            return obj['action'] == 'AllAction';
        });
        if (allActionIndex > -1) {
            this.tempAllData[allActionIndex] = allAction;
        } else {
            this.tempAllData.push(allAction);
        }
    }

    resetTempData() {
        if (this.uploadedDataArray && this.uploadedDataArray != undefined && this.uploadedDataArray.length != 0) {
            if (this.tempAllData && this.tempAllData != undefined) {
                for (var i = 0; i < this.tempAllData.length; i++) {
                    var result = false;
                    if (this.tempAllData[i].action === 'AllAction') {
                        result = true;
                    }
                    else {
                        result = this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions);
                    }
                    if (!result) {
                        this.tempAllData.splice(i, 1);
                        i = i - 1;
                    }

                }
            }
            this.addVmCapabilitiesData();
        }
    }

    trackByFn(index, item) {
        return index;
    }
    getArtifactsOpenStack() {
        var array = []
        var vnfcFunctionCodeArrayList = [];
        var vnfcSet = new Set();
        for (var i = 0; i < this.tempAllData.length; i++) {
            if (!this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions) && (this.tempAllData[i].action != 'AllAction')) {
                var vnfcFunctionCodeArray = this.tempAllData[i]["vnfc-function-code-list"]
                vnfcSet.add("Actions")
                for (var j = 0; j < vnfcFunctionCodeArray.length; j++) {
                    vnfcSet.add(vnfcFunctionCodeArray[j])
                }
                vnfcFunctionCodeArrayList.push([this.tempAllData[i].action].concat(this.tempAllData[i]["vnfc-function-code-list"]))
            }
        }

        var vnfcSetArray = Array.from(vnfcSet);
        let vnfcSetArrayLen = vnfcSetArray.length;

        for (let i = 0; i < vnfcFunctionCodeArrayList.length; i++) {
            let element = vnfcFunctionCodeArrayList[i];
            for (let j = 1; j < element.length; j++) {
                for (let k = j; k < vnfcSetArrayLen; k++) {
                    if (element[j] === vnfcSetArray[k]) {
                        element[j] = 'Y';
                    }
                    else {
                        element.splice(j, 0, '');
                    }
                    break;
                }
            }
        }
        this.firstArrayElement = vnfcSetArray;
        this.remUploadedDataArray = vnfcFunctionCodeArrayList;
    }
}