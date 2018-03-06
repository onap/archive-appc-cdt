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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
//import { ModalComponent } from '../../modal/modal.component';
import { HttpUtilService } from '../../../../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../../../../shared/services/mapping-editor.service';
import { ArtifactRequest } from '../../../../shared/models/index';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationsService } from 'angular2-notifications';
import { ParamShareService } from '../../../../shared/services/paramShare.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from '../../../../shared/confirmModal/confirm.component';
import { BuildDesignComponent } from '../../build-artifacts.component';
import { environment } from '../../../../../environments/environment';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgProgress } from 'ngx-progressbar';
declare var $: any

@Component({ selector: 'app-golden-configuration', templateUrl: './template-configuration.component.html', styleUrls: ['./template-configuration.component.css'] })
export class GoldenConfigurationComponent implements OnInit {
  @ViewChild('templateeditor') templateeditor;
  @Input() configMappingEditorContent: string;
  @Input() isMappingComp: boolean;
  @ViewChild('myInput') myInputVariable: any;
  // @ViewChild(ModalComponent) modalComponent: ModalComponent;
  @ViewChild('myModal') modal: ModalComponent;
  aceText: string = ""
  fileName: string = ""
  showTemplateVersionDiv: any;
  downloadedTemplateFileName: any;
  downloadedParamFileName: any;
  templateVersionNo: any = '0.0.1';
  saveToGuiCacheFlag = 'false';
  initialAction: any;
  public referenceData: Array<Object> = [];
  public scopeName: any;
  public subscription: any;
  public item: any = {};
  public goldenActions: Array<string> = [];
  public refNameObj = {};
  public action = '';
  public artifactName = '';
  public type;
  public showError: boolean = false;
  public tempretrieveFlag: boolean = false;
  public fileNameForTempSave;
  initialData: any;
  showDownloadDiv: boolean = false;
  downloadType: any;
  enableBrowse: boolean = true;
  enableMerge: boolean = false;
  uploadValidationSuccess: boolean = false;
  fileExtension: any = "xml";
  apiToken = localStorage['apiToken'];
  public appDataObject: any;
  public downloadDataObject: any;
  public checkNameEntered: boolean = true;
  public selectedWord: any = this.mappingEditorService.getSelectedWord();
  public Actions = [
    { action: "ConfigBackup", value: "ConfigBackup" },
    { action: "ConfigModify", value: "ConfigModify" },
    { action: "ConfigRestore", value: "ConfigRestore" },
    { action: "Configure", value: "Configure" },
    { action: "GetRunningConfig", value: "GetRunningConfig" },
    { action: "HealthCheck", value: "HealthCheck" },
    { action: "StartApplication", value: "StartApplication" },
    { action: "StopApplication", value: "StopApplication" }
  ];
  options = {
    timeOut: 1000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 200
  }
  public replaceWord;
  public enableDownloadButtons: boolean = false;
  constructor(private buildDesignComponent: BuildDesignComponent, private paramShareService: ParamShareService, private dialogService: DialogService, private notificationService: NotificationService, private httpUtil: HttpUtilService, private mappingEditorService: MappingEditorService, private activeRoutes: ActivatedRoute, private router: Router, private nService: NotificationsService, private ngProgress: NgProgress) {
    this.artifactRequest.action = '';
    this.artifactRequest.version = '';
    this.artifactRequest.paramsContent = '{}';
    this.artifactRequest.paramKeysContent = '';
  }
  public templateEditor: any;
  public fileType: any = '';
  public actionType: any;
  public myfileName: any;
  userId = localStorage['userId'];
  public artifactRequest: ArtifactRequest = new ArtifactRequest();
  public showUploadStatus: boolean = false;
  public uploadStatus: boolean = false;
  public uploadTypes = [
    {
      value: 'Generated Template',
      display: 'Sample Json Param File'
    },
    {
      value: 'Mapping Data',
      display: 'Sample Json Param File'
    }
  ];
  vnfType: any = '';
  vnfcType: any = '';
  protocol: any = '';
  refObj: any;
  editor: any;
  editorContent: any;
  tempName: any;
  enableValidateTemplate: boolean = false;;
  public selectedUploadType: string = this.uploadTypes[0].value;
  identifier: any;
  public tempRetrievalResponse:any;
  public mergeStatus:boolean=false;
  //this.mappingeditorservice.referenceNameObjects = object;PLEASE USE THIS OBJECT TO GET TEMPALLDATA
  //====================================================
  ngOnInit() {
    var refObj = this.refObj = this.prepareFileName();
    // console.log("Ref object:  " + JSON.stringify(refObj))
    if (refObj && refObj != undefined) {
      // refObj = refObj[refObj.length - 1];
      this.item = refObj;

      this.vnfType = this.item.scope["vnf-type"];
      this.vnfcType = this.item.scope["vnfc-type"];
      this.protocol = this.item['device-protocol'];
      this.action = this.item.action;
      this.artifactRequest.action = this.item.action;
      this.artifactRequest.vnfType = this.vnfType;
      if (this.vnfcType != undefined && this.vnfcType.length != 0) {
        this.scopeName = this.vnfcType;
      }
      else {
        this.scopeName = this.vnfType;
      }
    }
    else {
      this.item = { "action": "", "scope": { "vnf-type": "", "vnfc-type": "" }, "vm": [], "protocol": "", "download-dg-reference": "", "user-name": "", "port-number": "", "artifact-list": [], "deviceTemplate": "", "scopeType": "" };
    }
    this.initialAction = this.item.action;
    this.activeRoutes.url.subscribe(UrlSegment => {
      this.actionType = UrlSegment[0].path
    })
    /*if (this.actionType === 'createTemplate') {
      this.mappingEditorService.fromScreen = 'TemplateScreen';
    }
    if (this.actionType === 'updateTemplate') {*/
    this.mappingEditorService.fromScreen = 'MappingScreen';
    // }
    this.identifier = this.mappingEditorService.identifier;
  }
  //========================== End of ngOnInit() Method============================================
  ngOnDestroy() {
    //console.log("Reference object =="+ JSON.stringify(this.refObj));
    if (this.refObj && this.refObj != undefined) {
      if (this.configMappingEditorContent && this.configMappingEditorContent != undefined) {
        this.saveTemplate();
        this.prepareAppData();
        this.prepareDownloadData();
        this.mappingEditorService.changeNavAppData(this.appDataObject);
        this.mappingEditorService.changeNavDownloadData(this.downloadDataObject);
      }
    }
  }
  //========================== End of ngOnDestroy() Method============================================
  ngAfterViewInit() {
    if (this.mappingEditorService.latestAction) {
      this.refNameObj = this.mappingEditorService.latestAction;
      if (this.vnfcType !== 'null') {
        this.type = this.vnfcType;
      }
      else {
        this.type = this.vnfType;
      }
      for (let i = 0; i < this.refNameObj['artifact-list'].length; i++) {
        let artifactList = this.refNameObj['artifact-list'];
        if (artifactList[i]['artifact-type'] === 'config_template') {
          this.artifactName = artifactList[i]['artifact-name'];
        }
      }
    }
    let self = this;
    this.templateEditor = self.templateeditor.getEditor();
    /* this.templateeditor.getEditor().commands.addCommand({
       name: 'annotateCommand',
       bindKey: { win: 'Ctrl-4', mac: 'Command-4' },
       exec: function (editor) {
         self.mappingEditorService.checkMethodCall(this.modal);
       }
     });*/
    this.templateeditor.getEditor().commands.addCommand({
      name: 'annotateCommand',
      bindKey: { win: 'ENTER', mac: 'ENTER' },
      exec: (editor: any) => {
        this.handleAnnotation(this.modal);
      }
    });
    if (this.mappingEditorService.fromScreen === 'MappingScreen') {
      this.configMappingEditorContent = this.mappingEditorService.getTemplateMappingDataFromStore();
      this.fileType = sessionStorage.getItem('fileType');
    }
    /*  else if (this.mappingEditorService.fromScreen === 'TemplateScreen') {
        this.configMappingEditorContent = this.mappingEditorService.getTemplateDataFromStore();
        this.fileType = sessionStorage.getItem('fileType');
      }*/
    if (this.configMappingEditorContent) {
      this.artifactRequest.templateContent = this.configMappingEditorContent;
      this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent, this.modal);
    }
    if (this.refObj) {
      if (this.mappingEditorService.getTemplateMappingDataFromStore() && this.mappingEditorService.getTemplateMappingDataFromStore() != undefined) {
        this.configMappingEditorContent = this.mappingEditorService.getTemplateMappingDataFromStore();
      }
      else {
        if (this.artifactName) this.retrieveTemplateFromAppc();
      }
    }
    else {
      this.Actions = [];
      this.enableBrowse = false;
      this.nService.error("Error", "Please enter Action and VNF type in Reference Data screen");
    }
  }

  //========================== End of ngAfterViewInit() Method============================================
  browseOption() {
    $("#inputFile").trigger('click');
  }
  //========================== End of browseOption() Method============================================
  /* openFile(event) {
     let input = event.target;
     this.fileName = event.currentTarget.value.replace(/C:\\fakepath\\/i, '');
     for (let index = 0; index < input.files.length; index++) {
       let reader = new FileReader();
       reader.onload = () => {
         this.configMappingEditorContent = reader.result;
       }
       reader.readAsText(input.files[index]);
     };
   }
   //========================== End of openFile() Method============================================*/
  //save to GUI
  public saveTemplate() {
    this.saveToGuiCacheFlag = 'true';
    this.mappingEditorService.paramData = [];
    if (this.configMappingEditorContent) {
      this.initialData = this.configMappingEditorContent;
      this.mappingEditorService.refreshEditor();
      let paramArr: any = []
      if (this.mappingEditorService.paramData && this.mappingEditorService.paramData != undefined) {
        if (this.mappingEditorService.paramData.length === 0 && this.mappingEditorService.hasErrorCode === true) {
          this.nService.error("Error", 'Special characters error', 'Error')
          return;
        }
        else {
          this.showError = false;
        }
      }
      this.showTemplateVersionDiv = true;

      if (this.mappingEditorService.fromScreen === 'MappingScreen') {
        this.mappingEditorService.setTemplateMappingDataFromStore(this.configMappingEditorContent);
      }
      if (this.fileType === 'text/xml') {
        sessionStorage.setItem('fileType', 'text/xml');
      }
      if (this.fileType === '') {
        sessionStorage.setItem('fileType', '');
      }
      // paramArr = this.mappingEditorService.paramData;
      // this.paramShareService.setTemplateData(paramArr)
    }
  }
  //========================== End of saveTemplate() Method============================================
  /* clearHighlight() {
     this.mappingEditorService.removeTheSelectedMarkers();
   }
   //========================== End of clearHighlight() Method============================================*/
  /*validateTemplate() {
    var fileExtensionArr = this.fileType.split("/");
    let data = {
      "input": {
        "design-request": {
          "request-id": this.apiToken,
          "action": "validateTemplate",
          "data-type": fileExtensionArr[1].toUpperCase(),
          "payload": this.configMappingEditorContent
        }
      }
    };
    let url = environment.validateTemplate;
    this
      .httpUtil
      .post(
      { url: url, data: data })
      .subscribe(resp => {
        if (resp.output.status.code === '400' && resp.output.status.message === "success") {
          this.uploadValidationSuccess = true;
          this.nService.success("Success", "Template Validated succesfully");
          return true;
        }
        else if (resp.output.status.code === '401') {
          this.nService.error("Error", resp.output.status.message);
          return false;
        }
      },
      error => this.nService.error("Error", "Unable to validate the uploaded template. Error in connecting APPC Server"));
  }
  //========================== End of validateTemplate() Method============================================*/
  retrieveTemplateFromAppc() {
    let refObj = this.refObj;
    if (refObj && refObj != undefined) {

      let fileName = this.artifactName;
      let payload = '{"userID": "' + this.userId + '","action": "' + this.item.action + '", "vnf-type" : "' + this.vnfType + '", "artifact-type":"APPC-CONFIG", "artifact-name":"' + fileName + '"}';
      let input = {
        "input": {
          "design-request": {
            "request-id": this.apiToken,
            "action": "getArtifact",
            "payload": payload
          }
        }
      };
      // console.log("Retrieve artifact payload=="+ payload);
      let artifactContent: any;
      this.ngProgress.start();
      this.httpUtil.post({
        url: environment.getDesigns,
        data: input
      }).subscribe(resp => {
        if (resp.output.status.code === '400' && resp.output.status.message === "success") {
          this.nService.success("Success", "Template retrieved successfully from APPC");
          this.tempRetrievalResponse=resp;
          let result = JSON.parse(resp.output.data.block).artifactInfo[0];
          result = result['artifact-content'];
          if ('Generated Template' === this.selectedUploadType) {
            this.configMappingEditorContent = result
            this.artifactRequest.templateContent = this.configMappingEditorContent;
            this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
            if (this.artifactRequest.templateContent) {
              this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent, this.modal);
            }
          }
          this.tempretrieveFlag = true;
          this.fileNameForTempSave = fileName;
          this.enableDownloadButtons = true;
          this.initialData = result;
          this.saveTemplate();
        }
        else {
          this.nService.info("Information", "There is no template saved in APPC for the selected action!");
        }
        this.ngProgress.done();
      },
        /*  (error) => {
            //  this.showUploadErrorStatus = true;
            // this.nService.error('Status','Error Connecting to the APPC Network')
            //this.notificationService.notifyErrorMessage('Configuration Template file successfully uploaded..')
            //this.uploadStatusError = true;
            //window.scrollTo(0, 0)
            // this. nService.error('Status','Error Connecting to the APPC Network')
            this.openModel(true, "Could not retrieve latest template for given action""Error in connecting to APPC database")
          });*/
        error => this.nService.error("Error", "Error in connecting to APPC Server"));
      setTimeout(() => {
        this.ngProgress.done();
      }, 3500);
    }
  }
  //========================== End of retrieveTemplateFromAppc() Method============================================
  prepareAppData() {
    let refObj = this.refObj;
    //console.log("Reference object =="+ JSON.stringify(refObj));
    if (refObj && refObj != undefined) {
      // refObj = refObj[refObj.length - 1];
      let paramsKeyValueFromEditor: JSON;
      /*  if (this.fileExtension.toUpperCase() === "XML")
          paramsKeyValueFromEditor = this.mappingEditorService.generateParams(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
        else*/
      // paramsKeyValueFromEditor = this.mappingEditorService.generateParams(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
      try {
        paramsKeyValueFromEditor = JSON.parse(localStorage["paramsContent"]);
      }
      catch (error) {
        console.log("Could not parse name value pairs==" + error);
      }
      if (paramsKeyValueFromEditor) {
        this.showTemplateVersionDiv = true;
        let action = this.item.action;
        var scopeName = this.scopeName.replace(/ /g, '').replace(new RegExp('/', "g"), '_').replace(/ /g, '');
        let fileName = this.updateParamFileName(refObj.action, scopeName, this.templateVersionNo);
        let vnfType = this.vnfType;
        let Json = [paramsKeyValueFromEditor];
        let slashedPayload = this.appendSlashes(JSON.stringify(Json));
        let newPayload =
          {
            "userID": this.userId,
            "vnf-type": this.vnfType,
            "action": action,
            "artifact-name": fileName,
            "artifact-type": "APPC-CONFIG",
            "artifact-version": this.templateVersionNo,
            "artifact-contents": slashedPayload
          }
        let data =
          {
            "input": {
              "design-request": {
                "request-id": this.apiToken,
                "action": "uploadArtifact",
                "payload": JSON.stringify(newPayload)

              }
            }
          }
         // console.log("param data"+JSON.stringify(data))
        this.appDataObject.template.nameValueData = data;
      }
      if (this.configMappingEditorContent) {
        let actualContent = this.configMappingEditorContent;
        this.mappingEditorService.generateTemplate(this.templateEditor);
        this.showTemplateVersionDiv = true;
        let action = this.item.action;
        let versionandFileType: any;
        if (this.fileType === "text/xml") {

          versionandFileType = this.templateVersionNo + 'V.xml'
        } else {

          versionandFileType = this.templateVersionNo + 'V.json'
        }
        let fileName: any;
        if (this.tempretrieveFlag) {
          fileName = this.fileNameForTempSave;
        }
        else {
          // fileName = this.updateDownloadTemplateFileName(refObj.action, this.scopeName, versionandFileType);
          fileName = this.artifactName;
        }
        let vnfType = this.vnfType;
        let newPayload =
          {
            "userID": this.userId,
            "vnf-type": this.vnfType,
            "action": action,
            "artifact-name": fileName,
            "artifact-type": "APPC-CONFIG",
            "artifact-version": this.templateVersionNo,
            //"artifact-contents": this.configMappingEditorContent
            "artifact-contents": this.configMappingEditorContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}')

          }
        let data =
          {
            "input": {
              "design-request": {
                "request-id": this.apiToken,
                "action": "uploadArtifact",
                "payload": JSON.stringify(newPayload)

              }
            }
          }
        //  console.log("data=="+ JSON.stringify(data))
        this.appDataObject.template.templateData = data;
        this.mappingEditorService.initialise(this.templateeditor.getEditor(), actualContent, this.modal);
      }
    }
  }
  //========================== End of prepareAppData() Method============================================
  /*retrieveNameValueFromAppc() {
    let refObj: any = this.prepareFileName();
    if (refObj && refObj != undefined) {
      let fileName = this.updateParamFileName(this.item.action, this.scopeName, this.templateVersionNo);
      let payload = '{"userID": "' + this.userId + '","action": "' + this.item.action + '", "vnf-type" : "' + this.vnfType + '", "artifact-type":"APPC-CONFIG", "artifact-name":"' + fileName + '"}';
      let input = {
        "input": {
          "design-request": {
            "request-id": this.apiToken,
            "action": "getArtifact",
            "payload": payload
          }
        }
      };
      
      let artifactContent: any;
      this.httpUtil.post({
        //    url:"https://mtanjv9apdb51.aic.cip.att.com:8443/restconf/operations/design-services:dbservice",
        url: environment.getDesigns,
        data: input
      }).subscribe(resp => {
        if (resp.output.status.code === '400' && resp.output.status.message === "success") {
          this.openModel(true, 'Name/value pairs retrieved successfully from APPC', 'Success');
          let result = JSON.parse(resp.output.data.block).artifactInfo[0];
          result = JSON.parse(result['artifact-content']);
          var jsonString = JSON.stringify(result[0]);
          var string = jsonString.substring(1, jsonString.length - 1);
          var stringArr = string.split(",");
          var newStringArr = [];
          var resultStr = "{\r\n"
          for (var index in stringArr) {
            newStringArr[index] = stringArr[index] + ",\r\n";
          }
          for (var index in newStringArr) {
            resultStr = resultStr + newStringArr[index];
          }
          resultStr = resultStr.substring(0, resultStr.length - 3) + "\r\n}"
          this.configMappingEditorContent = resultStr;

        }
      },
        error => this.openModel(true, "Could not retrieve the name value pairs. Error in connecting to APPC Server", "ERROR"));
    }
  }*/
  //========================== End of retrieveNameValueFromAppc() Method============================================
  prepareFileName(): any {
    let fileNameObject: any = this.mappingEditorService.latestAction;
    this.appDataObject = this.mappingEditorService.appDataObject;
    this.downloadDataObject = this.mappingEditorService.downloadDataObject;
    this.referenceData = fileNameObject;
    return fileNameObject;
  }
  //========================== End of prepareFileName() Method============================================
  onDownloadParameter() {
    let refObj = this.refObj;
    if (refObj) {
      // refObj = refObj[refObj.length - 1];
      let paramsKeyValueFromEditor: JSON;
     /* if (this.fileExtension.toUpperCase() === "XML")
        paramsKeyValueFromEditor = this.mappingEditorService.generateParams(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
      else
        paramsKeyValueFromEditor = this.mappingEditorService.generateParams(this.templateeditor.getEditor(), this.artifactRequest.templateContent);*/

      try {
        paramsKeyValueFromEditor = JSON.parse(localStorage["paramsContent"]);
      }
      catch (error) {
        console.log("Could not parse name value pairs==" + error);
      }
      let theJSON = JSON.stringify(paramsKeyValueFromEditor, null, "\t")
      var blob = new Blob([theJSON], {
        type: "text/json"
      });
      this.showTemplateVersionDiv = true;
      let fileName: any;
      var scopeName = this.scopeName.replace(/ /g, '').replace(new RegExp('/', "g"), '_').replace(/ /g, '');
      fileName = this.updateParamFileName(refObj.action, scopeName, this.templateVersionNo);
      this.downloadDataObject.template.nameValueData = theJSON;
      this.downloadDataObject.template.nameValueFileName = fileName;
    }
    else {
      this.nService.error("Error", "Please enter Action and VNF type in Reference Data screen");
    }

  }
  //========================== End of onDownloadParameter() Method============================================
  /* JSONToCSVConvertor(JSONData, fileName, ShowLabel) {
     //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
     var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
     var CSV = '';
     //This condition will generate the Label/Header
     if (ShowLabel) {
       var testRow = "";
       for (var index in arrData[0]) {
         CSV += index + '\t' + arrData[0][index] + '\r\n';
       }
     }
     if (CSV == '') {
       return;
     }
     //Initialize file format you want csv or xls
     var uri = 'data:application/vnd.ms-excel,' + encodeURI(CSV);
     var link = document.createElement("a");
     link.href = uri;
     link.download = fileName + ".xls";
     //this part will append the anchor tag and remove it after automatic click
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   }
   //========================== End of JSONToCSVConvertor() Method============================================
   updateParamFileNameForXls(action: any, scopeName: any, versionNo: any) {
     let fileName = 'param_' + action + '_' + scopeName + '_' + versionNo + 'V';
     this.downloadedParamFileName = fileName;
     return fileName;
   }
   //========================== End of updateParamFileNameForXls() Method============================================*/
  updateParamFileName(action: any, scopeName: any, versionNo: any) {
    let fileName = 'param_' + action + '_' + scopeName + '_' + versionNo + 'V.json';
    this.downloadedParamFileName = fileName;
    return fileName;
  }
  //========================== End of updateParamFileName() Method============================================
  public onDownloadTemplate(artifact: string) {
    let actualContent = this.configMappingEditorContent;
    var textToSaveAsBlob: any;
    var config_template_fileName: any
    let refObj = this.refObj;
    let versionandFileType: string;
   // this.mappingEditorService.generateTemplate(this.templateEditor);
    if (artifact == 'Template' && this.artifactRequest && this.configMappingEditorContent && refObj) {
      //  refObj = refObj[refObj.length - 1];
      this.showTemplateVersionDiv = true;
      if (this.fileType === "text/xml") {
        textToSaveAsBlob = new Blob([this.configMappingEditorContent], {
          type: "text/xml"
        });
        versionandFileType = this.templateVersionNo + 'V.xml'
      }
      if (this.fileType === "text/plain") {
        textToSaveAsBlob = new Blob([this.configMappingEditorContent], {
          type: "text/plain"
        });
        versionandFileType = this.templateVersionNo + 'V.txt'
      }
      if (this.fileType === "text/json") {
        textToSaveAsBlob = new Blob([this.configMappingEditorContent], {
          type: "text/json"
        });
        versionandFileType = this.templateVersionNo + 'V.json'
      }
      if (this.tempretrieveFlag) {
        config_template_fileName = this.fileNameForTempSave;
        var filextension = config_template_fileName.substring(config_template_fileName.indexOf("V") + 2, config_template_fileName.length);

        textToSaveAsBlob = new Blob([this.configMappingEditorContent], {
          type: "text/" + filextension
        });
      }
      else {
        // config_template_fileName = this.updateDownloadTemplateFileName(refObj.action, this.scopeName, versionandFileType);
        config_template_fileName = this.artifactName;
      }
      // saveAs(textToSaveAsBlob, config_template_fileName);
      this.mappingEditorService.initialise(this.templateeditor.getEditor(), actualContent, this.modal);
      //this.downloadDataObject.template.templateData = this.configMappingEditorContent;
      this.downloadDataObject.template.templateData = this.configMappingEditorContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}');
      this.downloadDataObject.template.templateFileName = config_template_fileName;
    }

  }
  //========================== End of onDownloadTemplate() Method============================================
  /*updateDownloadTemplateFileName(action: any, scopeName: any, versionandFileType: any) {
    let fileName = 'template_' + action + '_' + scopeName + '_' + versionandFileType;
    this.downloadedTemplateFileName = fileName;
    return fileName;
  }
  //========================== End of updateDownloadTemplateFileName() Method============================================
  /* openModel(toShow: any, message: any, title: any) {
     //this.modalComponent.isShow = toShow;
     //this.modalComponent.message = message;
     //this.modalComponent.title = title;
   }
   //========================== End of openModel() Method============================================*/
  fileChange(input) {

    let self = this;
    let refObj = this.refObj;
    this.enableValidateTemplate = true;

    if (refObj && refObj != undefined) {
      // refObj = refObj[refObj.length - 1];
      if (input.files && input.files[0]) {
        console.log("input files0" + JSON.stringify(input.files[0]))
        this.myfileName = input.files[0].name;
        this.fileName = input.files[0].name;
        this.fileType = input.files[0].type;
        // var fileExtension = this.myfileName.substr(this.myfileName.lastIndexOf('.') + 1);

        let reader = new FileReader();
        // if(this.validateUploadedFile(fileExtension))
        //{
        this.readFile(input.files[0], reader, (result) => {
          if (this.fileType === 'text/xml') {
            sessionStorage.setItem('fileType', 'text/xml');
          }
          if (this.fileName.endsWith(".json")) {
            this.fileType = "text/json";
            sessionStorage.setItem('fileType', 'text/json');
          }
          if (this.fileType === '') {
            sessionStorage.setItem('fileType', '');
          }


          if ('Generated Template' === this.selectedUploadType) {
            this.configMappingEditorContent = result
            this.artifactRequest.templateContent = this.configMappingEditorContent;
            console.log("editor content==" + JSON.stringify(this.configMappingEditorContent))
            this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
            if (this.artifactRequest.templateContent) {
              this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent, this.modal);
            }
          }
          this.enableDownloadButtons = true;
          this.initialData = result;
          this.saveTemplate();

        });
        //  }
        // else{
        // this.nService.error("Error", "Incorrect File Format")
        //this.configMappingEditorContent=''
        //}
      }
      else {
        this.nService.error("Error", "Failed to read file");
      }
      this.myInputVariable.nativeElement.value = "";
    }
    else {
      this.nService.error("Error", "Please enter Action and VNF type in Reference Data screen");
      return false;
    }
  }
  //========================== End of fileChange() Method============================================
  public readFile(file, reader, callback) {
    // Set a callback funtion to fire after the file is fully loaded
    reader.onload = () => {
      // callback with the results
      callback(reader.result);
    }
    this.notificationService.notifySuccessMessage('Uploading File ' + file.name + ':' + file.type + ':' + file.size);
    // Read the file
    reader.readAsText(file, "UTF-8");
  }
  //========================== End of readFile() Method============================================
  validateUploadedFile(fileExtension) {

    if (fileExtension.toUpperCase() === 'json'.toUpperCase() || fileExtension.toUpperCase() === 'xml'.toUpperCase()) {
      return true;
    }
    else {
      return false;
    }

  }
  //========================== End of validateUploadedFile() Method============================================
  appendSlashes(artifactData) {
    let x = artifactData.replace(new RegExp(',"', "g"), ',\"');
    let y = x.replace(new RegExp('":', 'g'), '\":');
    let z = y.replace(new RegExp('{"', 'g'), '{\"')
    let t = z.replace(new RegExp(':"', 'g'), ':\"')
    let m = t.replace(new RegExp('",', 'g'), '\",');
    let n = y.replace(new RegExp('"}', 'g'), '\"}')
    let nw = n.replace(new RegExp('{"', 'g'), '{\"');
    let nw1 = nw.replace(new RegExp(':"', 'g'), ':\"');
    let nw2 = nw1.replace(new RegExp('",', 'g'), '\",');
    return nw2;
  }
  //========================== End of appendSlashes() Method============================================
  prepareDownloadData() {
    this.onDownloadParameter();
    this.onDownloadTemplate('Template');
  }
  //========================== End of prepareDownloadData() Method============================================
  syncTemplate() {
    this.mappingEditorService.replaceNamesWithBlankValues();
    this.saveTemplate();

    var templateData = this.mappingEditorService.paramData; //template data array
    // this.paramShareService.setTemplateData(templateData);

    //console.log("Template Name value pairs ===" + JSON.stringify(templateData))
    var pdData = this.paramShareService.getSessionParamData(); //PD data array
    console.log("PD name value pairs===" + JSON.stringify(pdData))


    var paramsContent = localStorage["paramsContent"];
    console.log("Param content before==" + paramsContent);

    if (paramsContent && paramsContent != undefined) {
      try {
        var paramTabData = JSON.parse(paramsContent);
        //console.log("Param content after==" + paramsContent);
        //console.log("Param tab data after==" + JSON.stringify(paramTabData))
      }
      catch (error) {
        console.log("error is : " + error)
      }
    }
    var resultArr = [];
    var json = {};
    var resultParamObj = {};
    let checkNamesOnlyCondition: boolean = true;

    if (templateData && templateData != undefined) {
      templateData.forEach(function (item) {
        if (item.paramValue !== "" && item.paramValue != undefined && item.paramValue != null) {
          checkNamesOnlyCondition = false;
        }

      });

      templateData.forEach(function (item) {
        resultParamObj[item.paramName] = item.paramValue;
      });
      // console.log("pARAM Result array before is " + JSON.stringify(resultParamObj))
      if (paramTabData && paramTabData != undefined) {
        templateData.forEach(function (item) {
          for (var index in paramTabData) {
            if (item.paramName === index) {
              if (checkNamesOnlyCondition) {
                resultParamObj[index] = paramTabData[index];
              }
              else {
                if (item.paramValue === "") {
                  resultParamObj[index] = paramTabData[index];
                }
                else {
                  resultParamObj[index] = item.paramValue;
                }
              }
            }

          }

        });

      }
      localStorage["paramsContent"] = JSON.stringify(resultParamObj);
      //console.log("param content after==" +JSON.stringify(resultParamObj));

      //removing duplicate elements from the array
      templateData = Array.from(new Set(templateData.map((itemInArray) => itemInArray.paramName)))

      //reformatting arr1 to match with PD
      templateData.forEach(function (item) {

        resultArr.push({
          "name": item,
          "type": null,
          "description": null,
          "required": null,
          "default": null,
          "source": "Manual",
          "rule-type": null,
          "request-keys": [{
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }],
          "response-keys": [{
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }, {
            "key-name": null,
            "key-value": null
          }],
          "ruleTypeValues": [null]

        })
      });
    }
    //console.log("Result array before is " + JSON.stringify(resultArr))
    // console.log("Length before is:  " + resultArr.length)

    if (pdData && pdData != undefined) {
      for (var i = 0; i < resultArr.length; i++) {

        pdData.forEach(function (arr2item) {
          if (resultArr[i].name === arr2item.name) {

            var json = {
              "name": arr2item.name,
              "type": arr2item.type,
              "description": arr2item.description,
              "required": arr2item.required,
              "default": arr2item.default,
              "source": arr2item.source,
              "rule-type": arr2item["rule-type"],
              "request-keys": arr2item["request-keys"],
              "response-keys": arr2item["response-keys"],
              "ruleTypeValues": arr2item.ruleTypeValues
            };
            resultArr.splice(i, 1, json)
            //  console.log("Result array index ==" + JSON.stringify(resultArr[i]))
          }

        });

      };

    }
    this.paramShareService.setSessionParamData(resultArr);
    //console.log("Result array after is " + JSON.stringify(resultArr))
    //console.log("Length after is:  " + resultArr.length)
    this.mappingEditorService.paramData = [];
    //navigate to PD page after sync
    this
      .router
      .navigate(['../../../vnfs/design/parameterDefinitions/create']);
  }

  //========================== End of syncTemplate() Method============================================
  mergeParams() {
    this.mergeStatus = this.mappingEditorService.autoAnnotateDataForParams();
    if (this.mergeStatus) {
      this.nService.success("Success", "Merge Successful");
    }
    else {
      this.nService.error("Error", "Merge Unsuccessful");
    }
    this.saveTemplate();
  }
  //========================== End of mergeParams() Method============================================  
  public handleAnnotation(modal) {

    this.selectedWord = this.templateeditor.getEditor().session.getTextRange(this.templateeditor.getEditor().selectionRange);
    modal.open();
  }
  //========================== End of handleAnnotations() Method============================================ 
  public submitNameValues() {
    /*var editor = this.templateeditor.getEditor()
    this.editor = editor;
    this.editor.session = editor.session;
    this.editor.selection.session.$backMarkers = {};
    this.editorContent = this.artifactRequest.templateContent;
    this.editor.$blockScrolling = Infinity;
    this.editor.$blockSelectEnabled = false;*/
    if (this.tempName) {
      this.checkNameEntered = true;

      if (this.selectedWord) {
        if (this.selectedWord.startsWith('${(')) {
          var replaceWord: any =this.replaceWord = this.selectedWord.substring(3, this.selectedWord.indexOf(')=(')) + this.tempName;
          this.templateeditor.getEditor().session.replace(this.templateeditor.getEditor().session.selection.getRange(), replaceWord);
          
        } else {
          let mappingKey = this.mappingEditorService.getKeysForValues(this.selectedWord);
          var replaceWord: any = this.replaceWord='${(' + this.selectedWord + ')=(' + this.tempName + ')}';
          this.templateeditor.getEditor().session.replace(this.templateeditor.getEditor().session.selection.getRange(), replaceWord);
          
        }
      }
      this.mappingEditorService.refreshEditor();
      this.tempName = '';
      this.modal.close();

    }
    else {
      this.checkNameEntered = false;
    }

  }
  //========================== End of submitNameValues() Method============================================
}
