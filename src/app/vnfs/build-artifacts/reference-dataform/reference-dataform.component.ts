/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.
===================================================================
Copyright (C) 2018 IBM.
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
import { ReferenceDataFormUtil } from './reference-dataform.util';
import { UtilityService } from '../../../shared/services/utilityService/utility.service';
import { appConstants } from '../../../../constants/app-constants';
// Common Confirm Modal
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from "../../../shared/confirmModal/confirm.component";

declare var $: any;
type AOA = Array<Array<any>>;
const REFERENCE_DATA: string = "reference_data";

@Component({
    selector: 'reference-dataform',
    templateUrl: './reference-dataform.component.html',
    styleUrls: ['./reference-dataform.component.css'],
    providers: [ReferenceDataFormUtil]
})
export class ReferenceDataformComponent implements OnInit {
    public classNm = "ReferenceDataformCompon";
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
    errorMessage = '';
    invalid = true;
    fileName: any;
    vnfcIdentifier = '';
    oldVnfcIdentifier: any;
    public uploadFileName: any;
    public addVmClickedFlag: boolean = false;
    public getExcelUploadStatus: boolean = false;
    public uploadedDataArray: any;
    public actionFlag = false;
    currentAction: any;
    oldAction: any;
    nonConfigureAction: any;
    templateId;
    newVnfcType;
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
        scope: { 'vnf-type': '', 'vnfc-type-list': [] },
        'template': 'Y',
        vm: [],
        'device-protocol': '',
        'user-name': '',
        'port-number': '',
        'artifact-list': []
    };
    public refernceScopeObj = { sourceType: '', from: '', to: '' };
    public actions = [appConstants.Actions.blank,
    appConstants.Actions.configure,
    appConstants.Actions.ConfigModify,
    appConstants.Actions.configBackup,
    appConstants.Actions.configRestore,
    appConstants.Actions.getRunningConfig,
    appConstants.Actions.healthCheck,
    appConstants.Actions.startApplication,
    appConstants.Actions.stopApplication,
    appConstants.Actions.quiesceTraffic,
    appConstants.Actions.resumeTraffic,
    appConstants.Actions.distributeTraffic,
    appConstants.Actions.distributeTrafficCheck,
    appConstants.Actions.upgradeBackout,
    appConstants.Actions.upgradeBackup,
    appConstants.Actions.upgradePostCheck,
    appConstants.Actions.upgradePreCheck,
    appConstants.Actions.upgradeSoftware,
    appConstants.Actions.openStackActions,
    appConstants.Actions.configScaleOut
    ];
    public groupAnotationValue = [appConstants.groupAnotationValue.blank, appConstants.groupAnotationValue.pair];
    public groupAnotationType = [appConstants.groupAnotationType.blank, appConstants.groupAnotationType.firstVnfcName, appConstants.groupAnotationType.fixedValue, appConstants.groupAnotationType.relativeValue];
    public deviceProtocols = [appConstants.DeviceProtocols.blank, appConstants.DeviceProtocols.ansible, appConstants.DeviceProtocols.chef, appConstants.DeviceProtocols.netconfXML, appConstants.DeviceProtocols.rest, appConstants.DeviceProtocols.cli, appConstants.DeviceProtocols.restConf];
    public deviceTemplates = [appConstants.deviceTemplates.blank, appConstants.deviceTemplates.y, appConstants.deviceTemplates.n];
    public sourceTypeColl = [appConstants.sourceTypeColl.blank, appConstants.sourceTypeColl.vnfType, appConstants.sourceTypeColl.vnfcType];
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
    isConfigureAction = false;
    configScaleOutExist: boolean = true;
    displayVnfc = 'false';
    isVnfcType: boolean;
    isVnfcTypeList: boolean = true;
    public actionList = {
        "ConfigScaleOut": "ConfigScaleOut",
        "Configure": "Configure"
    };
    public versionNoForApiCall = "0.0.1";
    private displayVMBlock: boolean = true;

    constructor (
        private buildDesignComponent: BuildDesignComponent,
        private httpUtils: HttpUtilService,
        private route: Router,
        private location: Location,
        private activeRoutes: ActivatedRoute,
        private notificationService: NotificationService,
        private paramShareService: ParamShareService,
        private mappingEditorService: MappingEditorService,
        private modalService: NgbModal,
        private nService: NotificationsService,
        private ngProgress: NgProgress,
        private utilityService: UtilityService,
        private dialogService: DialogService,
        private referenceDataFormUtil: ReferenceDataFormUtil) {
        console.log(this.classNm + ": new: start.");
    }

    ngOnInit() {
        let methName = "ngOnInit";
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": " + methName + ": start.");
        this.displayVnfc = sessionStorage.getItem("vnfcSelectionFlag");
        if (this.configScaleOutExist) {
            this.actions = ['', 'Configure', 'ConfigModify', 'ConfigBackup', 'ConfigRestore', 'GetRunningConfig', 'HealthCheck', 'StartApplication', 'StopApplication', 'QuiesceTraffic', 'ResumeTraffic', 'DistributeTraffic', 'DistributeTrafficCheck', 'UpgradeBackout', 'UpgradeBackup', 'UpgradePostCheck', 'UpgradePreCheck', 'UpgradeSoftware', 'OpenStack Actions', 'ConfigScaleOut'];
        } else {
            this.actions = ['', 'Configure', 'ConfigModify', 'ConfigBackup', 'ConfigRestore', 'GetRunningConfig', 'HealthCheck', 'StartApplication', 'StopApplication', 'QuiesceTraffic', 'ResumeTraffic', 'DistributeTraffic', 'DistributeTrafficCheck', 'UpgradeBackout', 'UpgradeBackup', 'UpgradePostCheck', 'UpgradePreCheck', 'UpgradeSoftware', 'OpenStack Actions'];
        }
        this.self = this;
        let path = this.location.path;
        this.title = 'Reference Data';
        this.referenceDataObject = {
            action: '',
            'action-level': 'vnf',
            scope: { 'vnf-type': '', 'vnfc-type-list': [] },
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
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": ngOnInit: have cacheData.");
            this.tempAllData = cacheData;
            if (this.mappingEditorService.latestAction != undefined) {
                this.referenceDataObject = this.mappingEditorService.latestAction;
                this.toggleIdentifier(this.referenceDataObject.action);
                this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                this.oldAction = this.referenceDataObject.action;
                this.populateExistinAction(this.referenceDataObject.action);
                this.displayHideVnfc();
            }
        } else if (this.updateParams != 'undefined') {
            this.getArtifact();
        }
        var appData = this.mappingEditorService.appDataObject;
        if (appData != null || appData != undefined) this.appData = appData;
        var downloadData = this.mappingEditorService.downloadDataObject;
        if (downloadData != null || downloadData != undefined) this.downloadData = downloadData;
        if (sessionStorage.getItem('vnfParams')) {
            this.vnfParams = JSON.parse(sessionStorage.getItem('vnfParams'));
        }
        if (this.vnfParams && this.vnfParams.vnfType) {
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": " + methName + ": vnfParams.vnfType:[" +
                    this.vnfParams.vnfType + "]");
            this.referenceDataObject['scope']['vnf-type'] = this.vnfParams.vnfType;
        }
        if (this.vnfParams && this.vnfParams.vnfcType) {
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": " + methName + ": vnfParams.vnfcType:[" +
                    this.vnfParams.vnfcType + "]");
            this.referenceDataObject['scope']['vnfc-type'] = this.vnfParams.vnfcType;
        }
        this.uploadedDataArray = [];
        this.remUploadedDataArray = [];
        this.firstArrayElement = [];
        this.uploadFileName = '';
        this.templateIdentifier = this.mappingEditorService.identifier
        this.oldVnfcIdentifier = this.vnfcIdentifier;
        if (this.utilityService.getTracelvl() > 1)
            console.log(this.classNm + ": " + methName + ": displayVnfc:[" +
                this.displayVnfc + "]");
        if (this.utilityService.getTracelvl() > 1)
            console.log(this.classNm + ": " + methName + ": templateIdentifier:[" +
                this.templateIdentifier + "]");
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData(
            { ...this.referenceDataObject, displayVnfc: this.displayVnfc },
            { reqField: this.templateIdentifier });
        //.. configure some drop-downs
        this.configDrp(this.referenceDataObject.action)
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": " + methName + ": finish.");
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": getArtifact: start.");
        try {
            let data = this.utilityService.createPayloadForRetrieve(true, '', '', '');
            this.ngProgress.start();
            this.httpUtils.post({
                url: environment.getDesigns,
                data: data
            }).subscribe(resp => {
                if (this.utilityService.getTracelvl() > 1)
                    console.log(this.classNm + ": getArtifact: got response ...");
                if (resp.output.data.block != undefined) {
                    if (this.utilityService.getTracelvl() > 1)
                        console.log(this.classNm +
                            ": getArtifact: output.data.block not empty.");
                    this.nService.success(appConstants.notifications.titles.status, appConstants.messages.datafetched);
                    let artifactInfo = JSON.parse(resp.output.data.block).artifactInfo[0];
                    let reference_data = JSON.parse(artifactInfo['artifact-content'])['reference_data'][0];
                    this.referenceDataObject = reference_data;
                    this.toggleIdentifier(this.referenceDataObject.action);
                    if (this.referenceDataObject.action == appConstants.Actions.configScaleOut) {
                        this.groupAnotationType = [appConstants.groupAnotationType.blank, appConstants.groupAnotationType.firstVnfcName, appConstants.groupAnotationType.fixedValue, appConstants.groupAnotationType.relativeValue, appConstants.groupAnotationType.existingGroupName];
                    }
                    //chck vnfc or vnfcTypeList
                    this.displayHideVnfc();
                    // Enable or Block Template and PD Tabs
                    this.buildDesignComponent.getRefData(
                        { ...this.referenceDataObject, displayVnfc: this.displayVnfc });
                    this.refernceScopeObj.sourceType = this.referenceDataObject['scopeType'];
                    this.mappingEditorService.getReferenceList().push(JSON.parse(artifactInfo['artifact-content']));
                    this.tempAllData = JSON.parse(artifactInfo['artifact-content'])['reference_data'];
                    this.oldAction = this.referenceDataObject.action;
                    this.oldVnfcIdentifier = this.vnfcIdentifier;
                    if (this.referenceDataObject.action === appConstants.Actions.openStackActions) {
                        this.deviceProtocols = [appConstants.DeviceProtocols.blank, appConstants.DeviceProtocols.openStack];
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
                    this.nService.success('Status', 'Sorry !!! I dont have any artifact Named : ' + (JSON.parse(sessionStorage.getItem('updateParams')))['artifact-name']);
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

    displayHideVnfc() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": displayHideVnfc: start...");
        if (this.utilityService.getTracelvl() > 1) {
            if (this.referenceDataObject.scope['vnfc-type-list']) {
                console.log(this.classNm +
                    ": displayHideVnfc: refDataObj.scope.vnfc-type-list.length=" +
                    this.referenceDataObject.scope['vnfc-type-list'].length);
            } else {
                console.log(this.classNm +
                    ": displayHideVnfc: refDataObj.scope.vnfc-type-list not defined");
            };
            console.log(this.classNm + ": displayHideVnfc: scope.vnfc-type:[" +
                this.referenceDataObject.scope['vnfc-type'] + "]");
        };
        if (this.referenceDataObject.scope['vnfc-type-list'] == undefined && (this.referenceDataObject.scope['vnfc-type'] != undefined || this.referenceDataObject.scope['vnfc-type'] != "")) {
            this.isVnfcType = true
            this.displayVnfc = 'true'
            this.isVnfcTypeList = false
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] != undefined && this.referenceDataObject.scope['vnfc-type-list'].length != 0 && (this.referenceDataObject.scope['vnfc-type'] == undefined || this.referenceDataObject.scope['vnfc-type'] == "")) {
            this.isVnfcType = false
            this.displayVnfc = 'true'
            this.isVnfcTypeList = true
            if (!this.mappingEditorService.newObject.vnfc) {
                this.vnfcIdentifier = this.referenceDataObject.scope['vnfc-type-list'][0];
                // this.mappingEditorService.newObject.vnfc = this.vnfcIdentifier;
                // this.referenceDataObject['vnfcIdentifier'] = this.vnfcIdentifier;

            } else {
                this.vnfcIdentifier = this.mappingEditorService.newObject.vnfc;
            }
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": displayHideVnfc: vnfcIdentifier:[" +
                    this.vnfcIdentifier + "]");
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] != undefined && this.referenceDataObject.scope['vnfc-type-list'].length == 0 && this.referenceDataObject.scope['vnfc-type'] != undefined && this.referenceDataObject.scope['vnfc-type'].length == 0) {
            if (this.displayVnfc == 'true') {
                this.isVnfcType = false
                this.displayVnfc = 'true'
                this.isVnfcTypeList = true
            } else {
                this.isVnfcType = false
                this.displayVnfc = 'false'
                this.isVnfcTypeList = false
            }
        }
        if (this.referenceDataObject.scope['vnfc-type-list'] == undefined && this.referenceDataObject.scope['vnfc-type'] == '') {
            this.isVnfcType = false
            this.displayVnfc = 'false'
            this.isVnfcTypeList = false
        }
        if (this.utilityService.getTracelvl() > 1)
            console.log(this.classNm + ": displayHideVnfc: finish. isVnfcType:[" +
                this.isVnfcType + " displayVnfc:[" + this.displayVnfc + "] isVnfcTypeList:[" +
                this.isVnfcTypeList + "]");
    }

    //reinitializing the required values
    ngOnDestroy() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": ngOnDestroy: start:" +
                " vnfcIdentifier:[" + this.vnfcIdentifier + "]");
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
    // update my vnf pop up session values
    updateSessionValues(event: any, type: string) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": updateSessionValues: type:[" + type + "]");
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

    //validating the vnf and vnfc data in the pop up
    validateVnfcName(name) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": validateVnfcName: start: name:[" + name + "]");
        if (!name.trim() || name.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        } else if (name.startsWith(' ') || name.endsWith(' ')) {
            this.errorMessage = 'Leading and trailing spaces are not allowed';
            this.invalid = true;
        } else if (name.includes('  ')) {
            this.errorMessage = 'More than one space is not allowed in VNFC Type';
            this.invalid = true;
        } else if (name.length > 50) {
            this.errorMessage = 'VNFC Type should be of minimum one character and maximum 50 character';
            this.invalid = true;
        } else {
            this.invalid = false;
            this.errorMessage = '';
        }
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": prepareReferenceObject: start.");
        let scopeName = this.resetParamsOnVnfcType();
        let extension = this.decideExtension(this.referenceDataObject);
        this.prepareArtifactList(scopeName, extension);
        if (this.referenceDataObject.action === 'OpenStack Actions') {
            this.referenceDataObject['template'] = 'N';
            this.referenceDataObject['artifact-list'] = [];
            this.referenceDataObject['firstRowVmSpreadSheet'] = this.firstArrayElement;
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": upload: start.");
        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(evt.target);
        this.uploadFileName = evt.target.files[0].name;
        var fileExtension = this.uploadFileName.substr(this.uploadFileName.lastIndexOf('.') + 1);
        if (target.files.length != 1) {
            console.log(this.classNm + ": upload: Error: got no file !");
            throw new Error(appConstants.errors.multipleFileUploadError);
        }
        console.log(this.classNm + ": upload: filename:[" + evt.target.files[0].name + "]");
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
                    this.nService.success(appConstants.notifications.titles.success, appConstants.messages.vmDataUploadSuccess);

                }
                else {
                    this.nService.success(appConstants.notifications.titles.error, appConstants.messages.emptyVmUpload);
                }
            };
            reader.readAsBinaryString(target.files[0]);
        }
        else {
            this.nService.error(appConstants.notifications.titles.error, appConstants.messages.incorrectVmUpload);
        }

    }

    addVmCapabilitiesData() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": addVmCapabilitiesData: start.");
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": save: start: referenceDataObject.action:[" +
                this.referenceDataObject.action + "]");
        if (this.referenceDataObject.action === '') {
            this.nService.error(appConstants.notifications.titles.error, appConstants.errors.noActionError);
            return;
        }
        if (this.referenceDataObject['device-protocol'] === '') {
            this.nService.error(appConstants.notifications.titles.error, appConstants.errors.noDeviceProtocolError);
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": downloadFile: start.");
        setTimeout(() => {
            saveAs(blob, fileName);
        }, delay)
    }

    downloadTemplate() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": downloadTemplate: start.");
        var fileName = this.downloadData.template.templateFileName;
        console.log(this.classNm + ": downloadTemplate: fileName:[" + fileName + "]");
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

    // save the values to the cache, on action change without download
    validateDataAndSaveToAppc(valid, form, event) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": validateDataAndSaveToAppc: start: valid:" + valid);
        // will show error message
        this.showValidationErrors(this.referenceDataObject);
        try {
            form._submitted = true;
            if (valid) {
                let referenceObject = this.prepareReferenceObject(true);
                let removedKeysArray = []
                this.tempAllData.forEach((data, index) => {
                    if (data.action) {
                        removedKeysArray.push(JSON.parse(JSON.stringify(this.deleteUnwantedKeys(data))))
                    }
                });
                this.tempAllData = removedKeysArray;

                this.validateTempAllData();
                this.saveToAppc();
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

    //this method saves reference, template, param and PD data to APPC
    saveToAppc() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": saveToAppc: start: vnf-type:[" +
                this.referenceDataObject.scope['vnf-type'] + "]");
        let theJSON = JSON.stringify(this.tempAllData);
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": saveToAppc: tempAllData:[" + theJSON + "]");
        let fileName = 'reference_AllAction_' + this.referenceDataObject.scope['vnf-type'].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V.json';
        this.saveReferenceDataToAppc(
            JSON.stringify({ reference_data: this.tempAllData }), this.referenceDataObject.scope['vnf-type'], fileName);

        var templateData = JSON.stringify(this.appData.template.templateData);
        var nameValueData = JSON.stringify(this.appData.template.nameValueData);
        var pdData = JSON.stringify(this.appData.pd);
        if (templateData != '{}' && templateData != null && templateData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.template.templateData, 'template data');
        if (nameValueData != '{}' && nameValueData != null && nameValueData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.template.nameValueData, 'name value pairs');
        if (pdData != '{}' && pdData != null && pdData != undefined) this.referenceDataFormUtil.handleApiData(this.appData.pd, 'PD file');
    }

    // valaidation of template data
    validateTempAllData() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": validateTempAllData: start.");
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

    //.. prepare and send the data to the API.
    saveReferenceDataToAppc(artifactData, vnf_type, fileName) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": saveReferenceDataToAppc: start: vnf_type:[" +
                vnf_type + "]");
        let data = [];
        let slashedPayload = this.referenceDataFormUtil.appendSlashes(artifactData);
        let payload = this.utilityService.createPayLoadForSave("reference_data", vnf_type, "AllAction", fileName, this.versionNoForApiCall, slashedPayload);
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
        console.log(this.classNm + ": retriveFromAppc: start.");
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": fileChange: start.");
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
                        //check for legacy artifact and do not allow it
                        for (let i = 0; i < this.uploadedData.length; i++) {
                            obj = this.uploadedData[i];
                            if (obj.scope['vnfc-type'] != undefined && obj.scope['vnfc-type'] != '') {
                                this.nService.error('Error', 'The legacy reference artifact not supported');
                                return;
                            }
                        }
                        this.displayVnfc = 'false';
                        this.isVnfcType = false;
                        this.isVnfcTypeList = false;
                        for (let i = 0; i < this.uploadedData.length; i++) {
                            obj = this.uploadedData[i];
                            if (obj.scope['vnfc-type-list'] && obj.scope['vnfc-type-list'].length > 0) {
                                this.displayVnfc = 'true';
                                this.isVnfcTypeList = true;
                                this.vnfcIdentifier = obj.scope['vnfc-type-list'][0];
                            }
                        }
                        this.oldAction = obj.action;
                        this.tempAllData = JSON.parse(JSON.stringify(jsonObject));
                        if (this.utilityService.getTracelvl() > 0)
                            console.log(this.classNm + ": fileChange: read & parsed.");
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
                        if (this.utilityService.getTracelvl() > 0)
                            console.log(this.classNm + ": fileChange: " +
                                "referenceDataObject.action:[" +
                                this.referenceDataObject.action + "]");
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
                        this.getArtifactsOpenStack();
                        if (this.referenceDataObject.template == null) {
                            this.referenceDataObject.template = 'Y';
                        }
                        if (this.referenceDataObject['action-level'] == null) {
                            this.referenceDataObject['action-level'] = 'VNF';
                        }
                        if (this.utilityService.getTracelvl() > 0)
                            console.log(this.classNm + ": fileChange: displayVnfc:[" +
                                this.displayVnfc + "]");
                        // Enable or Block Template and PD Tabs
                        this.buildDesignComponent.getRefData(
                            { ...this.referenceDataObject, displayVnfc: this.displayVnfc });
                    } catch (e) {
                        this.nService.error(appConstants.notifications.titles.error, appConstants.messages.incorrectFileFormat);
                    }
                }
                this.hideModal = true;
            });
        } else {
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": fileChange: Error: Failed to read file!");
            this.notificationService.notifyErrorMessage('Failed to read file..');
        }
    }

    public readFile(file, reader, callback) {
        console.log(this.classNm + ": readFile: start.");
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
        console.log(this.classNm + ": clearVnfcData: start.");
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

    // setVnfcType(str: String) {
    //     this.Sample['vnfc-type'] = str;
    // }

    // getChange(value: String) {
    //     if (value === 'vnfType') {
    //         this.referenceDataObject.scope['vnfc-type'] = '';
    //     }
    // }

    resetForm() {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": resetForm: start.");
        this.referenceDataObject['action-level'] = 'vnf';
        this.referenceDataObject.template = 'Y';
        this.referenceDataObject['device-protocol'] = '';
        this.referenceDataObject['user-name'] = '';
        this.referenceDataObject['port-number'] = '';
        this.refernceScopeObj.sourceType = '';
        this.Sample['vnfc-type'] = '';
    }

    // this method gets called with the action as parameter and the respective action details are fetched and assigned to the current page
    populateExistinAction(data) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": populateExistinAction: start.");
        let existAction = this.tempAllData.findIndex(obj => {
            return obj.action == data;
        });
        if (existAction > -1) {
            let obj = $.extend(true, {}, this.tempAllData[existAction]);
            this.referenceDataObject = obj;
            this.referenceDataObject.scope['vnf-type'] = obj['scope']['vnf-type'];
            this.referenceDataObject.scope['vnfc-type-list'] = obj['scope']['vnfc-type-list'];
            this.referenceDataObject['device-protocol'] = obj['device-protocol'];
            this.refernceScopeObj['sourceType'] = obj['scopeType'];
            if (obj['scope']['vnfc-type-list'] != undefined && obj['scope']['vnfc-type-list'].length > 0) {
                this.referenceDataObject['vnfcIdentifier'] = obj['scope']['vnfc-type-list'][0];
            }
        } else {
            if (this.utilityService.getTracelvl() > 0)
                console.log(this.classNm + ": populateExistinAction: action not found");
            this.resetForm();
            this.referenceDataObject.action = data;
        }
        //# iof healthCeck change deviceprotocol drp vaues
        switch (data) {
            case 'HealthCheck':
                this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'REST'];
                this.actionHealthCheck = true;
                break;
            case 'UpgradeBackout':
            case 'ResumeTraffic':
            case 'QuiesceTraffic':
            case 'DistributeTraffic':
            case 'DistributeTrafficCheck':
            case 'UpgradeBackup':
            case 'UpgradePostCheck':
            case 'UpgradePreCheck':
            case 'UpgradeSoftware':
            case 'ConfigRestore':
            case 'StartApplication':
            case 'StopApplication':
            case 'ConfigBackup':
                this.deviceProtocols = ['', 'CHEF', 'ANSIBLE'];
                break;
            case 'OpenStack Actions':
                this.deviceProtocols = ['', 'OpenStack'];
                break;
            case 'ConfigScaleOut':
                this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF'];
                break;
            case 'GetRunningConfig':
                this.deviceProtocols = ['', 'CHEF', 'ANSIBLE', 'NETCONF-XML', 'RESTCONF', 'CLI', 'REST'];
                break;
            default:
                this.deviceProtocols = ['', 'ANSIBLE', 'CHEF', 'NETCONF-XML', 'RESTCONF', 'CLI'];
                this.actionHealthCheck = false;
        }
    }

    //Modal pop up for action change with values entered.
    actionChange(data, userForm) {
        var methName = "actionChange";
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": " + methName + ": start: data:[" + data + "]" +
                " userForm.valid:[" + userForm.valid + "]");
        this.disableGrpNotationValue = false
        if (data == null) {
            console.log(this.classNm + ": " + methName + ": data == null");
            return;
        }
        if ((userForm.valid) && this.oldAction != '' && this.oldAction != undefined) {
            this.actionChanged = true;
            console.log(this.classNm + ": " + methName +
                ": userForm valid and oldAction defined");
            // Calling common Confirmation Modal
            let disposable = this.dialogService.addDialog(ConfirmComponent)
                .subscribe((isConfirmed) => {
                    //We get dialog result
                    console.log(this.classNm + ": " + methName + ":  isConfirmed:[" +
                        isConfirmed + "]");
                    if (isConfirmed) {
                        // User clicked on Yes
                        this.currentAction = this.referenceDataObject.action;
                        console.log(this.classNm + ": " + methName +
                            ": clicked on Yes: currentAction:[" + this.currentAction +
                            "] oldAction:[" + this.oldAction + "]");
                        this.referenceDataObject.action = this.oldAction;
                        $('#saveToAppc').click();//make sure the save all is done before the tempall obj is saved form the API
                        this.toggleIdentifier(data)
                        this.oldAction = this.currentAction;// this.referenceDataObject.action + '';
                        this.referenceDataObject.action = this.currentAction;
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
                        this.getArtifactsOpenStack();

                        // Clears VNFC Information data on action change
                        this.clearVnfcData()
                        this.resetVmsForScaleout(data);
                    }
                    else {
                        // User clicked on No
                        this.toggleIdentifier(data)
                        this.currentAction = this.referenceDataObject.action;
                        console.log(this.classNm + ": " + methName +
                            ": clicked on No: currentAction:[" + this.currentAction + "]");
                        this.populateExistinAction(data);
                        this.resetVmsForScaleout(data);
                        this.oldAction = this.referenceDataObject.action + '';
                        this.clearCache();
                        this.clearVnfcData()
                        this.refernceScopeObj.from = '';
                    }

                    if (this.referenceDataObject.action === 'Configure' || this.referenceDataObject.action === 'ConfigModify' || this.referenceDataObject.action === 'DistributeTraffic' || this.referenceDataObject.action === 'DistributeTrafficCheck') {
                        this.isConfigureAction = true;
                    } else {
                        this.isConfigureAction = false;
                        delete this.mappingEditorService.newObject['vnfc'];
                    }

                    // Enable or Block Template and PD Tabs
                    if (this.currentAction == 'ConfigScaleOut' && this.templateIdentifier && this.templateIdentifier != '') {
                        // let referenceDataObjectTemp = this.referenceDataObject;
                        // referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                        // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
                        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: this.templateIdentifier });

                    } else {
                        this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
                    }
                });
        } else {
            console.log(this.classNm + ": " + methName +
                ": userForm Not valid or oldAction not defined");
            this.actionChanged = true;
            this.currentAction = this.referenceDataObject.action;
            this.oldAction = this.referenceDataObject.action + '';
            this.populateExistinAction(data);
            this.resetVmsForScaleout(data);
            this.toggleIdentifier(data);

            // Enable or Block Template and PD Tabs
            if (this.currentAction == 'ConfigScaleOut' && this.templateIdentifier) {
                // let referenceDataObjectTemp = this.referenceDataObject;
                // referenceDataObjectTemp['template-id'] = this.templateIdentifier;
                // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
                this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc }, { reqField: this.templateIdentifier });
            } else {
                this.buildDesignComponent.getRefData({ ...this.referenceDataObject, displayVnfc: this.displayVnfc });
            }
        }
        this.configDrp(data)
    }

    configDrp(data) {
        console.log(this.classNm + ": configDrp: start: data:[" + data + "]");
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
        if (data == 'Configure' || data == 'ConfigModify' || data == 'DistributeTraffic' || data == 'DistributeTrafficCheck') {
            this.nonConfigureAction = false;
        } else {
            this.nonConfigureAction = true;
        }
    }

    deviceProtocolChange() {
        console.log(this.classNm + ": deviceProtocolChange: start.");
        if (this.referenceDataObject['device-protocol'] == 'REST') {

        } else {
            delete this.referenceDataObject['context-url']
        }
        // Enable or Block Template and PD Tabs
        this.buildDesignComponent.getRefData(
            { ...this.referenceDataObject, displayVnfc: this.displayVnfc },
            { reqField: this.templateIdentifier });
    }

    // used to call or trigger save object on template Identifier changes
    idChange(data, userForm) {
        console.log(this.classNm + ": idChange: start: data:[" + data + "]");
        if (data == null) {
            return;
        }
        // Enable or Block Template and PD Tabs
        // let referenceDataObjectTemp = this.referenceDataObject;
        // referenceDataObjectTemp['template-id'] = data;
        // this.buildDesignComponent.getRefData(referenceDataObjectTemp);
        this.buildDesignComponent.getRefData(
            { ...this.referenceDataObject, displayVnfc: this.displayVnfc },
            { reqField: data });

        if ((userForm.valid)) {
            this.currentAction = "ConfigScaleOut"
            this.oldtemplateIdentifier = this.templateIdentifier
            let referenceObject = this.prepareReferenceObject();
            this.actionChanged = true;
            if (this.templateIdentifier) {
                // Calling common Confirmation Modal
                let disposable = this.dialogService.addDialog(ConfirmComponent)
                    .subscribe((isConfirmed) => {
                        //We get dialog result
                        if (isConfirmed) {
                            // User clicked on Yes
                            this.validateTempAllData();
                            this.saveToAppc();
                            this.clearCache();
                            this.clearVnfcData();
                            this.refernceScopeObj.from = '';
                        }
                        else {
                            // User clicked on No
                            this.clearCache();
                            this.refernceScopeObj.from = '';
                        }
                    });
            }
        } else {
            this.oldtemplateIdentifier = this.templateIdentifier;
        }
    }

    // used to call or trigger save object on multiple VNFC's changes
    vnfcChanged(data, userForm) {
        console.log(this.classNm + ": vnfcChanged: new vnfcIdentifier:[" + data + "]");
        console.log(this.classNm + ": vnfcChanged: oldVnfcIdentifier:[" +
            this.oldVnfcIdentifier + "]");
        console.log(this.classNm + ": vnfcChanged:  scope.vnfc-type:[" +
            this.referenceDataObject.scope['vnfc-type'] + "]");
        this.vnfcIdentifier = data;
        this.clearCache();
        if (data == null) {
            return;
        }
        //.. populate VNFC Type in Sample field
        this.setVnfcTypeInSample(this.vnfcIdentifier);
        // Enable or Block Template and PD Tabs
        let referenceDataObjectTemp = this.referenceDataObject;
        referenceDataObjectTemp['vnfcIdentifier'] = data;
        console.log(this.classNm +
            ": vnfcChanged: displayVnfc:[" + this.displayVnfc + "]");
        this.buildDesignComponent.getRefData(
            { ...this.referenceDataObject, displayVnfc: this.displayVnfc },
            { reqField: data });
        console.log(this.classNm +
            ": vnfcChanged: userForm.valid:[" + userForm.valid + "]");
        if ((userForm.valid) && this.oldVnfcIdentifier != '' && this.oldVnfcIdentifier != undefined) {
            this.currentAction = this.referenceDataObject.action
            this.oldVnfcIdentifier = this.vnfcIdentifier
            let referenceObject = this.prepareReferenceObject();
            this.actionChanged = true;
            if (this.vnfcIdentifier) {
                // Calling common Confirmation Modal
                let disposable = this.dialogService.addDialog(ConfirmComponent)
                    .subscribe((isConfirmed) => {
                        //We get dialog result
                        if (isConfirmed) {
                            // User clicked on Yes
                            this.validateTempAllData();
                            this.saveToAppc();
                            this.clearCache();
                            this.clearVnfcData()
                            this.refernceScopeObj.from = '';
                        }
                        else {
                            // User clicked on No
                            this.clearCache();
                            this.refernceScopeObj.from = '';
                        }
                    });
            }
        } else {
            if (data != null) {
                this.oldVnfcIdentifier = this.vnfcIdentifier
            }
        }
    }

    clearCache() {
        console.log(this.classNm + ": clearCache: start.");
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
        console.log(this.classNm + ": saveTemp: start.");
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
        console.log(this.classNm + ": saveNameValue: start.");
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
        console.log(this.classNm + ": openModel: start: title:[" + title + "]");
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
        // Changing value to blank otherwise it will show previous value in text box of popup
        this.templateId = '';
    }

    // adds the vnfc to the vnfc dropdown list
    addVnfc() {
        var newVnfcTypeV = this.newVnfcType.trim();
        console.log(this.classNm +
            ": addVnfc: start: newVnfcTypeV:[" + newVnfcTypeV + "]");
        if (!(this.referenceDataObject.scope['vnfc-type-list'])) {
            this.referenceDataObject.scope['vnfc-type-list'] = [];
            //  this.vnfcIdentifier = newVnfcTypeV;
        } else if (this.referenceDataObject.scope['vnfc-type-list'].length == 0) {
            //  this.vnfcIdentifier = newVnfcTypeV;
        }
        this.vnfcIdentifier = newVnfcTypeV;
        console.log(this.classNm +
            ": addVnfc: vnfcIdentifier:[" + this.vnfcIdentifier + "]");
        if (!(this.referenceDataObject.scope['vnfc-type-list'].indexOf(newVnfcTypeV) > -1)) {
            this.referenceDataObject.scope['vnfc-type-list'].push(newVnfcTypeV);
        }
        this.tempAllData.forEach(obj => {
            if (obj.action == "Configure" || obj.action == "ConfigModify" || obj.action == "DistributeTraffic"  || obj.action == "DistributeTrafficCheck") {
                obj.scope['vnfc-type-list'] = this.referenceDataObject.scope['vnfc-type-list']
            }
            this.resetArtifactList(obj);
        });
        console.log(this.classNm + ": addVnfc: scope vnfc-type:[" +
            this.referenceDataObject.scope['vnfc-type'] + "]");
        this.setVnfcTypeInSample(newVnfcTypeV);
        // Changing newVnfcType value to blank otherwise it will show previous value in text box of popup
        this.newVnfcType = ''
    }

    resetVms() {
        console.log(this.classNm + ": resetVms: start.");
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
        console.log(this.classNm + ": resetParamsOnVnfcType: start:\n " +
            "ref.DataObject.scope vnfc-type:[" +
            this.referenceDataObject.scope['vnfc-type'] + "]");
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
            if (this.referenceDataObject.action == 'Configure' || this.referenceDataObject.action == 'ConfigModify' || this.referenceDataObject.action == 'DistributeTraffic' || this.referenceDataObject.action == 'DistributeTrafficCheck') {
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
        console.log(this.classNm + ": resetParamsOnVnfcType: return scopeName:[" +
            scopeName + "]");
        return scopeName
    }

    decideExtension(obj) {
        //marking the extension based on the device-protocol selected by the user 
        let extension = '.json';
        switch (obj['device-protocol']) {
            case 'ANSIBLE':
            case 'CHEF':
            case 'CLI':
                extension = '.json';
                break;
            case 'NETCONF-XML':
            case 'REST':
                extension = '.xml';
                break;
        }
        return extension;
    }
    prepareArtifactList(scopeName, extension) {
        console.log(this.classNm + ": prepareArtifactList: start: scopeName:[" +
            scopeName + "] extension:[" + extension + "]");
        this.referenceDataObject['artifact-list'] = [];
        //preparing the artifact list array file names along with extension
        let config_template_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V' + extension;
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
                    config_template_fileName = this.referenceDataObject.action + '_' + scopeName + '_' + '0.0.1V_' + identifiers[x] + extension;

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
        console.log(this.classNm + ": pushOrReplaceTempData: start: action:[" +
            action + "]\n newObj.scope vnfc-type:[" + newObj.scope['vnfc-type'] + "]");
        if (newObj.scope['vnfc-type'] == undefined ||
            newObj.scope['vnfc-type'] == null ||
            newObj.scope['vnfc-type'].length < 1) {
            console.log(this.classNm + ": pushOrReplaceTempData: scope vnfc-type" +
                " is empty.\n vnfcIdentifier:[" + this.vnfcIdentifier + "]");
            if (this.vnfcIdentifier != null && this.vnfcIdentifier != undefined &&
                this.vnfcIdentifier.length > 0) {
                newObj.scope['vnfc-type'] = this.vnfcIdentifier;
            }
        };
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

    // removes the unwanted keys added in the artifact for vnfc level actions
    deleteUnwantedKeys(newObj) {
        console.log(this.classNm + ": deleteUnwantedKeys: start.");
        newObj = JSON.parse(JSON.stringify(newObj))
        delete newObj['template-id']
        delete newObj['vnfcIdentifier']
        if (newObj.action != "ConfigScaleOut") {
            delete newObj['template-id-list']
        }
        if (newObj.action != 'HealthCheck') {
            delete newObj['url'];
        }
        if (newObj.action != "Configure" && newObj.action != "ConfigModify" && newObj.action != "DistributeTraffic" && newObj.action != "DistributeTrafficCheck") {
            newObj.scope['vnfc-type-list'] = [];
        }
        return newObj
    }

    addAllActionObj(newObj, scopeName) {
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": addAllActionObj: start.");
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
        if (this.utilityService.getTracelvl() > 0)
            console.log(this.classNm + ": resetTempData: start.");
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
        console.log(this.classNm + ": getArtifactsOpenStack: start: " +
            "tempAllData length=" + this.tempAllData.length);
        var array = []
        var vnfcFunctionCodeArrayList = [];
        var vnfcSetArray = [];
        for (var i = 0; i < this.tempAllData.length; i++) {
            if (!this.checkIfelementExistsInArray(this.tempAllData[i].action, this.actions) && (this.tempAllData[i].action != 'AllAction')) {
                var vnfcFunctionCodeArray = this.tempAllData[i]["vnfc-function-code-list"]
                vnfcFunctionCodeArrayList.push([this.tempAllData[i].action].concat(this.tempAllData[i]["vnfc-function-code-list"]))
            }
            if (this.tempAllData[i].action === 'OpenStack Actions') {
                vnfcSetArray = this.tempAllData[i]['firstRowVmSpreadSheet']
            }
        }
        console.log(this.classNm + ": getArtifactsOpenStack: vnfcSetArray length=" +
            vnfcSetArray.length);
        if (vnfcSetArray) {
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

    /**
     * Handles the display of VM block based on the action change
     */
    handleVMBlockDisplay() {
        switch (this.referenceDataObject.action) {
            case this.actionList.ConfigScaleOut:
            case this.actionList.Configure:
            case undefined:
            case '':
                this.displayVMBlock = true;
                break;
            default:
                this.displayVMBlock = false;
        }
    }

    //.. check VNFC Type equality in Upper Selection vs entered in Sample field
    checkVnfcTypeEqual(vnfctp: string) {
        var methName = "checkVnfcTypeEqual";
        console.log(this.classNm + ": " + methName + ": vnfctp:[" + vnfctp + "]");
        console.log(this.classNm + ": " + methName + ": vnfcIdentifier:[" +
            this.vnfcIdentifier + "]");
        console.log(this.classNm + ": " + methName + ":  Sample[vnfc-type]:[" +
            this.Sample['vnfc-type'] + "]");
        if (vnfctp != null && vnfctp.length > 0) {
            if (this.vnfcIdentifier != null && this.vnfcIdentifier.length > 0) {
                console.log(
                    this.classNm + ": " + methName + ": compare non empty VNFC Types...");
                if (vnfctp != this.vnfcIdentifier) {
                    console.log(this.classNm + ": " + methName + ": Non-match WARNING !");
                    //.. display in pop-up
                    this.nService.warn('WARNING',
                        "The specified VNFC Types don't match." +
                        " Can cause discrepancy in the artifacts.", this.options);
                } else {
                    console.log(this.classNm + ": checkVnfcTypeEqual: VNFC Types're equal.");
                };
            };
        };
    };

    //.. populating VNFC Type in Sample fields
    setVnfcTypeInSample(vnfctp: string) {
        // if( this.utilityService.getTracelvl() > 0 )
        console.log(this.classNm + ": setVnfcTypeInSample: vnfctp:[" + vnfctp + "]");
        this.Sample['vnfc-type'] = vnfctp;
    };

    // Common method to show validation errors
    private showValidationErrors(referenceDataObject) {
        if (this.referenceDataObject.action === '') {
            this.nService.error('Error', 'Select a valid Action');
            return;
        }
        if (this.referenceDataObject['device-protocol'] === '') {
            this.nService.error('Error', 'Select a valid Device protocol');
            return;
        }

        if (referenceDataObject.action === 'ConfigScaleOut' && !this.templateIdentifier) {
            this.nService.error('Error', 'Select a valid Template Identifier');
        }
    }

    resetArtifactList(obj) {
        console.log(this.classNm + ": resetArtifactList: start...");
        let vnfcTypeList = obj.scope['vnfc-type-list'];
        let vnf = this.referenceDataObject.scope['vnf-type']
        let pd_fileName
        let config_template_fileName
        let configTemplate
        let pdTemplate
        let paramValue
        let param_fileName
        obj['artifact-list'] = [];
        for (var x = 0; x < vnfcTypeList.length; x++) {
            let extension = this.referenceDataFormUtil.decideExtension(obj)
            //for replacing spaces and "/" with "_"
            let type = vnfcTypeList[x].replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '');
            pd_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V.yaml';
            config_template_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V' + extension;
            param_fileName = this.referenceDataObject.action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V.json';
            configTemplate = {
                'artifact-name': 'template_' + config_template_fileName,
                'artifact-type': 'config_template'
            };
            pdTemplate = {
                'artifact-name': 'pd_' + pd_fileName,
                'artifact-type': 'parameter_definitions'
            };
            paramValue = {
                'artifact-name': 'param_' + param_fileName,
                'artifact-type': 'param_values'
            };

            this.referenceDataObject['artifact-list'].push(configTemplate,
                pdTemplate, paramValue
            );
            obj['artifact-list'].push(configTemplate,
                pdTemplate, paramValue
            );
        }
    }
}
