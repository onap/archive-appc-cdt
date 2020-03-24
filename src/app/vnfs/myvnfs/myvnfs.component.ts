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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUtilService } from '../../shared/services/httpUtil/http-util.service';
import { Subscription } from 'rxjs/Subscription';
import { MappingEditorService } from '../../shared/services/mapping-editor.service';
import { ParamShareService } from '../../shared/services/paramShare.service';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from 'ngx-progressbar';
import { NotificationsService } from 'angular2-notifications';
import { appConstants } from '../../../constants/app-constants'

@Component({ selector: 'app-myvnfs', templateUrl: './myvnfs.component.html', styleUrls: ['./myvnfs.component.css'] })
export class MyvnfsComponent implements OnInit, OnDestroy {
    vnfData: Array<Object> = [];
    sortOrder = false;
    noData = true;
    sortBy: string;
    filter: Object = {};
    noDataMsg: string;
    vnfType: any;
    vnfcType: any;
    vnfcRequired: boolean = false;
    errorMessage = '';
    invalid = true;
    options = {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    }
    subscription: Subscription;

    constructor (private paramShareService: ParamShareService, private ngProgress: NgProgress, private httpUtil: HttpUtilService, private router: Router, private activeROute: ActivatedRoute,
        private mappingEditorService: MappingEditorService, private modalService: NgbModal) {
    }

    ngOnInit() {

        sessionStorage.setItem('updateParams', undefined);
        this.mappingEditorService.latestAction = undefined;
        const apiToken = sessionStorage['apiToken'];

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
        x.userID = sessionStorage['userId'];
        data.input['design-request']['payload'] = JSON.stringify(x);
        // console.log("input to payload====", JSON.stringify(data));
        this.getArtifacts(data);
        this.clearCache();
    }

    ngOnDestroy() {
        if (this.subscription) { this.subscription.unsubscribe() };
    }

    getArtifacts(data) {
        let tempObj: any;
        this.ngProgress.start();
        this.httpUtil.postWithAuth({
            url: environment.getDesigns,
            data: data
        })
            .subscribe(resp => {
                if (resp.output.data.block !== undefined && resp.output.data.block !== null && resp.output.data.block.length !== 0) {
                    tempObj = JSON.parse(resp.output.data.block);
                    this.vnfData = tempObj.designInfo;
                }
                if (this.vnfData === undefined || this.vnfData === null || this.vnfData.length === 0) {
                    this.noData = true;
                    // this.noDataMsg = resp.output.status.message;
                } else {
                    this.noData = false;
                }
                this.ngProgress.done();
            });

        this.filter = ['vnf-type', 'vnfc-type', 'artifact-name'];
        setTimeout(() => {
            this.ngProgress.done();
        }, 3500);
    }



    getData() {
    }

    buildNewDesign(response) {

        // this.modalService.open(content).result.then(res => {
        //     if(res=='yes'){
        //         sessionStorage.setItem('vnfParams', JSON.stringify({ vnfType: this.vnfType}));
        //         sessionStorage.setItem("vnfcSelectionFlag",''+this.vnfcRequired+'')
        //     } else{
        //         sessionStorage.setItem('vnfParams',"")
        //     }

        //     this.mappingEditorService.referenceNameObjects = undefined;
        //     this.mappingEditorService.identifier = '';
        //     //this.mappingEditorService.newObject = {};
        //     this.router.navigate([
        //             'vnfs', 'design', 'references'
        //     ]);

        // });

        if (response == 'yes') {
            sessionStorage.setItem('vnfParams', JSON.stringify({ vnfType: this.vnfType }));
            sessionStorage.setItem("vnfcSelectionFlag", '' + this.vnfcRequired + '')
        } else {
            sessionStorage.setItem('vnfParams', "")
        }

        this.mappingEditorService.referenceNameObjects = undefined;
        this.mappingEditorService.identifier = '';
        //this.mappingEditorService.newObject = {};
        this.router.navigate([
            'vnfs', 'design', 'references'
        ]);
    }

    validateVnfName(name) {
        if (!name.trim() || name.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        } else if (name.startsWith(' ') || name.endsWith(' ')) {
            this.errorMessage = 'Leading and trailing spaces are not allowed';
            this.invalid = true;
        } else if (name.includes('  ')) {
            this.errorMessage = 'More than one space is not allowed in VNF Type';
            this.invalid = true;
        } else if (name.length > 150) {
            this.errorMessage = 'VNF Type should be of minimum one character and maximum 150 character';
            this.invalid = true;
        } else {
            this.invalid = false;
            this.errorMessage = '';
        }
    }

    navigateToReference(item) {
        sessionStorage.setItem('updateParams', JSON.stringify(item));
        this.mappingEditorService.referenceNameObjects = undefined;
        sessionStorage.setItem('vnfParams', JSON.stringify({ vnfType: item.vnfType, vnfcType: item.vnfcType }));
        this.mappingEditorService.identifier = '';
        if (this.mappingEditorService.newObject && this.mappingEditorService.newObject.vnfc != undefined) {
            this.mappingEditorService.newObject.vnfc = '';
        }
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
        sessionStorage.setItem("vnfcSelectionFlag", '' + this.vnfcRequired + '')
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
    defineData(item) {
        let artVnfc = item['artifact-name'].substring(this.lastIndexofEnd("AllAction_", item['artifact-name']), item['artifact-name'].lastIndexOf("_"))
        if (item['vnf-type'] == artVnfc && item['vnfc-type'] == 'null') {

            return item['vnfc-type']
        } else {
            return ""
        }

    }
    lastIndexofEnd(str, originlStr) {
        var io = originlStr.lastIndexOf(str);
        return io == -1 ? -1 : io + str.length;
    }


}
