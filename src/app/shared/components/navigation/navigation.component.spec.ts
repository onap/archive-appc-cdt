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

import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
import {DialogService} from 'ng2-bootstrap-modal';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {HttpUtilService} from '../../../shared/services/httpUtil/http-util.service';
import {MappingEditorService} from '../../..//shared/services/mapping-editor.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {NgModule} from '@angular/core';
import {NgProgress} from 'ngx-progressbar';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NotificationService} from '../../../shared/services/notification.service';
import {ParamShareService} from '../../..//shared/services/paramShare.service';
import {SharedModule} from '../../../shared/shared.module';
import {environment} from '../../../../environments/environment';

import { NavigationComponent } from './navigation.component';
import { EmitterService } from '../../services/emitter.service';

describe('NavigationComponent', () => {
    let component: NavigationComponent;
    let fixture: ComponentFixture<NavigationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationComponent],
            imports: [RouterTestingModule.withRoutes([]),FormsModule, RouterTestingModule, HttpModule, NgbModule.forRoot()],
            providers: []
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set userLoggedIn on ngOnInit', () => {
        component.userId = 'testingId';

        component.ngOnInit();
    });

    it('should validate on ngOnChanges', () => {
        let spy = spyOn(EmitterService, 'get').and.callFake( ({}) => {
            return Observable.empty();
        });
        component.id = 'userLogin';

        component.ngOnChanges();

        expect(spy).toHaveBeenCalled();
    });

    it('should go to /vnfs/list if url = vnfs and userId is not null or undefined', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');
        localStorage['userId'] = 'testingId';
        let testUrl = 'vnfs';

        component.gotoDetail(testUrl);
    }));

    it('should go to /vnfs if url = vnfs and userId is null or undefined', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');
        localStorage['userId'] = '';
        let testUrl = 'vnfs';

        component.gotoDetail(testUrl);
    }));

    it('should go to passed url if url != vnfs', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');
        let testUrl = 'test';

        component.gotoDetail(testUrl);
    }));

    it('should logout', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');

        component.logout();
    }));
    it('should ngOnChanges', () => {
        component.id="uday"
        component.ngOnChanges()
        expect(component.userLoggedIn).toBeFalsy();
    });
    it('should ngOnInit()', () => {
        localStorage['userId']="uday"
        component.ngOnInit()
        expect(component.userLoggedIn).toBeTruthy();
    });
    it('should gotoDetail(url)', () => {
        component.gotoDetail('vnfs')
    });
    it('should logout()', () => {
        component.logout()
        expect(component.userLoggedIn).toBeFalsy();
    });
});
