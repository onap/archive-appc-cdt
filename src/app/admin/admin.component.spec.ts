/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2019 IBM Intellectual Property. All rights reserved.
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Http, HttpModule, ConnectionBackend, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgProgressModule} from 'ngx-progressbar';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpUtilService } from '../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../shared/services/mapping-editor.service';
import { ParamShareService } from '../shared/services/paramShare.service';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { APIService } from "../shared/services/cdt.apicall";
import { UtilityService } from '../shared/services/utilityService/utility.service';
import { NotificationsService } from 'angular2-notifications';
import { TidyTableModule } from '../shared/modules/tidy-table/tidy-table.module';


import { AdminComponent } from './admin.component';

fdescribe('AdminComponent', () => {
    let component: AdminComponent;
    let fixture: ComponentFixture<AdminComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
                NO_ERRORS_SCHEMA
            ],
            declarations: [AdminComponent],
            imports: [HttpModule, NgbModule.forRoot(), TidyTableModule, NgProgressModule, RouterTestingModule],
            providers: [NgbModule, HttpUtilService, UtilityService, MappingEditorService, APIService, NotificationsService, ParamShareService, {
                provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                    return new Http(backend, defaultOptions);
                }, deps: [MockBackend, BaseRequestOptions]
            },
                { provide: MockBackend, useClass: MockBackend },
                { provide: BaseRequestOptions, useClass: BaseRequestOptions }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
