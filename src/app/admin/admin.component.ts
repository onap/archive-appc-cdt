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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUtilService } from '../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../shared/services/mapping-editor.service';
import { ParamShareService } from '../shared/services/paramShare.service';
import { environment } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';
import { APIService } from "../shared/services/cdt.apicall";
import { UtilityService } from '../shared/services/utilityService/utility.service';
import { NotificationsService } from 'angular2-notifications';


@Component({ selector: 'admin', templateUrl: './admin.component.html', styleUrls: ['./admin.component.css']})
export class AdminComponent implements OnInit {
    displayAnsibleServerData: Array<Object> = [];
    ansibleServerData;
    sortOrder = false;
    noData = false;
    sortBy: string;
    filter: Object = {};
    noDataMsg: string;
    errorMessage = '';
    invalid = true;
    currentUser;
    fileName = "ansible_admin_FQDN_Artifact_0.0.1V.json";

    options = {
        timeOut: 4000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };

    constructor (
        private paramShareService: ParamShareService,
        private ngProgress: NgProgress,
        private httpUtil: HttpUtilService,
        private router: Router,
        private activeROute: ActivatedRoute,
        private mappingEditorService: MappingEditorService,
        private modalService: NgbModal,
        private apiService:APIService,
        private utilService: UtilityService,
        private nService: NotificationsService
        ) {
    }

    ngOnInit() {
        const apiToken = localStorage['apiToken'];
        this.currentUser = localStorage['userId'];

        if(this.paramShareService.ansibleServerData) {
            this.ansibleServerData = this.paramShareService.ansibleServerData;
            console.log("cached ansibleServerData===>"+JSON.stringify(this.ansibleServerData));
            this.formatRawData();
        } else {
            //testing
            //this.ansibleServerData = "{\"fqdn-list\":[{\"vnf-management-server-fqdn\": \"fqdn-value1:url\:port\",\"cloud-owner-list\":[{\"cloud-owner\": \"owner1\",\"region-id-list\": [{\"region-id\": \"regiodnid1\",\"tenant-id-list\": [\"tenantid1\",\"tenantid2\"]},{\"region-id\": \"regiondid2\",\"tenant-id-list\": [\"tenantid1\",\"tenantid2\"]}]},{\"cloud-owner\": \"owner2\",\"region-id-list\": [{\"region-id\": \"regionid1\",\"tenant-id-list\": [\"tenantid1\",\"tenantid2\"]}]}],\"description\": \"fqdn for east zone vUSP Production\",\"username\": \"albino attuid\",\"create-date\": \"\",\"modify-username\": \"Asgar\",\"modify-date\": \"10/26/2018\"}]}";
            //this.ansibleServerData = JSON.parse(this.ansibleServerData);
            //this.formatRawData();
            this.getArtifacts();
        }
        
    }

    getArtifacts() {

         const input = {
            "input":{
                "design-request":{
                    "request-id":localStorage['apiToken'],
                    "action":"getArtifact",
                    "payload":"{\"vnf-type\":\"NULL\",\"vnfc-type\":\"NULL\",\"protocol\":\"\",\"incart\":\"N\",\"action\":\"NULL\",\"artifact-name\":\""+this.fileName+"\",\"artifact-type\":\"APPC-CONFIG\",\"userID\":\"admin\"}"
                }
            }
        };
        //const x = JSON.parse(data.input['design-request']['payload']);
        //x.userID = localStorage['userId'];
        //data.input['design-request']['payload'] = JSON.stringify(x);
         console.log("input to payload====", JSON.stringify(input));

        this.ngProgress.start();
      
        this.apiService.callGetArtifactsApi(input).subscribe(data => {
          
            if( this.utilService.checkResult(data)) {
                console.log("response===>"+JSON.stringify(data));
                this.ansibleServerData = JSON.parse(data.output.data.block).artifactInfo[0]["artifact-content"];
                this.ansibleServerData = JSON.parse(this.ansibleServerData);
                console.log("ansibleServerData===>"+JSON.stringify(this.ansibleServerData))
                this.paramShareService.ansibleServerData = this.ansibleServerData;
                this.formatRawData();
            } 
            this.ngProgress.done();
        },
        error => {
          
          this.nService.error('Error',
            'Error in connecting to APPC Server', this.options );
        });
       
       
    }

    formatRawData(){
        this.displayAnsibleServerData = [this.ansibleServerData["fqdn-list"].length];
        console.log("length==>"+this.ansibleServerData["fqdn-list"].length)
        for(let i=0;i<this.ansibleServerData["fqdn-list"].length;i++) {
            let fqdl = this.ansibleServerData["fqdn-list"][i];
            this.displayAnsibleServerData[i] = {};
            let cloudInfoArray = [];
            let serverAndPort = fqdl["vnf-management-server-fqdn"];
            this.displayAnsibleServerData[i]['serverandport'] = serverAndPort;
            let splitArray = serverAndPort.split(":");
            let regEx = new RegExp(":"+splitArray[splitArray.length-1]+"$", "g");
            this.displayAnsibleServerData[i]['server'] = serverAndPort.replace(regEx, "");
            this.displayAnsibleServerData[i]['port'] = "";
            if(splitArray.length > 1) {
                this.displayAnsibleServerData[i]['port'] = splitArray[splitArray.length-1];
            }
            let clouditem = "";
            for(let j=0; j<fqdl["cloud-owner-list"].length;j++) {
                let cloudOwnerItem = fqdl["cloud-owner-list"][j];
                let cloud = cloudOwnerItem["cloud-owner"];
                let cloudrow;
                let ownerid = cloud;
                
                for(let k=0; k<cloudOwnerItem["region-id-list"].length; k++) {
                    let regionItem = cloudOwnerItem["region-id-list"][k];
                    let regionrow = cloud + " / " + regionItem["region-id"];
                    let regionid = regionItem["region-id"];
                    console.log("regionrow : "+regionrow);
                    for(let m=0; m<regionItem["tenant-id-list"].length; m++) {
                        cloudrow = regionrow + " / " + regionItem["tenant-id-list"][m]+"\n";
                        console.log("cloudrow : "+cloudrow);
                        clouditem = clouditem + cloudrow;
                        console.log("clouditem : "+clouditem);
                        let tenantid = regionItem["tenant-id-list"][m];
                        cloudInfoArray.push({"ownerid": ownerid, "regionid": regionid, "tenantid": tenantid});
                        console.log("info===>"+JSON.stringify({"ownerid": ownerid, "regionid": regionid, "tenantid": tenantid}))
                    }
                
                }
                
            }
            console.log("info array==>"+JSON.stringify(cloudInfoArray))
            this.displayAnsibleServerData[i]["info"] = cloudInfoArray;
            this.displayAnsibleServerData[i]["cloud"] = clouditem;
            this.displayAnsibleServerData[i]["descr"] = fqdl["description"];
            this.displayAnsibleServerData[i]["creator"] = fqdl["username"];
            this.displayAnsibleServerData[i]["created-date"] = fqdl["create-date"];
            this.displayAnsibleServerData[i]["modifier"] = fqdl["modify-username"];
            this.displayAnsibleServerData[i]["modified-date"] = fqdl["modify-date"];

        }
    }



    viewAnbsibleServer(selectedConfig, updateIndex) {
        sessionStorage.setItem('updateIndex', updateIndex);
        sessionStorage.setItem('ansibleserver', JSON.stringify(selectedConfig));

        this
            .router
            .navigate(['../ansible-server'], {
                relativeTo: this.activeROute
            });
    }

    createAnsibleServer() {
        let newServer = {"server":"","port":"","info":[],"cloud":"","descr":"","creator":this.currentUser,"created-date":this.utilService.getDate(),"modifier":"","modified-date":""};
        sessionStorage.setItem('ansibleserver', JSON.stringify(newServer));
        
        if(this.ansibleServerData) {
            sessionStorage.setItem('updateIndex', this.ansibleServerData["fqdn-list"].length);
        } else {
            sessionStorage.setItem('updateIndex', '0');
        }

        this
            .router
            .navigate(['../ansible-server'], {
                relativeTo: this.activeROute
            });
    }

   
    saveToAppc() {
        let artifactContent = this.utilService.appendSlashes(JSON.stringify(this.paramShareService.ansibleServerData));
        let input = {
                "input": {
                    "design-request": {
                        "request-id": localStorage['apiToken'],
                        "action": "uploadAdminArtifact",
                        "payload": "{\"userID\": \"admin\",\"vnf-type\" : \"NULL \",\"action\" : \"NULL\",\"artifact-name\" : \""+this.fileName+"\",\"artifact-type\" : \"APPC-CONFIG\",\"artifact-version\" : \"0.1\",\"artifact-contents\":\""+artifactContent+"\"}",
                    }
                }
            }
        let response = this.apiService.callGetArtifactsApi(input);
        response.subscribe(response => {
          this.utilService.processApiSubscribe(response, this.utilService.putAction, "admin artifact");
          //this.clearCache();
        },
        error => this.utilService.processApiError());
    }

    // ngOnDestroy() {
    //     console.log("destry....")
    // }

    clearCache() {
        this.paramShareService.ansibleServerData = undefined;
        sessionStorage.removeItem('ansibleserver');
    }

    download() {
        if(this.ansibleServerData){
            this.utilService.downloadArtifactToPc(JSON.stringify(this.ansibleServerData, null, '\t'), "json", this.fileName, 100)
        }
    }

}