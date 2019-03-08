/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

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


import {Injectable, ViewChild} from '@angular/core';
import {saveAs} from 'file-saver';
import {ParamShareService} from '../../../shared/services/paramShare.service';
import {MappingEditorService} from '../../../shared/services/mapping-editor.service';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {UtilityService} from '../../../shared/services/utilityService/utility.service';
import {NotificationsService} from 'angular2-notifications';
import 'rxjs/add/operator/map';
import { appConstants } from '../../../../constants/app-constants';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';


let YAML = require('yamljs');

declare var $: any;

@Injectable()
export class ParameterDefinitionService {
    clName= "ParameterDefinitionSvc";
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
    public type;
    public appDataObject: any;
    public downloadDataObject: any;
    public artifact_fileName;
    identifier: any;
    public myKeyFileName = null;
    public myPdFileName = null;
    private selectedActionReference: any;
    private apiToken = localStorage['apiToken'];
    private userId = localStorage['userId'];
    public versionNoForApiCall=require('../../../../cdt.application.properties.json').versionNoForApiCall;

    constructor(private mappingEditorService: MappingEditorService,
                private paramShareService: ParamShareService,
                private nService: NotificationsService,
                private httpService: HttpUtilService,
                private utilService: UtilityService) {
    }

    public initialize() {

    }

    public setValues(vnfType, vnfcType, protocol, action, artifactName) {
        this.vnfType = vnfType;
        this.vnfcType = vnfcType;
        this.protocol = protocol;
        this.action = action;
        this.artifact_fileName = artifactName;
        this.appDataObject = this.mappingEditorService.appDataObject;
        this.downloadDataObject = this.mappingEditorService.downloadDataObject;
    }

    public afterInit(artifactName, displayParamObjects) {

    }

    //========================== End of saveChanges() Method============================================
    /* Saves pd to appc */
    public sendPD(yamlString: String) {
        let result: any;
        let input = this.utilService.createPayLoadForSave("pd_data",this.vnfType,this.action,this.artifact_fileName, this.versionNoForApiCall, yamlString);
        /*let payload = '{"userID": "' + this.userId + '","vnf-type" : "' + this.vnfType + '","action" : "' + this.action + '","artifact-name" : "' + this.artifact_fileName + '","artifact-type" : "APPC-CONFIG","artifact-version" : "0.0.1","artifact-contents" : ' + yamlString + '}';
        let input = {
            'input': {
                'design-request': {
                    'request-id': this.apiToken,
                    'action': 'uploadArtifact',
                    'payload': payload
                }
            }
        };*/
        this.appDataObject.pd = input;
    }


    //========================== End of filetrByFieldChanged() Method============================================
    removeUnwantedvalues(obj) {
        let result = Object.assign({}, obj);
        result['vnf-parameter-list'].forEach(obj => {
            delete obj['ruleTypeValues'];
            delete obj['showFilterFields'];
            delete obj['enableFilterByValue'];
        });
        return result;
    }

    //.. setup display of each parameter row depending on the paramater name,
    //   pre-set values of source and rule-type fields (columns)
    populateDataUponSource( displayParamObjects) {
      var methName= "populateDataUponSource";
      if( this.utilService.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": start: displayParamObjects "+
          "length="+displayParamObjects.length );
        displayParamObjects.forEach( parameter => {
          if( this.utilService.getTracelvl() > 0 )
            console.log( this.clName+": "+methName+": param: name:["+
              parameter.name+"] source:["+
              parameter.source+"] rule-type:["+parameter['rule-type']+"]");
            if( parameter.name == 'NodeList-DD') {
              if( this.utilService.getTracelvl() > 0 )
                console.log( this.clName+": "+methName+": the Param is NodeList");
              parameter.source= "DataDictionary";
            }
            else if( parameter.name == 'vnfName-DD' ) {
              if( this.utilService.getTracelvl() > 0 )
                console.log( this.clName+": "+methName+": the Param's vnfName-DD");
              parameter.source= "A&AI";
              parameter['rule-type']= "vnf-name";
            };
            if( parameter.source == 'A&AI') {
              parameter.ruleTypeValues = [null, 'vnf-name', 'vm-name-list', 'vnfc-name-list', 'vnf-oam-ipv4-address', 'vnfc-oam-ipv4-address-list'];
              if( parameter['rule-type'] == 'vm-name-list' ||
                  parameter['rule-type'] == 'vnfc-name-list' ||
                  parameter['rule-type'] == 'vnfc-oam-ipv4-address-list')
              {
                 parameter.showFilterFields = true;
                 parameter.enableFilterByValue = false;
              } else {
                 parameter.showFilterFields = false;
              }
            }
            else if( parameter.source == 'Manual') {
                parameter.ruleTypeValues = [null];
            }
            else if( parameter.source == 'DataDictionary') {
                parameter.sourceValues = ['DataDictionary'];
                parameter.ruleTypeValues = ['NodeList'];
                parameter['rule-type']= 'NodeList';
            }
            else {
                parameter.ruleTypeValues = [parameter['rule-type']];
            }
          //.. print-out the parameter's drop-downs for source and rule-type
          if( this.utilService.getTracelvl() > 1 ) {
            if( parameter.sourceValues != null &&
                parameter.sourceValues != undefined )
            {
              console.log( this.clName+": "+methName+": sourceValues length="+
                parameter.sourceValues.length );
              if( parameter.sourceValues.length > 0 ) {
                for( var i0=0; i0 < parameter.sourceValues.length; i0++ )
                  console.log( methName+": sourceValues["+i0+"]:["+
                    parameter.sourceValues[i0]+"]");
              };
            };
            if( parameter.ruleTypeValues != null &&
                parameter.ruleTypeValues != undefined )
            {
              console.log( this.clName+": "+methName+": ruleTypeValues length="+
                parameter.ruleTypeValues.length );
              if( parameter.ruleTypeValues.length > 0 ) {
                for( var i0=0; i0 < parameter.ruleTypeValues.length; i0++ )
                  console.log( methName+": ruleTypeValues["+i0+"]:["+
                    parameter.ruleTypeValues[i0]+"]");
              };
            };
          };
        });
    }

    //========================== End of getPD() Method============================================
    populatePD(result: any) {
        let fileContent = JSON.stringify(result);
        //Added code to deserialize, serialize and format the response keys for display purposes ??May be unneessary?? To Do: - Check 
        let fileObj = JSON.parse(fileContent);
        this.displayParamObjects = this.formatFileContentForDisplay(fileObj);
        this.populateDataUponSource( this.displayParamObjects);
        this.formatResponseForKey(this.displayParamObjects);
        if (undefined !== this.displayParamObjects)
            this.modelParamDefinitionObjects = this.displayParamObjects;
        if (this.displayParamObjects !== undefined && this.displayParamObjects.length > 0) {
            this.paramShareService.setSessionParamData(this.displayParamObjects);
        }
        return this.displayParamObjects;
    }

    /* Formats each object read from YAML file as per page expectations */
    formatResponseForKey(param: any[]) {
        for (var i = 0; i < param.length; i++) {
            this.formatKeys(param[i]);
        }
    }

    //========================== End of formatResponseForKey() Method============================================
    /* Formats for responsekeys of each object */
    formatKeys(parameterDefinitionObject: any) {
        if (null == parameterDefinitionObject || undefined === parameterDefinitionObject)
            return;
        if (null == parameterDefinitionObject['response-keys'])
            parameterDefinitionObject['response-keys'] = [{}];
        for (var j = 0; j < 5; j++) {
            var keysObj = {
                'key-name': null,
                'key-value': null
            };
            if (undefined == parameterDefinitionObject['response-keys'][j] || null == parameterDefinitionObject['response-keys'][j]) {
                parameterDefinitionObject['response-keys'].push(keysObj);
            }
            if (undefined == parameterDefinitionObject['response-keys'][j]['key-name']) {
                parameterDefinitionObject['response-keys'][j]['key-name'] = null;
            }
            if (undefined == parameterDefinitionObject['response-keys'][j]['key-value']) {
                parameterDefinitionObject['response-keys'][j]['key-value'] = null;
            }
        }
        if (null == parameterDefinitionObject['request-keys'])
            parameterDefinitionObject['request-keys'] = [{}];
        for (var k = 0; k < 3; k++) {
            var keysObj = {
                'key-name': null,
                'key-value': null
            };
            if (undefined == parameterDefinitionObject['request-keys'][k] || null == parameterDefinitionObject['request-keys'][k]) {
                parameterDefinitionObject['request-keys'].push(keysObj);
            }
            if (undefined == parameterDefinitionObject['request-keys'][k]['key-name']) {
                parameterDefinitionObject['request-keys'][k]['key-name'] = null;
            }
            if (undefined == parameterDefinitionObject['request-keys'][k]['key-value']) {
                parameterDefinitionObject['request-keys'][k]['key-value'] = null;
            }
        }
    }
    //========================== End of formatKeys() Method============================================

    //Send null if there are no keys present - Check with key names being absent
    formatKeysForFileGeneration() {
        for (var i = 0; i < this.modelParamDefinitionObjects.length; i++) {
            if (this.modelParamDefinitionObjects[i]['response-keys'][0]['key-name'] == null && this.modelParamDefinitionObjects[i]['response-keys'][1]['key-name'] == null && this.modelParamDefinitionObjects[i]['response-keys'][2]['key-name'] == null)
                this.modelParamDefinitionObjects[i]['response-keys'] = null;
            if (this.modelParamDefinitionObjects[i]['request-keys'][0]['key-name'] == null && this.modelParamDefinitionObjects[i]['request-keys'][1]['key-name'] == null && this.modelParamDefinitionObjects[i]['request-keys'][2]['key-name'] == null)
                this.modelParamDefinitionObjects[i]['request-keys'] = null;
        }
    }

    //========================== End of formatKeysForFileGeneration() Method============================================
    /* Fn to restore response keys in desired format per backend consumption*/
    processResponseKeys(saveModel: any[]) {
        for (var i = 0; i < saveModel.length; i++) {
            if (saveModel[i]['response-keys'] != null) {
                saveModel[i]['response-keys-new'] = [{}];
                saveModel[i]['response-keys-new'][0] = {};//An array of objects ?? so accessing first element
                if (undefined != saveModel[i]['response-keys'][0]['key-name'] && undefined != saveModel[i]['response-keys'][0]['key-value']) {
                    let keyName1 = saveModel[i]['response-keys'][0]['key-name'];
                    saveModel[i]['response-keys-new'][0][keyName1] = saveModel[i]['response-keys'][0]['key-value'];
                }
                if (undefined != saveModel[i]['response-keys'][1]['key-name'] && undefined != saveModel[i]['response-keys'][1]['key-value']) {
                    let keyName2 = saveModel[i]['response-keys'][1]['key-name'];
                    saveModel[i]['response-keys-new'][0][keyName2] = saveModel[i]['response-keys'][1]['key-value'];
                }
                if (undefined != saveModel[i]['response-keys'][2]['key-name'] && undefined != saveModel[i]['response-keys'][2]['key-value']) {
                    let keyName3 = saveModel[i]['response-keys'][2]['key-name'];
                    saveModel[i]['response-keys-new'][0][keyName3] = saveModel[i]['response-keys'][2]['key-value'];
                }
                if (saveModel[i]['response-keys'][3]['key-value'] != undefined && saveModel[i]['response-keys'][3]['key-value'] != null) {
                    let keyName4 = saveModel[i]['response-keys'][3]['key-name'];
                    saveModel[i]['response-keys-new'][0]['filter-by-key'] = saveModel[i]['response-keys'][3]['key-value'];
                }
                if (saveModel[i]['response-keys'][4]['key-value'] != undefined && saveModel[i]['response-keys'][4]['key-value'] != null) {
                    let keyName4 = saveModel[i]['response-keys'][4]['key-name'];
                    saveModel[i]['response-keys-new'][0]['filter-by-value'] = saveModel[i]['response-keys'][4]['key-value'];
                }
            }
            else {
                saveModel[i]['response-keys-new'] = null;
            }
            delete saveModel[i]['response-keys'];
            saveModel[i]['response-keys'] = saveModel[i]['response-keys-new'];
            delete saveModel[i]['response-keys-new'];
        }
        return saveModel;
    }

    //========================== End of processResponseKeys() Method============================================
    /*Fn to format response keys for front end display */
    formatFileContentForDisplay(fileModel: any[]) {
        for (var i = 0; i < fileModel.length; i++) {
            if (undefined != fileModel[i]['response-keys']) {
                let testObj = fileModel[i]['response-keys'];
                let keyNum = 0;
                fileModel[i]['response-keys-new'] = [{}];
                for (var prop in testObj[0]) {
                    if (testObj[0].hasOwnProperty(prop)) {
                        let key = prop;
                        fileModel[i]['response-keys-new'][keyNum] = {};
                        fileModel[i]['response-keys-new'][keyNum]['key-name'] = key;
                        fileModel[i]['response-keys-new'][keyNum]['key-value'] = testObj[0][key];
                    }
                    keyNum++;
                }
                delete fileModel[i]['response-keys'];
                fileModel[i]['response-keys'] = fileModel[i]['response-keys-new'];
                delete fileModel[i]['response-keys-new'];
            }
        }
        return fileModel;
    }

    //========================== End of openModal() Method============================================
    getCorrectParameterDefinitionObject(paramName: string) {
        var result = {
            'obj': {},
            'present': false
        };
        for (var i = 0; i < this.modelParamDefinitionObjects.length; i++) {
            var paramObj = this.modelParamDefinitionObjects[i];
            if (paramObj.name === paramName) {
                result.obj = this.modelParamDefinitionObjects[i];
                result.present = true;
                return result;
            }
        }
        var parameterDefinitionObject = {
            'name': paramName,
            'type': null,
            'description': null,
            'required': null,
            'default': null,
            'source': null,
            'rule-type': null,
            'response-keys': [{}],
            'request-keys': [{}]
        };
        result.obj = parameterDefinitionObject;
        result.present = false;
        return result;
    }

    //========================== End of clearSessionStorageForParam() Method============================================
    isValidateSourceAndResponseKeys(objs: any[]) {
        let isValid = true;
        if (undefined != objs || null != objs) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].source == 'INSTAR' && (null == objs[i]['response-keys'] || undefined == objs[i]['response-keys'])) {
                    isValid = false;
                    return isValid;
                }
            }
        }
        return isValid;
    }


    
    public destroy(displayParamObjects) {
        this.displayParamObjects = displayParamObjects;
        if (this.mappingEditorService.referenceNameObjects) {
            this.saveChanges('send');
            this.saveChanges('download');
            this.mappingEditorService.changeNavAppData(this.appDataObject);
            this.mappingEditorService.changeNavDownloadData(this.downloadDataObject);
        }
    }

    //========================== End of fileChangeEvent() Method============================================
    /* Saves pd file in YAML format */
    public saveChanges(downLoadOrSend: String) {
        if (undefined != this.displayParamObjects && null != this.displayParamObjects && this.displayParamObjects.length > 0) {
            this.paramShareService.setSessionParamData(this.displayParamObjects);

            //Generate File Name per given rules - if not, return without saving
            this.modelParamDefinitionObjects = this.displayParamObjects.slice(0);
            this.paramShareService.setDisplayData(this.displayParamObjects);
            this.formatKeysForFileGeneration();
            //Added code to serialize, deserialize and then make changes needed to save response keys as needed in pd file
            let jsonString = JSON.stringify(this.modelParamDefinitionObjects, null, '\t');
            jsonString = jsonString.replace(/"null"/g, 'null');
            let saveModel = JSON.parse(jsonString);
            let pdFileObject = this.processResponseKeys(saveModel);
            //Validate for Source =INSTAR and responsekeys present
            if (this.isValidateSourceAndResponseKeys(pdFileObject)) {
                let yamlObject = {
                    'kind': 'Property Definition',
                    'version': 'V1',
                    'vnf-parameter-list': []
                };
                yamlObject['vnf-parameter-list'] = pdFileObject;
                yamlObject = this.removeUnwantedvalues(yamlObject);
                let yamlStringTemp = YAML.stringify(yamlObject, 6, 1);
                var re = /\'/gi;
                var newYamlStringTemp = yamlStringTemp.replace(re, '"');
                var re2 = / -\n  +/gi;
                var newYamlStringTemp2 = newYamlStringTemp.replace(re2, '- ');
                let yamlString = '---\n' + newYamlStringTemp2;
                if (downLoadOrSend === 'download') {
                    var blob = new Blob([yamlString], {
                        type: 'text/plain'
                    });
                    //let fileName = "pd_" + this.action + "_" + this.type + "_0.0.1V.yaml"
                    this.downloadDataObject.pd.pdData = yamlString;
                    this.downloadDataObject.pd.pdFileName = this.artifact_fileName;
                }
                else {
                    this.sendPD(JSON.stringify(yamlString));
                }
            }
            else {
                for (var i = 0; i < this.modelParamDefinitionObjects.length; i++) {
                    this.formatKeys(this.modelParamDefinitionObjects[i]);
                }
                this.nService.error('Error', 'Response Keys cannot be empty if source is INSTAR');
                return;
            }
            //Restore Keys for display
            for (var i = 0; i < this.modelParamDefinitionObjects.length; i++) {
                this.formatKeys(this.modelParamDefinitionObjects[i]);
            }
        }

    }


    //This method will create parameter definitions as an array of objects from template name-value pairs and associative array for value from external key file if present
    createOrUpdateParameterDefinitionData(usecase) {
        this.parameterNameValues = JSON.parse(localStorage['paramsContent']);
        this.parameterDefinitionMap = this.paramShareService.getData();
        //Return if there are no name-value pairs or send some alert notification
        if (undefined != this.modelParamDefinitionObjects && this.modelParamDefinitionObjects.length > 0 && usecase == 'create') {
            //Do not recreate if object is already created
            return;
        }
        else {
        }
        this.parameterDefinitionMap = this.paramShareService.getData();
        //To Do:: Add Check for empty parameterDefinitionmap
        var nameValueObj = {}, pName, pValue;
        for (var key in this.parameterNameValues) {
            if (this.parameterNameValues.hasOwnProperty(key)) {
                pName = key;
                pValue = this.parameterNameValues[key];
            }

            if (this.parameterDefinitionMap !== undefined)
            //Check if parameter exists - if so, just update the keys, else create new object
                var result = this.getCorrectParameterDefinitionObject(pName);
            var parameterDefinitionObject = result.obj;
            if (parameterDefinitionObject['source'] != 'A&AI' && (undefined !== this.parameterDefinitionMap) && (undefined !== this.parameterDefinitionMap[pValue.toUpperCase()])) {
                var fields = this.parameterDefinitionMap[pValue.toUpperCase()].split('|');
                //Starts with 2, first vallue is source, second is rule-type
                let respInd = 0;
                for (var i = 2; i < fields.length; i += 2) {
                    parameterDefinitionObject['response-keys'][respInd] = {};
                    parameterDefinitionObject['response-keys'][respInd]['key-name'] = fields[i];
                    if ((i + 1) < fields.length) {
                        parameterDefinitionObject['response-keys'][respInd]['key-value'] = fields[i + 1];
                    }
                    respInd++;
                }
                parameterDefinitionObject['source'] = fields[0];
                parameterDefinitionObject['rule-type'] = fields[1];
            } else {
                if (parameterDefinitionObject['source'] === 'INSTAR') {
                    parameterDefinitionObject['source'] = 'Manual';
                    parameterDefinitionObject['ruleTypeValues'] = [null];
                    parameterDefinitionObject['rule-type'] = null;
                    parameterDefinitionObject['showFilterFields'] = false;
                    for (let x = 0; x < 5; x++) {
                        parameterDefinitionObject['response-keys'][x]['key-name'] = null;
                        parameterDefinitionObject['response-keys'][x]['key-value'] = null;
                    }
                }
            }
            this.formatKeys(parameterDefinitionObject); //Ensure there are 3 elements for response-keys, request-keys for display purposes
            if (!result.present) { //only push if not present
                this.modelParamDefinitionObjects.push(parameterDefinitionObject);
            }
        }
        for (var indx in this.modelParamDefinitionObjects) {
            if (this.modelParamDefinitionObjects[indx] != undefined && (this.modelParamDefinitionObjects[indx].source == undefined || this.modelParamDefinitionObjects[indx].source == null || this.modelParamDefinitionObjects[indx].source == '')) {
                this.modelParamDefinitionObjects[indx].source = 'Manual';
            }
        }
        this.displayParamObjects = this.modelParamDefinitionObjects.slice(0);
        this.paramShareService.setDisplayData(this.displayParamObjects);
    }

    public processKeyFile(fileName, result) {
        this.myKeyFileName = fileName;
        if (!this.myKeyFileName.endsWith('.txt')) {
            this.nService.error(appConstants.notifications.titles.error, appConstants.errors.notTxtFileError);
        }
        this.parameterDefinitionMap = {};
        var rows = result.split(/\r\n|\r|\n/g);
        for (var i = 1; i < rows.length; i++) { //Omit headings, so start from 1
            let ind = rows[i].indexOf('|');
            let key = rows[i].slice(0, ind);
            let value = rows[i].slice(ind + 1);
            this.parameterDefinitionMap[key.toUpperCase()] = value;
        }
        this.paramShareService.setData(this.parameterDefinitionMap);
        //this.notificationService.notifySuccessMessage('External Key file successfully uploaded..');
        let sessionVar = [{}];
        sessionVar = this.paramShareService.getSessionParamData();
        if (sessionVar !== undefined && sessionVar != null && sessionVar.length > 0) {
            if (undefined == this.displayParamObjects)
                this.displayParamObjects = this.modelParamDefinitionObjects = [];
            this.displayParamObjects = sessionVar;
            this.modelParamDefinitionObjects = this.displayParamObjects;
            if (localStorage['paramsContent'] && (undefined !== this.displayParamObjects) && (this.displayParamObjects.length > 0)) {
                this.createOrUpdateParameterDefinitionData('update');
                //update the session variable with the updated data
                this.paramShareService.setSessionParamData(this.displayParamObjects);
            }
        } else {
            this.displayParamObjects = this.modelParamDefinitionObjects = [];
        }
        this.populateDataUponSource(this.displayParamObjects);
        return this.displayParamObjects;
    }

    public processPDfile(fileName, result) {
        this.myPdFileName = fileName;
        if (!this.myPdFileName.endsWith('.yaml')) {
            this.nService.error(appConstants.notifications.titles.error, appConstants.errors.notYAMLFileError);
        }
        var pdObject = YAML.parse(result);
        let fileModel = pdObject['vnf-parameter-list'];
        this.populatePD(fileModel);
        return this.displayParamObjects;
    }
}