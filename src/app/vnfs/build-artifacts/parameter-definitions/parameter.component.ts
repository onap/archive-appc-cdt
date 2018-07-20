/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Copyright (C) 2018 IBM Intellectual Property. All rights reserved.
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';
import { ParamShareService } from '../../../shared/services/paramShare.service';
import { MappingEditorService } from '../../../shared/services/mapping-editor.service';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { UtilityService } from '../../../shared/services/utilityService/utility.service';
import { environment } from '../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { ParameterDefinitionService } from './parameter-definition.service';
import 'rxjs/add/operator/map';
import { NgProgress } from 'ngx-progressbar';
import { NgxSpinnerService } from 'ngx-spinner';
import { appConstants } from '../../../../constants/app-constants';

let YAML = require('yamljs');

declare var $: any;

@Component({
    selector: 'parameter-form',
    templateUrl: './parameter.component.html',
    styleUrls: ['../reference-dataform/reference-dataform.component.css'],
    providers: [ParameterDefinitionService]
})
export class ParameterComponent implements OnInit {
    public paramForm: any;
    public actionType: any;
    public showFilterFields: boolean;
    public filterByFieldvalues = appConstants.filterByFieldvalues;
    public ruleTypeConfiguaration = appConstants.ruleTypeConfiguaration;
    public requiredValues: boolean[] = appConstants.requiredValues;
    public sourceValues = appConstants.sourceValues;
    public ruleTypeValues = appConstants.ruleTypeValues;
    public typeValues = appConstants.typeValues;
    public responseKeyNameValues = appConstants.responseKeyNameValues;
    public responseKeyValues = appConstants.responseKeyValues;
    public requestKeyNameValues = appConstants.requestKeyNameValues;
    public requestKeyValues = appConstants.requestKeyValues;
    public myKeyFileName = null;
    public myPdFileName = null;
    public disposable: any;
    public confirmation: boolean;
    public showConfirmation: boolean;
    public test: boolean;
    apiToken = localStorage['apiToken'];
    userId = localStorage['userId'];
    public initialData: any;
    public intialData: any;
    public initialAction: any;
    public item: any = {};
    public subscription: any;
    public Actions = [
        { action: appConstants.Actions.configBackup, value: appConstants.Actions.configBackup },
        { action: appConstants.Actions.ConfigModify, value: appConstants.Actions.ConfigModify },
        { action: appConstants.Actions.configRestore, value: appConstants.Actions.configRestore },
        { action: appConstants.Actions.configure, value: appConstants.Actions.configure },
        { action: appConstants.Actions.getRunningConfig, value: appConstants.Actions.getRunningConfig },
        { action: appConstants.Actions.healthCheck, value: appConstants.Actions.healthCheck },
        { action: appConstants.Actions.startApplication, value: appConstants.Actions.startApplication },
        { action: appConstants.Actions.stopApplication, value: appConstants.Actions.stopApplication }
    ];
    public uploadTypes = appConstants.uploadTypes;

    options = appConstants.optionsToNotificationComponent;
    public vnfcTypeData: string = '';
    public selectedUploadType: string;
    @ViewChild(ModalComponent) modalComponent: ModalComponent;
    public title: string;
    public parameterDefinitionMap: { [index: string]: string; } = {};
    public parameterNameValues = {};
    public displayParamObjects;
    public modelParamDefinitionObjects;
    public vnfType: any;
    vnfcType: any;
    protocol: any;
    public refNameObj = {};
    public action;
    public artifactName;
    public appDataObject: any;
    public downloadDataObject: any;
    public artifact_fileName = "";
    identifier: any;
    private selectedActionReference: any;

    constructor(private httpService: HttpUtilService,
        private parameterDefinitionService: ParameterDefinitionService,
        private paramShareService: ParamShareService,
        private mappingEditorService: MappingEditorService,
        private httpUtil: HttpUtilService,
        private utilService: UtilityService,
        private nService: NotificationsService,
        private ngProgress: NgProgress,
        private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
        this.selectedActionReference = this.parameterDefinitionService.prepareFileName();
        if (this.selectedActionReference && this.selectedActionReference != undefined) {

            this.vnfType = this.selectedActionReference.scope['vnf-type'];
            this.vnfcType = this.selectedActionReference.scope['vnfc-type'];
            this.protocol = this.selectedActionReference['device-protocol'];
            this.action = this.selectedActionReference.action;

            for (let i = 0; i < this.selectedActionReference['artifact-list'].length; i++) {
                let artifactList = this.selectedActionReference['artifact-list'];
                if (artifactList[i]['artifact-type'] === 'parameter_definitions') {
                    var artifactName = artifactList[i]['artifact-name'];
                    var artifactNameWithoutExtension = '';
                    if (artifactName) {
                        artifactNameWithoutExtension = artifactName.substring(0, artifactName.lastIndexOf("."));
                    }
                    if (this.mappingEditorService.identifier) {
                        if (artifactNameWithoutExtension.endsWith(this.mappingEditorService.identifier)) {
                            this.artifact_fileName = artifactName;
                        }

                    }
                    else {
                        this.artifact_fileName = artifactName;
                    }
                }
            }
            this.parameterDefinitionService.setValues(this.vnfType, this.vnfcType, this.protocol, this.action, this.artifact_fileName);
        }
        else {
            this.selectedActionReference = {
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

        this.identifier = this.mappingEditorService.identifier;
    }

    ngAfterViewInit() {
        if (this.mappingEditorService.latestAction) {
            this.displayParamObjects = [];
            this.modelParamDefinitionObjects = [];
            if (this.paramShareService.getSessionParamData() != undefined && this.paramShareService.getSessionParamData().length > 0) {
                this.getPDFromSession();
            } else {
                this.ngProgress.start();
                this.getPD();
                setTimeout(() => {
                this.ngProgress.done();
            }, 3500);
            }
        } else {
            this.nService.error(appConstants.errors.error, appConstants.errors["noAction&VNFTypeInRDscreenError"]);
        }
        return this.displayParamObjects;
    }


    public getPD() {
        let result: any;
        let input=this.utilService.createPayloadForRetrieve(false, this.action, this.vnfType,this.artifact_fileName);
        let artifactContent: any;
        return this.httpService.post({
            url: environment.getDesigns,
            data: input
        }).subscribe(data => {
            if (this.utilService.checkResult(data)) {
                let result: any = JSON.parse(data.output.data.block).artifactInfo[0];
                var pdObject = YAML.parse(result['artifact-content']);
                let fileModel = pdObject['vnf-parameter-list'];
                this.displayParamObjects = this.parameterDefinitionService.populatePD(fileModel);
            }
                       
        },

            error => this.nService.error(appConstants.errors.error, appConstants.errors.connectionError));

    }

    public getPDFromSession() {

        this.ngProgress.start();
        return this.httpService.get({
            url: 'testurl',
        }).subscribe(data => {
            this.displayParamObjects = this.paramShareService.getSessionParamData();
            this.ngProgress.done();
        },
            error => {
                this.displayParamObjects = this.paramShareService.getSessionParamData();
                this.ngProgress.done();
            });
    }

    //========================== End of NGInit() Method============================================
    selectedNavItem(item: any) {
        this.item = item;
    }

    //========================== End of selectedNavItem() Method============================================
    browsePdFile() {
        $('#inputFile1').trigger('click');
    }

    //========================== End of browsePdFile() Method============================================
    browseKeyFile() {
        $('#inputFile2').trigger('click');

    }

    //========================== End of browseKeyFile() Method============================================


    //========================== End of appendSlashes() Method============================================


    //========================== End of prepareFileName() Method============================================
    ngOnDestroy() {
        this.parameterDefinitionService.destroy(this.displayParamObjects);
    }

    //========================== End of ngOnDestroy() Method============================================

    public showUpload() {
        this.selectedUploadType = this.uploadTypes[0].value;
    };

    //========================== End of showUpload() Method============================================
    //This is called when the user selects new files from the upload button
    public fileChange(input, uploadType) {
        if (input.files && input.files[0]) {
            this.spinner.show();
            // Create the file reader
            let reader = new FileReader();
            this.readFile(input.files[0], reader, (result) => {
                if ('pdfile' === uploadType) {
                    this.myPdFileName = input.files[0].name;
                    this.displayParamObjects = this.parameterDefinitionService.processPDfile(this.myPdFileName, result);
                }
            });
            setTimeout(() => {
                        /** spinner ends after 3.5 seconds */
                        this.spinner.hide();
          }, 3500);
        }
    }

    //========================== End of fileChange() Method============================================
    public readFile(file, reader, callback) {
        // Set a callback funtion to fire after the file is fully loaded
        reader.onload = () => {
            // callback with the results
            callback(reader.result);
        };
        // Read the file
        reader.readAsText(file, 'UTF-8');
    }

    //========================== End of readFile() Method============================================
    fileChangeEvent(fileInput: any) {
        let obj: any = fileInput.target.files;
    }


    sourceChanged(data, obj) {
        if (data == 'A&AI') {
            obj.ruleTypeValues = appConstants.ruleTypeValues;
            for (let x = 0; x < 5; x++) {
                obj['response-keys'][x]['key-name'] = null;
                obj['response-keys'][x]['key-value'] = null;
            }
        } else if (data == 'Manual') {
            obj.ruleTypeValues = [null];
            obj['rule-type'] = null;
            obj.showFilterFields = false;
            for (let x = 0; x < 5; x++) {
                obj['response-keys'][x]['key-name'] = null;
                obj['response-keys'][x]['key-value'] = null;
            }
        }
        else {
            obj.ruleTypeValues = [null];
        }
    }

    //========================== End of sourceChanged() Method============================================
    ruleTypeChanged(data, obj) {
        if (data == null || data == undefined || data == 'null') {
            obj.showFilterFields = false;
            obj['rule-type'] = null;
            for (let x = 0; x < 5; x++) {
                obj['response-keys'][x]['key-name'] = null;
                obj['response-keys'][x]['key-value'] = null;
            }
        } else {
            let sourceObject = this.ruleTypeConfiguaration[data];
            if (data == 'vm-name-list' || data == 'vnfc-name-list' || data == 'vnfc-oam-ipv4-address-list') {
                this.showFilterFields = false;
                obj.showFilterFields = true;
                this.filetrByFieldChanged(obj['response-keys'][3]['key-value'], obj);
            } else {
                obj.showFilterFields = false;
                obj['response-keys'][3]['key-name'] = null;
                obj['response-keys'][3]['key-value'] = null;
                obj['response-keys'][4]['key-name'] = null;
                obj['response-keys'][4]['key-value'] = null;
            }
            for (let x = 0; x < sourceObject.length; x++) {
                obj['response-keys'][x]['key-name'] = sourceObject[x]['key-name'];
                obj['response-keys'][x]['key-value'] = sourceObject[x]['key-value'];
            }
        }

    }

    //========================== End of ruleTypeChanged() Method============================================
    filetrByFieldChanged(data, obj) {
        if (data == null || data == undefined || data == 'null') {
            obj.enableFilterByValue = false;
            obj['response-keys'][4]['key-value'] = null;
        } else {
            obj.enableFilterByValue = true;
        }

    }


}
