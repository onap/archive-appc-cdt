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
import { UtilityService } from '../../../../shared/services/utilityService/utility.service';
import { APIService } from "../../../../shared/services/cdt.apicall";
import { ProcOnSrvSideSvc } from "../../../../shared/services/procOnSrvSide.service";
declare var $: any

@Component({ selector: 'app-golden-configuration', templateUrl: './template-configuration.component.html', styleUrls: ['./template-configuration.component.css'] })
export class GoldenConfigurationComponent implements OnInit {
  clName= "TemplateConfComp";
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
  templateVersionNo: any = require('../../../../../cdt.application.properties.json').versionNoForApiCall;
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
    timeOut: 4500,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 200
  }
  public replaceWord;
  public enableDownloadButtons: boolean = false;

  constructor(
    private buildDesignComponent: BuildDesignComponent,
    private apiService: APIService,
    private utilityService: UtilityService,
    private paramShareService: ParamShareService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private httpUtil: HttpUtilService,
    private mappingEditorService: MappingEditorService,
    private activeRoutes: ActivatedRoute,
    private router: Router,
    private nService: NotificationsService,
    private procOnSrvSideSvc: ProcOnSrvSideSvc,
    private ngProgress: NgProgress)
  {
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": new: start.");
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
  paramArtifactName: any;
  enableValidateTemplate: boolean = false;;
  public selectedUploadType: string = this.uploadTypes[0].value;
  checkSpace: boolean = true;

  public tempRetrievalResponse: any;
  public mergeStatus: boolean = false;
  //====================================================
  ngOnInit() {
    var methName= "ngOnInit";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": start.");
    var refObj = this.refObj = this.prepareFileName();
    // console.log("Ref object:  " + JSON.stringify(refObj))
    if (refObj && refObj != undefined) {
      this.item = refObj;

      this.vnfType = this.item.vnf;
      this.vnfcType = this.item.vnfc;
      this.protocol = this.item.protocol;
      this.action = this.item.action;
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": vnfType:["+this.vnfType+
          "] vnfcType:["+this.vnfcType+"] protocol:["+this.protocol+"] action:["+
          this.action+"]");
      this.artifactName = this.item["template_artifact"]
      this.paramArtifactName = this.item["param_artifact"]
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
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": refObj is not defined.");
      this.item = { "action": "", "scope": { "vnf-type": "", "vnfc-type": "" }, "vm": [], "protocol": "", "download-dg-reference": "", "user-name": "", "port-number": "", "artifact-list": [], "deviceTemplate": "", "scopeType": "" };
    }
    this.initialAction = this.item.action;
    this.activeRoutes.url.subscribe(UrlSegment => {
      this.actionType = UrlSegment[0].path
    })
    this.mappingEditorService.fromScreen = 'MappingScreen';

  }
  //========================== End of ngOnInit() Method============================================
  ngOnDestroy() {
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": ngOnDestroy: start.");
    if (this.refObj && this.refObj != undefined) {
      if (this.configMappingEditorContent && this.configMappingEditorContent != undefined) {
        this.saveTemplate();
        this.prepareAppData();
        this.prepareDownloadData();
        this.mappingEditorService.changeNavAppData(this.appDataObject);
        this.mappingEditorService.changeNavDownloadData(this.downloadDataObject);
      }
    }
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": ngOnDestroy: finish.");
  }
  //========================== End of ngOnDestroy() Method============================================
  ngAfterViewInit() {
    var methName= "ngAfterViewInit";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": start.");
    if (this.mappingEditorService.latestAction) {
      this.refNameObj = this.mappingEditorService.latestAction;
      if (this.vnfcType !== 'null') {
        this.type = this.vnfcType;
      }
      else {
        this.type = this.vnfType;
      }
    }
    let self = this;
    this.templateEditor = self.templateeditor.getEditor();
    this.templateeditor.getEditor().commands.addCommand({
      name: 'annotateCommand',
      bindKey: { win: 'ctrl-z', mac: 'Command-z' },
      exec: (editor: any) => {
        this.handleUndo(this.modal);
      }
    });
    this.templateeditor.getEditor().commands.addCommand({
      name: 'annotateCommandAlternate',
      bindKey: { win: 'CTRL-4', mac: 'Command-4' },
      exec: (editor: any) => {
        this.checkNameEntered = true;
        this.checkSpace = true;
        this.handleAnnotation(this.modal);
      }
    });
    if (this.mappingEditorService.fromScreen === 'MappingScreen') {
      this.configMappingEditorContent = this.mappingEditorService.getTemplateMappingDataFromStore();
      this.fileType = sessionStorage.getItem('fileType');
    }
    if (this.configMappingEditorContent) {
      this.artifactRequest.templateContent = this.configMappingEditorContent;
      this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
    }
    if (this.refObj) {
      if (this.mappingEditorService.getTemplateMappingDataFromStore() &&
          this.mappingEditorService.getTemplateMappingDataFromStore() != undefined) {
        this.configMappingEditorContent = this.mappingEditorService.getTemplateMappingDataFromStore();
      }
      else {
        if (this.artifactName) this.retrieveTemplateFromAppc();
      }
    }
    else {
      this.Actions = [];
      this.enableBrowse = false;
      this.nService.error("Error",
        "Please enter Action and VNF type in Reference Data screen", this.options);
    }
  }

  //========================== End of ngAfterViewInit() Method============================================
  browseOption() {
    $("#inputFile").trigger('click');
  }
  //========================== End of browseOption() Method============================================
  public saveTemplate() {
    var methName= "saveTemplate";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": start.");
    this.mappingEditorService.paramData = [];
    if (this.configMappingEditorContent) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": do refreshEditor ...");
      this.mappingEditorService.refreshEditor();
      let paramArr: any = []
      if (this.mappingEditorService.paramData && this.mappingEditorService.paramData != undefined) {
        if (this.mappingEditorService.paramData.length === 0 && this.mappingEditorService.hasErrorCode === true) {
          this.nService.error("Error", 'Special characters error', this.options);
          return;
        }
        else {
          this.showError = false;
        }
      }
      this.mappingEditorService.setTemplateMappingDataFromStore(this.configMappingEditorContent);
    }
  }
  //========================== End of saveTemplate() Method============================================
  retrieveTemplateFromAppc() {
    var methName= "retrieveTemplateFromAppc";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( methName+": start ...");
    let refObj = this.refObj;
    if (refObj && refObj != undefined) {
      let fileName = this.artifactName;
      let input = this.utilityService.createPayloadForRetrieve(false, this.item.action, this.vnfType, fileName);
      // console.log("Retrieve artifact payload=="+ payload);
      let artifactContent: any;
      this.ngProgress.start();
      this.apiService.callGetArtifactsApi(input).subscribe(resp => {
        if (resp.output.status.code === '400' && resp.output.status.message === "success") {
          this.nService.success("Success","Template retrieved successfully from APPC", this.options);
          this.tempRetrievalResponse = resp;
          let result = JSON.parse(resp.output.data.block).artifactInfo[0];
          result = result['artifact-content'];
          this.configMappingEditorContent = result
          this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
          this.tempretrieveFlag = true;
          this.fileNameForTempSave = fileName;
          this.saveTemplate();
        }
        else {
          this.nService.info("Information","There is no template saved in APPC for the selected action!", this.options);
        }
        this.ngProgress.done();
      },
      error => this.nService.error("Error", "Error in connecting to APPC Server",  this.options));
      setTimeout(() => {
        this.ngProgress.done();
      }, 3500);
    }
  }
  //========================== End of retrieveTemplateFromAppc() Method============================================
  prepareAppData() {
    var methName= "prepareAppData";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": start.");
    let refObj = this.refObj;
    if (refObj && refObj != undefined) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": parse locStor.paramsContent");
      let paramsKeyValueFromEditor: JSON;
      try {
        paramsKeyValueFromEditor = JSON.parse(localStorage["paramsContent"]);
      }
      catch (error) {
        console.log(methName+": Could not parse name value pairs:" + error);
      }
      if (paramsKeyValueFromEditor) {
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+
            ": have paramsKeyValueFromEditor");
        let action = this.item.action;
        var scopeName =
          this.scopeName.replace(/ /g, '').replace(new RegExp('/', "g"), '_').replace(/ /g, '');
        var fileName = '';
        fileName = this.paramArtifactName;
        let Json = [paramsKeyValueFromEditor];
        let slashedPayload = this.appendSlashes(JSON.stringify(Json));
        let data =
          this.utilityService.createPayLoadForSave("param_data", this.vnfType, action, fileName, this.templateVersionNo, slashedPayload);
        this.appDataObject.template.nameValueData = data;
      }
      if (this.configMappingEditorContent) {
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+
            ": have configMappingEditorContent");
        let actualContent = this.configMappingEditorContent;
        this.mappingEditorService.generateTemplate(this.templateEditor);
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
          fileName = this.artifactName;
        }
        let vnfType = this.vnfType;

        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+
            ": start replace: content length="+
            this.configMappingEditorContent.length );
        var replContent=
          this.configMappingEditorContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}');
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+" replace done");

        let data = this.utilityService.createPayLoadForSave("template_data", this.vnfType, action, fileName, this.templateVersionNo, replContent );

        this.appDataObject.template.templateData = data;
        if( this.utilityService.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+": initialise editor ...");
        this.mappingEditorService.initialise(this.templateeditor.getEditor(), actualContent);
      }
      if( this.utilityService.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": finish.");
    }
  }
  //========================== End of prepareAppData() Method============================================
  prepareFileName(): any {
    let fileNameObject: any = this.mappingEditorService.newObject;
    this.appDataObject = this.mappingEditorService.appDataObject;
    this.downloadDataObject = this.mappingEditorService.downloadDataObject;
    this.referenceData = fileNameObject;
    return fileNameObject;
  }
  //========================== End of prepareFileName() Method============================================
  onDownloadParameter() {
    let refObj = this.refObj;
    if (refObj) {
      let paramsKeyValueFromEditor: JSON;
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
      let fileName: any;
      var scopeName = this.scopeName.replace(/ /g, '').replace(new RegExp('/', "g"), '_').replace(/ /g, '');
      fileName = this.paramArtifactName;
      this.downloadDataObject.template.nameValueData = theJSON;
      this.downloadDataObject.template.nameValueFileName = fileName;
    }
    else {
      this.nService.error("Error", "Please enter Action and VNF type in Reference Data screen", this.options);
    }

  }
  //========================== End of onDownloadParameter() Method============================================
  public onDownloadTemplate(artifact: string) {
    var methName= "onDownloadTemplate";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( methName+": start: artifact:["+artifact+"] fileType:["+
        this.fileType+"]");
    let actualContent = this.configMappingEditorContent;
    var textToSaveAsBlob: any;
    var config_template_fileName: any
    let refObj = this.refObj;
    let versionandFileType: string;
    if (artifact == 'Template' && this.artifactRequest && this.configMappingEditorContent && refObj) {
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
        config_template_fileName = this.artifactName;
      }
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": config_template_fileName:["+
          config_template_fileName+"]");
      this.mappingEditorService.initialise(this.templateeditor.getEditor(), actualContent);
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": start replacements in content");
      this.downloadDataObject.template.templateData = this.configMappingEditorContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}');
      this.downloadDataObject.template.templateFileName = config_template_fileName;
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": finish.");
    }
  }
  //========================== End of onDownloadTemplate() Method============================================
  fileChange( input) {

    let self = this;
    let refObj = this.refObj;
    this.enableValidateTemplate = true;

    if (refObj && refObj != undefined) {
      // refObj = refObj[refObj.length - 1];
      if (input.files && input.files[0]) {
        //console.log("input files0" + JSON.stringify(input.files[0]))
        this.myfileName = input.files[0].name;
        this.fileName = input.files[0].name;
        this.fileType = input.files[0].type;
        // var fileExtension = this.myfileName.substr(this.myfileName.lastIndexOf('.') + 1);

        let reader = new FileReader();
        // if(this.validateUploadedFile(fileExtension))
        //{
        this.readFile( input.files[0], reader, (result) => {
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
            // console.log("editor content==" + JSON.stringify(this.configMappingEditorContent))
            this.notificationService.notifySuccessMessage('Configuration Template file successfully uploaded..');
            if (this.artifactRequest.templateContent) {
              this.mappingEditorService.initialise(this.templateeditor.getEditor(), this.artifactRequest.templateContent);
            }
          }
          this.enableDownloadButtons = true;
          this.initialData = result;
          this.saveTemplate();
          this.templateeditor.getEditor().$enableBlockSelect = false;
          this.templateeditor.getEditor().$enableMultiselect = false;

        });
        //  }
        // else{
        // this.nService.error("Error", "Incorrect File Format")
        //this.configMappingEditorContent=''
        //}
      }
      else {
        this.nService.error("Error", "Failed to read file", this.options);
      }
      this.myInputVariable.nativeElement.value = "";
    }
    else {
      this.nService.error("Error", "Please enter Action and VNF type in Reference Data screen", this.options);
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
    if( this.utilityService.getTracelvl() > 0 )
      console.log( this.clName+": prepareDownloadData: start.");
    this.onDownloadParameter();
    this.onDownloadTemplate('Template');
  }
  //========================== End of prepareDownloadData() Method============================================
  syncTemplate( callOrig: string ) {
    var methName= "syncTemplate";
    if( this.utilityService.getTracelvl() > 0 )
      console.log( methName+": start. callOrig:["+callOrig+"]");
    if( callOrig == '0' ) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": this call is from HTML -start 1-st step.");
      var ediContent= this.mappingEditorService.editor.session.getValue();
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": ediContent length="+ediContent.length );
      if( this.utilityService.getTracelvl() > 1 )
        console.log( methName+": ediContent(begin):["+
          ediContent.substr(0,200)+"...]");
      this.procOnSrvSideSvc.sendToSrv(
        ediContent, this.mappingEditorService, this );
    }
    else
    if( callOrig == '1' ) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": this call is from ProcOnSrvSideSvc -continue.");
   // console.log( methName+": start replaceNamesWithBlankValues.");
   // this.mappingEditorService.replaceNamesWithBlankValues();
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": start saveTemplate ...");
    this.saveTemplate();
    var templateData = this.mappingEditorService.paramData; //template data array
    var pdData = this.paramShareService.getSessionParamData(); //PD data array
    var paramsContent = localStorage["paramsContent"];
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": paramsContent length="+paramsContent.length );
    var resultArr = [];
    var json = {};
    var resultParamObj = {};
    let checkNamesOnlyCondition: boolean = true;

    if (templateData && templateData != undefined) {
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": templateData (params) are not empty.");
      templateData.forEach(function (item) {
        if (item.paramValue !== "" && item.paramValue != undefined && item.paramValue != null) {
          checkNamesOnlyCondition = false;
        }
        resultParamObj[item.paramName] = item.paramValue;
      });
      templateData = Array.from(new Set(templateData.map((itemInArray) => itemInArray.paramName)))
      if( paramsContent && paramsContent != undefined) {
        if( this.utilityService.getTracelvl() > 0 )
          console.log( methName+": parse paramsContent ...");
        try {
          var paramTabData = JSON.parse(paramsContent);
        }
        catch (error) {
          console.log( methName+": paramsContent parse error:" + error);
        }
        if( this.utilityService.getTracelvl() > 0 )
          console.log( methName+": templateData length="+templateData.length );
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
      localStorage["paramsContent"] = JSON.stringify(resultParamObj);
      if (pdData && pdData != undefined) {
        if( this.utilityService.getTracelvl() > 0 )
          console.log( methName+
            ": have pdData, resultArr.length="+resultArr.length );
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
            }
          });
        };
      }
      this.paramShareService.setSessionParamData(resultArr);
      this.mappingEditorService.paramData = [];
      //navigate to PD page after sync
      if( this.utilityService.getTracelvl() > 0 )
        console.log( methName+": navigate to PD page after sync ...");
      this
        .router
        .navigate(['../../../vnfs/design/parameterDefinitions/create']);
    }
    }
  }

  //========================== End of syncTemplate() Method============================================
  mergeParams() {
    this.mergeStatus = this.mappingEditorService.autoAnnotateDataForParams();
    if (this.mergeStatus) {
      this.nService.success("Success", "Merge Successful", this.options);
    }
    else {
      this.nService.error("Error", "Merge Unsuccessful", this.options);
    }
    this.saveTemplate();
  }
  //========================== End of mergeParams() Method============================================  
  public handleAnnotation(modal) {
    this.tempName = '';
    this.selectedWord = this.templateeditor.getEditor().session.getTextRange(this.templateeditor.getEditor().selectionRange);
    if (this.selectedWord && this.selectedWord != undefined) modal.open();
  }
  //========================== End of handleAnnotations() Method============================================ 
  public handleUndo(modal) {
    let markersList = this.templateeditor.getEditor().session.getMarkers();

    let filteredObj = {};
    let lastMarker = Object.keys(markersList).filter(function (key) {
      if (markersList[key]['clazz'] != 'undoMarker') {
        filteredObj[key] = markersList[key]
      }
      return filteredObj;
    });
    this.templateeditor.getEditor().session.getUndoManager().undo();
    this.templateeditor.getEditor().getSelection().clearSelection();

    this.templateeditor.getEditor().session.removeMarker(this.templateeditor.getEditor().getSelection().session.$markerId);
    this.templateeditor.getEditor().session.addMarker(markersList[parseInt(lastMarker[lastMarker.length - 1])].range, 'undoMarker', 'text')
  }
  //========================== End of handleUndo() Method============================================ 
  public submitNameValues() {
    this.checkNameEntered = true;
    this.checkSpace = true;
    if (this.tempName) {
      if (this.tempName.startsWith(' ') || this.tempName.endsWith(' ')) {
        this.checkSpace = false
      }
      else {
        this.checkNameEntered = true;

        if (this.selectedWord) {
          if (this.selectedWord.startsWith('${(')) {
            var replaceWord: any = this.replaceWord = this.selectedWord.substring(3, this.selectedWord.indexOf(')=(')) + this.tempName;
            this.templateeditor.getEditor().session.replace(this.templateeditor.getEditor().session.selection.getRange(), replaceWord);

          } else {
            let mappingKey = this.mappingEditorService.getKeysForValues(this.selectedWord);
            var replaceWord: any = this.replaceWord = '${(' + this.selectedWord + ')=(' + this.tempName + ')}';
            this.templateeditor.getEditor().session.replace(this.templateeditor.getEditor().session.selection.getRange(), replaceWord);

          }
        }
        this.mappingEditorService.refreshEditor();
        this.tempName = '';
        this.modal.close();
      }
    }
    else {
      this.checkNameEntered = false;
    }
  }
  //========================== End of submitNameValues() Method============================================
}
