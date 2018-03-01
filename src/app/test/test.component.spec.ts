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

/* tslint:disable:no-unused-variable */

// Modules
import { async, ComponentFixture, TestBed,inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { Http, Response, Headers, RequestOptions, HttpModule } from '@angular/http';

// Component
import { TestComponent } from './test.component';

// Services
import { NotificationService } from '../shared/services/notification.service';
import { ParamShareService } from '.././shared/services/paramShare.service';
import { MappingEditorService } from '../shared/services/mapping-editor.service';
import { HttpUtilService } from '../shared/services/httpUtil/http-util.service';
import { UtilityService } from '../shared/services/utilityService/utility.service';
import { NgProgress } from 'ngx-progressbar';
import {NgProgressModule} from 'ngx-progressbar';

describe( 'TestComponent', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [
            FormsModule,
            RouterTestingModule,
            SimpleNotificationsModule,
            HttpModule,
            NgProgressModule
            ],
            providers: [
            NotificationService,
            ParamShareService,
            MappingEditorService,
            HttpUtilService,
            UtilityService,
            NgProgress
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it( 'should create', () => {
        expect(component).toBeTruthy();
    });

    // it('test', () => {
    //     expect(2).toEqual(1)
    // });


    // it('test preparfilename', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    //     // fixture = TestBed.createComponent(TestComponent);
    //     // component = fixture.componentInstance;
    //     mappingEditorService.latestAction=undefined

    //         expect(component.prepareFileName()).toBe(undefined);
    //     }));


    it('Should have download method', () => {
        expect(component.download).toBeDefined();
    });

    // Test abortTest Method
    it('Should have abortTest method', () => {
        expect(component.abortTest).toBeDefined();
    });

    it('Test abortTest Method', () => {
        const temp = component.abortTest();
        expect(component.enableBrowse).toBeTruthy();
        expect(component.enableTestButton).toBeTruthy();
    });

    it('Should have excelBrowseOption method', () => {
        expect(component.excelBrowseOption).toBeDefined();
    });

    it('Should have upload method', () => {
        expect(component.upload).toBeDefined();
    });

    it('Should have constructTestPayload method', () => {
        expect(component.constructTestPayload).toBeDefined();
    });

    it('Should have constructRequest method', () => {
        expect(component.constructRequest).toBeDefined();
    });

    it('Should have testVnf method', () => {
        expect(component.testVnf).toBeDefined();
    });

    it('Should have pollTestStatus method', () => {
        expect(component.pollTestStatus).toBeDefined();
    });


    // Test getUrlEndPoint Method
    it('Should have getUrlEndPoint method', () => {
        expect(component.getUrlEndPoint).toBeDefined();
    });

    it('getUrlEndPoint Should return value', () => {
        expect(component.getUrlEndPoint('configmodify')).toEqual('config-modify');
        expect(component.getUrlEndPoint('configbackup')).toEqual('config-backup');
        expect(component.getUrlEndPoint('configrestore')).toEqual('config-restore');
        expect(component.getUrlEndPoint('healthcheck')).toEqual('health-check');
        expect(component.getUrlEndPoint('quiescetraffic')).toEqual('quiesce-traffic');
        expect(component.getUrlEndPoint('resumetraffic')).toEqual('resume-traffic');
        expect(component.getUrlEndPoint('startapplication')).toEqual('start-application');
        expect(component.getUrlEndPoint('stopapplication')).toEqual('stop-application');
        expect(component.getUrlEndPoint('upgradebackout')).toEqual('upgrade-backout');
        expect(component.getUrlEndPoint('upgradepostcheck')).toEqual('upgrade-post-check');
        expect(component.getUrlEndPoint('upgradeprecheck')).toEqual('upgrade-pre-check');
        expect(component.getUrlEndPoint('upgradesoftware')).toEqual('upgrade-software');
        expect(component.getUrlEndPoint('DeFaultCASE')).toEqual('defaultcase');
    });
})
