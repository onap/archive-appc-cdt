/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018-2020 AT&T Intellectual Property. All rights reserved.
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

import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '.././shared/services/notification.service';
import { ParamShareService } from '.././shared/services/paramShare.service';
import { MappingEditorService } from '.././shared/services/mapping-editor.service';
import { NotificationsService } from 'angular2-notifications';
import { HttpUtilService } from '.././shared/services/httpUtil/http-util.service';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';
import { environment } from '../.././environments/environment';
import { UtilityService } from '.././shared/services/utilityService/utility.service';
import 'rxjs/add/operator/map';
import * as XLSX from 'xlsx';
import { NgProgress } from 'ngx-progressbar';


let YAML = require('yamljs');

type AOA = Array<Array<any>>;
declare var $: any;

@Component({ selector: 'test', templateUrl: './test.component.html', styleUrls: ['./test.component.css'] })
export class TestComponent implements OnInit {
    public displayParamObjects;
    options = {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };
    public action: any;
    public vnfId: any;
    public item: any = {};

    public vnfType: any;
    vnfcType: any;
    protocol: any;
    mode: any = 'NORMAL';
    public force = 'TRUE';
    ttl: any;
    public formattedNameValuePairs = {};
    public requestId = '';
    public enableBrowse: boolean = true;
    public enableSpinner: boolean = false;
    host: any;
    public refNameObj = {};

    public artifactName;
    public type;
    public transactions = '';
    public uploadFileName;

    public payload = {};
    public lastvmJson = {};
    public vmPayload = [];
    public subPayload = {};
    public vmJson = {};
    public vnfcJson = {};
    public flag = 1;
    public oldListName1 = '';
    public actionIdentifiers = {};
    public apiRequest = '';
    public apiResponse = '';
    public statusResponse;
    public appcTimestampResponse;
    public outputTimeStamp;
    public status;
    public statusReason;
    public errorResponse;
    public timer;
    public subscribe;
    public enableTestButton: boolean = false;
    public enableAbort: boolean = false;
    public showStatusResponseDiv: boolean = false;
    public enablePollButton: boolean = true;
    public pollCounter = 0;
    public enableCounterDiv: boolean = false;
    public enableDownload: boolean = false;
    private userId = sessionStorage['userId'];
    timeStampInt: number;
    AppcTimeStampInt: number;
    AppcTimeDiff: number;
    isAppcTimestampReceived: boolean = false;

    constructor (private location: Location, private activeRoutes: ActivatedRoute, private notificationService: NotificationService, private nService: NotificationsService, private router: Router, private paramShareService: ParamShareService, private mappingEditorService: MappingEditorService, private httpUtil: HttpUtilService,
        private utiltiy: UtilityService, private ngProgress: NgProgress, private spinner: NgxSpinnerService) {

    }

    ngOnInit() {
        let timeStampI = new Date();
        console.log("ngOnInit: local timeStamp:[" + timeStampI + "]");
        let timeStampS = timeStampI.toISOString();
        console.log("ngOnInit: local ISO timestamp:[" + timeStampS + "]");
        //.. send HTTP request to APPC
        this.getAppcTimestamp();
    }


    /*public download() {
      let stringData: any;
      stringData = JSON.stringify(this.paramShareService.getSessionParamData());
      let paramsKeyValueFromEditor: JSON;
      paramsKeyValueFromEditor = JSON.parse(stringData);
      let fileName = 'param_' + this.action + '_' + this.type + '_' + "0.0.1" + 'V';
      this.JSONToCSVConvertor([paramsKeyValueFromEditor], fileName, true);

    }*/

    public download() {
        if (this.apiRequest) {
            var fileName = 'test_' + this.action + '_' + this.actionIdentifiers['vnf-id'] + '_request.json';
            var theJSON = this.apiRequest;
            if (fileName != null || fileName != '') {
                var blob = new Blob([theJSON], {
                    type: 'text/json'
                });
                saveAs(blob, fileName);
            }
        }
        else {
            this.nService.error('Error', 'Please upload spreadsheet to download the request and response');
        }

        if (this.apiResponse) {
            var fileName = 'test_' + this.action + '_' + this.actionIdentifiers['vnf-id'] + '_response.json';
            var theJSON = this.apiResponse;
            if (fileName != null || fileName != '') {
                var blob = new Blob([theJSON], {
                    type: 'text/json'
                });
                saveAs(blob, fileName);
            }
        }

    }


    public abortTest() {
        //this.apiResponse = "";
        this.enableBrowse = true;
        this.enableTestButton = true;
        this.enablePollButton = true;
        if (this.subscribe && this.subscribe != undefined) this.subscribe.unsubscribe();
        this.apiResponse="Test has been abandoned and polling stopped";
        this.nService.info("Information", "Test has been abandoned and polling stopped");
    }


    excelBrowseOption() {
        $('#excelInputFile').trigger('click');
    }


    upload(evt: any) {
        /* wire up file reader */
        $('#filesparam').trigger('click');
        const target: DataTransfer = <DataTransfer>(evt.target);
        this.pollCounter = 0;
        this.uploadFileName = evt.target.files[0].name;
        var fileExtension = this.uploadFileName.substr(this.uploadFileName.lastIndexOf('.') + 1);

        if (target.files.length != 1) {
            throw new Error('Cannot upload multiple files on the entry');
        }
        if (fileExtension.toUpperCase() === 'XLS' || fileExtension.toUpperCase() === 'XLSX') {
            this.spinner.show();
            const reader = new FileReader();
            reader.onload = (e: any) => {
                /* read workbook */
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                /* grab first sheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];

                /* save data */
                this.requestId = ''
                this.enableTestButton = true;
                this.enableAbort = true;
                this.enablePollButton = true;

                if (this.subscribe && this.subscribe != undefined) {
                    this.enableCounterDiv = false;
                    this.subscribe.unsubscribe();
                }
                this.apiRequest = '';
                this.apiResponse = '';
                this.showStatusResponseDiv = false;
                this.errorResponse = '';
                this.statusResponse = '';
                this.enableDownload = true;
                let arrData = (<AOA>(XLSX.utils.sheet_to_json(ws, { blankrows: false })));



                this.vmPayload = [];
                this.subPayload = {};
                this.vmJson = {};
                this.flag = 1;
                this.payload = {};
                this.oldListName1 = '';
                this.actionIdentifiers = {};
                // Refactor
                this.payload = this.processUploadedFile(arrData);
                this.uploadedFileResult();
            };

            reader.readAsBinaryString(target.files[0]);
            setTimeout(() => {
                        /** spinner ends after 2.5 seconds */
                        this.spinner.hide();
          }, 2500);

        }
        else {
            this.nService.error('Error', 'Incorrect spreadsheet uploaded');
            this.setValuesOnFileUploadFailure();
        }
    }

    processUploadedFile(arrData) {
        let tempPayload = {};
        for (var i = 0; i < arrData.length; i++) {
            var element = arrData[i];
            if (element['TagName'] === 'action') {
                this.action = element['Value'];
            }
            if (element['List Name'] === 'action-identifiers') {
                this.vnfId = element['Value'];
                var key = element['TagName'];
                var value = element['Value'];
                if (key && value) {
                    this.actionIdentifiers[key] = value;

                }
            }

            if (element['List Name'] === 'payload') {
                var listName1 = element['List Name_1'];
                var listName2 = element['List Name_2'];
                var listName3 = element['List Name_3'];
                var key = element['TagName'];
                var value = element['Value'];
                if (listName1) {
                    if (this.oldListName1 == '' || (listName1 === this.oldListName1)) {
                        this.constructTestPayload(listName2, listName3, key, value);
                        tempPayload[listName1] = this.subPayload;
                    }
                    else {
                        this.subPayload = {};
                        this.constructTestPayload(listName2, listName3, key, value);
                        tempPayload[listName1] = this.subPayload;
                    }
                    this.oldListName1 = listName1;
                }
                else {
                    tempPayload[key] = value;
                }
            }
        }

        return tempPayload;
    }

    uploadedFileResult() {
        if (this.action && this.actionIdentifiers['vnf-id']) {
            this.nService.success('Success', 'SpreadSheet uploaded successfully');
        }
        else {
            this.setValuesOnFileUploadFailure();
            this.nService.error("Error", "Please check the contents of the file uploaded")
        }
    }



    constructTestPayload(listName2, listName3, key, value) {
        if ((listName2 == undefined || listName2 == '') && (listName3 == undefined || listName3 == '')) {
            this.subPayload[key] = value;
        }
        if (listName2) {

            if (!listName3) {

                //vmPayload.push(vmJson)
                this.vmJson = {};
                this.vnfcJson = {};
                this.vmJson[key] = value;
                this.flag = 0;
            }
            else {
                this.vnfcJson[key] = value;
                this.vmJson['vnfc'] = [this.vnfcJson];
                this.flag = 1;
            }
            if (this.vmJson) this.lastvmJson = this.vmJson;
            if (this.flag == 0) {
                this.vmPayload.push(this.lastvmJson);
                if (this.vmPayload) this.subPayload['vm'] = this.vmPayload;
            }
        }
    }

    constructRequest() {
        this.timeStampInt = Date.now(); //.. milliseconds
        let timeStamp;
        console.log("constructRequest: isAppcTimestampReceived:" +
            (this.isAppcTimestampReceived ? "true" : "false"));
        if (this.isAppcTimestampReceived) {
            console.log("constructRequest: AppcTimeDiff:[" + this.AppcTimeDiff + "]");
            this.timeStampInt += this.AppcTimeDiff;
            timeStamp = new Date(this.timeStampInt).toISOString();
            console.log("constructRequest: got timeStamp from APPC:[" + timeStamp + "]");
        }
        else { //.. still not received
            console.log('constructRequest: Appc Timestamp is not ready (use local)');
            this.timeStampInt -= 100000;
            timeStamp = new Date(this.timeStampInt).toISOString();
        };
        console.log('constructRequest: timeStamp:[' + timeStamp + ']');
        let reqId;
        this.requestId = reqId = new Date().getTime().toString();
        let data = {
            'input': {
                'common-header': {
                    'timestamp': timeStamp,
                    'api-ver': '2.00',
                    'originator-id': this.userId,
                    'request-id': this.requestId,
                    'sub-request-id': this.requestId,
                    'flags': {
                        'mode': 'NORMAL',
                        'force': this.force.toString().toUpperCase(),
                        'ttl': 3600
                    }
                },
                'action': this.action,
                'action-identifiers': this.actionIdentifiers,
                'payload': JSON.stringify(this.payload)
            }
        };
        if (this.action == 'Unlock') {
            let payload = JSON.parse(data.input['payload']);
            data.input['common-header']['request-id'] = payload['request-id'];
            data.input['common-header']['sub-request-id'] = payload['request-id'];
        }

        if(this.action == 'Unlock' || this.action == 'Lock' || this.action == 'CheckLock') {
            delete data.input['payload'];
        }

        return data;
    }

    testVnf() {
        this.enableBrowse = false;
        this.enableTestButton = false;
        this.enablePollButton = false;
        this.timer = Observable.interval(10000);
        if(this.action == 'Unlock' || this.action == 'Lock' || this.action == 'CheckLock') {
            this.enablePollButton = true;
            this.enableBrowse = true;
            this.enableTestButton = true;
            this.requestId = '';
        } else {
            this.subscribe = this.timer.subscribe((t) => this.pollTestStatus());
        }
        this.ngProgress.start();
        this.apiRequest = JSON.stringify(this.constructRequest());

        this.httpUtil.postWithAuth(
            {
                url: environment.testVnf + "?urlAction=" + this.getUrlEndPoint(this.action),
                data: this.apiRequest
            })
            .subscribe(resp => {
                this.apiResponse = JSON.stringify(resp);
                this.enableBrowse = true;
                this.enableTestButton = true;
                this.ngProgress.done();
            },
                error => {
                    this.nService.error('Error', 'Error in connecting to APPC Server');
                    // this.enableBrowse = true;
                    this.enableTestButton = true;
                    this.enablePollButton = true;
                    this.enableCounterDiv = false;
                    this.enableBrowse = true;
                    if (this.subscribe && this.subscribe != undefined) this.subscribe.unsubscribe();

                });

        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }

    getAppcTimestamp() {
        this.timeStampInt = Date.now(); //.. milliseconds
        console.log("getAppcTimestamp: timeStampInt:[" + this.timeStampInt + "]");
        let timeStampP = new Date(this.timeStampInt).toISOString();
        console.log("getAppcTimestamp: from int timestamp:[" + timeStampP + "]");
        this.isAppcTimestampReceived = false;
        let reqId = new Date().getTime().toString();
        try {
            let data = {
                'input': {
                    'design-request': {
                        'request-id': reqId,
                        'action': 'getAppcTimestampUTC',
                        'payload': '{}'
                    }
                }
            };
            console.log('getAppcTimestamp: sending httpUtil.post...');
            this.httpUtil.postWithAuth(
                {
                    url: environment.getDesigns, data: data
                })
                .subscribe(resp => {
                    this.appcTimestampResponse = resp;
                    // this.appcTimestampResponse = JSON.stringify(resp);
                    console.log('appcTimestampResponse:[' + resp + ']');
                    this.parseAppcTimestamp(this.appcTimestampResponse);
                });
        }
        catch (e) {
            this.nService.warn('status',
                'Error while retrieving APPC Timestamp(using local by default)!');
        }
    }

    parseAppcTimestamp(tstampStr: string) {
        //.. parse the response to get timestamp as milliseconds
        // input format: YYYY-MM-DDTHH:mm:ss.sssZ (24 chars)
        var rexp =
            new RegExp(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/);
        var mresult = rexp.exec(tstampStr);
        if (mresult[0]) {
            console.log("parseAppcTimestamp: response format is OK...");
            var aYearS = mresult[1];
            var aYear = parseInt(aYearS, 10);
            var aMonS = mresult[2];
            var aMon = parseInt(aMonS, 10) - 1;
            var aDayS = mresult[3];
            var aDay = parseInt(aDayS, 10);
            var aHrS = mresult[4];
            var aHr = parseInt(aHrS, 10);
            var aMntS = mresult[5];
            var aMnt = parseInt(aMntS, 10);
            var aSecS = mresult[6];
            var aSec = parseInt(aSecS, 10);
            var aMsecS = mresult[7];
            var aMsec = parseInt(aMsecS, 10);
            this.AppcTimeStampInt =
                Date.UTC(aYear, aMon, aDay, aHr, aMnt, aSec, aMsec);
            console.log(
                "parseAppcTimestamp: AppcTimeStampInt:[" + this.AppcTimeStampInt + "]");
            let timeStampP = new Date(this.AppcTimeStampInt).toISOString();
            console.log("parseAppcTimestamp: from int timestamp:[" + timeStampP + "]");
            //.. AppcTimeDiff - time difference in milliseconds
            this.AppcTimeDiff = this.AppcTimeStampInt - this.timeStampInt;
            console.log("parseAppcTimestamp: AppcTimeDiff:[" + this.AppcTimeDiff + "]");
            this.isAppcTimestampReceived = true;
        }
        else {
            throw new Error(
                'The received APPC Timestamp is not matching expected format: YYYY-MM-DDTHH:mm:ss.sssZ !');
        }
    }

    pollTestStatus() {
        if (this.requestId && this.actionIdentifiers['vnf-id']) {
            // console.log("payload==" + JSON.stringify(this.payload))
            this.timeStampInt = Date.now(); //.. milliseconds
            let timeStamp;
            console.log("pollTestStatus: isAppcTimestampReceived:" +
                (this.isAppcTimestampReceived ? "true" : "false"));
            if (this.isAppcTimestampReceived) {
                this.timeStampInt += this.AppcTimeDiff;
                timeStamp = new Date(this.timeStampInt).toISOString();
                console.log("pollTestStatus: got timeStamp from APPC:[" + timeStamp + "]");
            }
            else { //.. still not received
                console.log('pollTestStatus: Appc Timestamp is not ready (use local)');
                this.timeStampInt -= 100000;
                timeStamp = new Date(this.timeStampInt).toISOString();
            };
            console.log("pollTestStatus: timestamp:[" + timeStamp + "]");
            let reqId = new Date().getTime().toString();
            let data = {
                'input': {
                    'common-header': {
                        'timestamp': timeStamp,
                        'api-ver': '2.00',
                        'originator-id': this.userId,
                        'request-id': reqId,
                        'sub-request-id': reqId,
                        'flags': {
                            'mode': 'NORMAL',
                            'force': this.force.toString().toUpperCase(),
                            'ttl': 3600
                        }
                    },
                    'action': 'ActionStatus',
                    'action-identifiers': {
                        'vnf-id': this.actionIdentifiers['vnf-id']
                    },
                    'payload': '{"request-id":' + this.requestId + '}'
                }
            };
            this.httpUtil.postWithAuth(
                {
                    url: environment.checkTestStatus, data: data

                })
                .subscribe(resp => {
                    this.statusResponse = JSON.stringify(resp);
                    var status = ''
                    var statusReason = ''
                    this.enableCounterDiv = true;
                    this.pollCounter++;
                    if (resp.output) var timeStamp = resp.output['common-header'].timestamp;
                    if (resp.output.payload) {
                        var payload = resp.output.payload.replace(/\\/g, "")
                        try {
                            payload = JSON.parse(payload)
                            status = payload['status'];
                            statusReason = payload['status-reason'];
                        }
                        catch (err) {
                            console.log("error" + err)
                        }
                    }
                    if (timeStamp && status && statusReason) {
                        this.showStatusResponseDiv = true;
                        this.outputTimeStamp = timeStamp;
                        this.status = status;
                        this.statusReason = statusReason;
                        if (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'SUCCESSFUL') {
                            if (this.subscribe && this.subscribe != undefined) this.subscribe.unsubscribe();
                            this.enablePollButton = true;
                            this.enableBrowse = true;
                            this.enableTestButton = true;
                        }
                        if (status.toUpperCase() === 'FAILED') {
                            if (this.subscribe && this.subscribe != undefined) this.subscribe.unsubscribe();
                            this.enablePollButton = true;
                            this.enableBrowse = true;
                            this.enableTestButton = true;
                        }
                    }
                    else {
                        this.showStatusResponseDiv = false;
                        if (this.subscribe && this.subscribe != undefined) {
                            this.subscribe.unsubscribe();
                            this.enablePollButton = true;
                        }

                    }

                },
                    error => {
                        this.statusResponse = null;
                        this.showStatusResponseDiv = false;
                        this.errorResponse = 'Error Connecting to APPC server';
                        this.enableCounterDiv = false;
                        this.enableBrowse = true;
                        this.enableTestButton = true;
                        if (this.subscribe && this.subscribe != undefined) {
                            this.subscribe.unsubscribe();
                            this.enablePollButton = true;
                        }
                    });

        }
        else {
            this.nService.error("Error", "Please enter vnf Id & request Id");
        }

    }

    getUrlEndPoint(action) {
        let charArray = action.split('');
        let url = '';
        for (let i = 0; i < charArray.length; i++) {
            if (charArray[i] == charArray[i].toUpperCase() && i != 0) {
                url = url + '-';
            }
            url = url + charArray[i];
        }

        return url.toLowerCase();
    }

    setValuesOnFileUploadFailure() {        
        this.flag = 1;
        this.oldListName1 = '';
        this.vmJson = {};
        this.vnfcJson = {};
        this.subPayload = {};
        this.vmPayload = [];
        this.payload = {};
        this.action = '';
        this.actionIdentifiers = {};
        this.apiRequest = '';
        this.apiResponse = '';
        this.enableCounterDiv = false;
        this.enableAbort = false;
        this.enableTestButton = false;
        this.enableDownload = false;
    }

}
