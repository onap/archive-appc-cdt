/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Copyright (C) 2018 IBM Intellectual Property. All rights reserved.
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

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { MyvnfsComponent } from './myvnfs.component';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './../../shared/services/notification.service';
import { ParamShareService } from './../../shared/services/paramShare.service';
import { MappingEditorService } from './../../shared/services/mapping-editor.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpUtilService } from '.././../shared/services/httpUtil/http-util.service';
import { UtilityService } from '.././../shared/services/utilityService/utility.service';
// import{TableFilterPipe} from '.././../shared/modules/tidy-table/table-filter.pipe';
import { TidyTableModule } from '../../shared/modules/tidy-table/tidy-table.module';
import { NgModule } from '@angular/core';
import { NgProgress } from 'ngx-progressbar';
import { NotificationsService } from 'angular2-notifications';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
    HttpModule,
    Http,
    Response,
    ResponseOptions,
    XHRBackend
} from '@angular/http';

import { MockBackend } from '@angular/http/testing';
describe('MyvnfsComponent', () => {
    let component: MyvnfsComponent;
    let fixture: ComponentFixture<MyvnfsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyvnfsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [FormsModule, RouterTestingModule, TidyTableModule, HttpModule, NgbModule.forRoot()],
            providers: [

                { provide: XHRBackend, useClass: MockBackend },
                NgProgress, UtilityService, ParamShareService, DialogService, NotificationService, HttpUtilService, MappingEditorService, NotificationsService]

        })
            .compileComponents();
    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(MyvnfsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create myvnfscomponent', () => {
        expect(component).toBeTruthy();
    });
    it('Post call to get artifact', inject([HttpUtilService, XHRBackend], (httpUtilService, mockBackend) => {

        const mockResponse = {
            "output": {
                "data": {
                    "block": "{\"userID\":\"ug0221\",\"designInfo\":[{\"vnf-type\":\"demo123\",\"vnfc-type\":\"null\",\"protocol\":\"\",\"incart\":\"N\",\"action\":\"AllAction\",\"artifact-name\":\"reference_AllAction_demo123_0.0.1V.json\",\"artifact-type\":\"APPC-CONFIG\"}],\"statusInfo\":null,\"artifactInfo\":null}",
                    "status":{
                        "code": "400",
                        "message": "success"
                    }
                }
            }
        }

        //"{'userID':'ug0221','designInfo':[{'vnf-type':'demo123','vnfc-type':'null','protocol':'','incart':'N','action':'AllAction','artifact-name':'reference_AllAction_demo123_0.0.1V.json','artifact-type':'APPC-CONFIG'}]}"
        const data = {
            'input': {
                'design-request': {
                    'request-id': "apiToken",
                    'action': 'getDesigns',
                    'payload': '{"userID": "","filter":"reference"}'
                }
            }
        };


        mockBackend.connections.subscribe((connection) => {
            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(mockResponse)
            })));
        });
        component.getArtifacts(data)
        httpUtilService.post({
            url: "test url",
            data: data
        }).subscribe((resp) => {
            console.log("resp")
            console.log(resp)
            let  block = JSON.parse(resp.output.data.block)
            expect(block.userID).toBe("ug0221");
            


            
        });


    }))
    it('Checking for the successfull post call', inject([HttpUtilService, XHRBackend], (httpUtilService, mockBackend) => {

        const mockResponse = {
            "output": {
                "data": {
                    "block": "{\"userID\":\"ug0221\",\"designInfo\":[{\"vnf-type\":\"demo123\",\"vnfc-type\":\"null\",\"protocol\":\"\",\"incart\":\"N\",\"action\":\"AllAction\",\"artifact-name\":\"reference_AllAction_demo123_0.0.1V.json\",\"artifact-type\":\"APPC-CONFIG\"}],\"statusInfo\":null,\"artifactInfo\":null}",
                    "status":{
                        "code": "400",
                        "message": "success"
                    }
                }
            }
        }
        const data = {
            'input': {
                'design-request': {
                    'request-id': "apiToken",
                    'action': 'getDesigns',
                    'payload': '{"userID": "","filter":"reference"}'
                }
            }
        };


        mockBackend.connections.subscribe((connection) => {
            connection.mockRespond(new Response(new ResponseOptions({
                body: JSON.stringify(mockResponse)
            })));
        });
        component.getArtifacts(data)
        httpUtilService.post({
            url: "test url",
            data: data
        }).subscribe((resp) => {
            console.log("resp")
            console.log(resp)
            let  block = JSON.parse(resp.output.data.status.code)
            console.log("code",block)
            expect(block).toBe(400);     
        });
    }));

    it('should test navigateToReference', ()=>{
        component.navigateToReference({paramData : 'data'});
        expect(JSON.parse(sessionStorage.getItem('updateParams'))).toEqual({paramData : 'data'});
    });

    it('should test validateVnfName function with empty name value', ()=>{
        component.validateVnfName('');
        expect(component.errorMessage).toBe('');
        expect(component.invalid).toBe(true);
    });

    it('should test validateVnfName function with name value leading and trailing white spaces', ()=>{
        component.validateVnfName(' name ');
        expect(component.errorMessage).toBe('Leading and trailing spaces are not allowed');
        expect(component.invalid).toBe(true);
    });

    it('should test validateVnfName function with name including more than one space', ()=>{
        component.validateVnfName('na  me');
        expect(component.errorMessage).toBe('More than one space is not allowed in VNF Type');
        expect(component.invalid).toBe(true);
    });

    it('should test validateVnfName function with name length greated than 150', ()=>{
        component.validateVnfName('namenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenanamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenamenanamenamnamenamename');
        expect(component.errorMessage).toBe('VNF Type should be of minimum one character and maximum 150 character');
        expect(component.invalid).toBe(true);
    });

    it('should test validateVnfName function with valid name value', ()=>{
        component.validateVnfName('name');
        expect(component.errorMessage).toBe('');
        expect(component.invalid).toBe(false);
    });

    it('should test buildNewDesign method with respons yes', ()=> {        
        component.vnfType = 'ABC';
        component.vnfcRequired = true;
        component.buildNewDesign('yes');
        let vnfparams = sessionStorage.getItem('vnfParams');
        let vnfcSelectionFlag = sessionStorage.getItem('vnfcSelectionFlag');
        expect(vnfparams).toBe('{"vnfType":"ABC"}');
        expect(vnfcSelectionFlag).toBe("true");
    });

    it('should test buildNewDesign method with response other than yes', ()=> {        
        component.vnfType = 'ABC';
        component.vnfcRequired = true;
        component.buildNewDesign('No');
        let vnfparams = sessionStorage.getItem('vnfParams');
        expect(vnfparams).toBe("");
    });
});