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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUtilService } from '../../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../../shared/services/mapping-editor.service';
import { ParamShareService } from '../../shared/services/paramShare.service';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';
import { NotificationsService } from 'angular2-notifications';

@Component({ selector: 'app-myvnfs', templateUrl: './myvnfs.component.html', styleUrls: ['./myvnfs.component.css'] })
export class MyvnfsComponent implements OnInit {
    vnfData: Array<Object> = [];
    sortOrder = false;
    noData = true;
    sortBy: string;
    filter: Object = {};
    noDataMsg: string;
    vnfType: any;
    vnfcType: any;
    options = {
    timeOut: 1000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 200
    }

    constructor (private paramShareService: ParamShareService, private ngProgress: NgProgress, private httpUtil: HttpUtilService, private router: Router, private activeROute: ActivatedRoute,
        private mappingEditorService: MappingEditorService, private modalService: NgbModal,private nService: NotificationsService) {
    }

    ngOnInit() {

        sessionStorage.setItem('updateParams', undefined);
        this.mappingEditorService.latestAction = undefined;
        const apiToken = localStorage['apiToken'];

        const data = {
            'input': {
                'design-request': {
                    'request-id': apiToken,
                    'action': 'getDesigns',
                    'payload': '{"userID": "","filter":"reference"}'
                }
            }
        };
        const x = JSON.parse(data.input['design-request']['payload']);
        x.userID = localStorage['userId'];
        data.input['design-request']['payload'] = JSON.stringify(x);
        // console.log("input to payload====", JSON.stringify(data));
        this.getArtifacts(data);
        this.clearCache();
    }

    getArtifacts(data) {
        this.ngProgress.start();
        this.httpUtil.post({
            url: environment.getDesigns,
            data: data
        })
            .subscribe(resp => {
                console.log("resp:",resp);
                const tempObj = JSON.parse(resp.output.data.block);
                this.vnfData = tempObj.designInfo;
                if (this.vnfData == undefined || this.vnfData == null || this.vnfData.length == 0) {
                    this.noData = true;

                    this.noDataMsg = resp.output.data.status.message;
                } else {
                    this.noData = false;
                }
                console.log(this.noData);
                this.ngProgress.done();
            }
            ,
        error => {
            
            this.nService.error("Error", "Error in connecting to APPC Server")}
        
        );
 
        this.filter = ['vnf-type', 'vnfc-type', 'artifact-name'];
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }



    getData() {
    }

    buildNewDesign(content) {

        this.modalService.open(content).result.then(res => {
            this.mappingEditorService.referenceNameObjects = undefined;
            sessionStorage.setItem('vnfParams', JSON.stringify({ vnfType: this.vnfType, vnfcType: this.vnfcType }));
            this
                .router
                .navigate([
                    'vnfs', 'design', 'references'
                ]);
        });


    }

    navigateToReference(item) {
        sessionStorage.setItem('updateParams', JSON.stringify(item));
        this.mappingEditorService.referenceNameObjects = undefined;

        this
            .router
            .navigate(['../design/references'], {
                relativeTo: this.activeROute,
                queryParams: {
                    id: item.id
                }
            });
    }

    navigateToRefrenceUpdate() {

        this
            .router
            .navigate(['../design/references/update'], {
                relativeTo: this.activeROute,
                queryParams: {
                    id: '10'
                }
            });
    }

    clearCache() {
        // get the value and save the userid and persist it.

        this.mappingEditorService.setTemplateMappingDataFromStore(undefined);
        localStorage['paramsContent'] = '{}';
        this.mappingEditorService.setParamContent(undefined);
        this.paramShareService.setSessionParamData(undefined);
        const appData = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
        const downloadData = {
            reference: {},
            template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
            pd: { pdData: '', pdFileName: '' }
        };
        this.mappingEditorService.changeNavAppData(appData);
        this.mappingEditorService.changeNavDownloadData(downloadData);
    }


}