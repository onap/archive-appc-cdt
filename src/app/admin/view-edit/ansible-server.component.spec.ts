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
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';

import { AnsibleServerComponent } from './ansible-server.component';
import { ParamShareService } from '../../shared/services/paramShare.service';
import { UtilityService } from '../../shared/services/utilityService/utility.service';

fdescribe('AnsibleServerComponent', () => {
    let component: AnsibleServerComponent;
    let fixture: ComponentFixture<AnsibleServerComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
                NO_ERRORS_SCHEMA
            ],
            declarations: [AnsibleServerComponent],
            imports: [HttpModule, FormsModule, RouterTestingModule, NgbModule.forRoot()],
            providers: [NgbModule, UtilityService, ParamShareService, NotificationsService, {
                provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                    return new Http(backend, defaultOptions);
                }, deps: [MockBackend, BaseRequestOptions]
            },
                { provide: MockBackend, useClass: MockBackend },
                { provide: BaseRequestOptions, useClass: BaseRequestOptions }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AnsibleServerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.item = {};
        sessionStorage.setItem("ansibleserver", "{\"server\":\"\",\"info\":[{\"ownerid\":\"\",\"regionid\":\"\",\"tenantid\":\"\"}]}");
        expect(component).toBeTruthy();
    });
});
