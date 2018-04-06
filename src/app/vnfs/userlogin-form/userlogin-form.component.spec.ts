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


============LICENSE_END============================================
*/

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { userloginFormComponent } from './userlogin-form.component';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './../../shared/services/notification.service';
import { ParamShareService } from './../../shared/services/paramShare.service';
import { MappingEditorService } from './../../shared/services/mapping-editor.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpUtilService } from '.././../shared/services/httpUtil/http-util.service';
import { UtilityService } from '.././../shared/services/utilityService/utility.service';
import { Router } from '@angular/router';
import {NotificationsService} from 'angular2-notifications';

describe('userloginFormComponent', () => {
    let component: userloginFormComponent;
    let fixture: ComponentFixture<userloginFormComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [userloginFormComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [FormsModule, RouterTestingModule,],
            providers: [UtilityService, ParamShareService, DialogService, NotificationService,NotificationsService, HttpUtilService, MappingEditorService, {
                provide: Router,
                useClass: MockRouter
            }, { provide: Router, useClass: MockRouter }]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(userloginFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // localStorage['userId'] = "testUser"
        component.userId = 'test Usr';
    });

    class MockRouter {
        navigateByUrl(url: string) {
            return url;
        }

        navigate(url: string) {
            return url;
        }
    }
    class MockUtility {
        randomId() {
            return 123;
        }
    }
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('get the user Id', () => {
        component.getData();
        expect(localStorage.userId).toEqual('test Usr');
    });

    it('should route to myvnfform', inject([Router], (router: Router) => {
        const spy = spyOn(router, 'navigate');
        component.getData();
        const url = spy.calls.first().args[0];


        expect(url.length).toBe(2);
        expect(url[0]).toEqual('vnfs');

        expect(url[1]).toEqual('list');
    }));

});
