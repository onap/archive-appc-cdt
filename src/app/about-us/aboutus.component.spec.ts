/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Modification Copyright (C) 2018 IBM.
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

import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { Http, HttpModule, ConnectionBackend, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { ModalDismissReasons, NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';
import { SimpleNotificationsModule, NotificationsService } from 'angular2-notifications';
import { DialogService } from 'ng2-bootstrap-modal';
import {UtilityService} from '../shared/services/utilityService/utility.service';


import { AboutUsComponent } from './aboutus.component';

class MockService {
    doStuff() {
        return this;
    }
    get() {
        return Observable.of(new Response(
            new ResponseOptions({
                body: "some data"
              }
            )));
    }
}

describe('ContacUsComponent', () => {
    let component: AboutUsComponent;
    let fixture: ComponentFixture<AboutUsComponent>;

    beforeEach(async(() => {
        let http = new MockService();

        TestBed.configureTestingModule({
            declarations: [AboutUsComponent],
            imports: [HttpModule, NgbModule.forRoot(), SimpleNotificationsModule.forRoot()],
            providers: [NgbModule, DialogService, UtilityService, {
                provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
                    return new Http(backend, defaultOptions);
                }, deps: [MockBackend, BaseRequestOptions]
            },
                { provide: MockBackend, useClass: MockBackend },
                { provide: BaseRequestOptions, useClass: BaseRequestOptions },
                { provide: Http, useValue: http }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutUsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open modal', inject([NgbModule, Http], (ngbModule: NgbModule, http: Http) => {
        let content = 'test';
        // component.open(content);
        component.versionLogFile().subscribe((data) => {
            expect(data.text()).toBe('some data');
        });
    }));

    it('should download log file', () => {
        var blob = new Blob(['test'], {
            type: 'text/plain;charset=utf-8'
        });
        component.downloadLogFile();
    });

    it('should test tlPlus function', inject([UtilityService], (utilService: UtilityService) => {
        let spy1 = spyOn(UtilityService.prototype, 'getTracelvl');
        component.tlPlus();
        expect(spy1).toHaveBeenCalled();
    }));

    it('should test tlMinus function', inject([UtilityService], (utilService: UtilityService) => {
        let spy1 = spyOn(UtilityService.prototype, 'getTracelvl');
        component.tlMinus();
        expect(spy1).toHaveBeenCalled();
    }));

    it('should test tlPlus function to call setTracelvl ', inject([UtilityService], (utilService: UtilityService) => {
        let spy1 = spyOn(UtilityService.prototype, 'setTracelvl');
        component.tlPlus();
        expect(spy1).toHaveBeenCalled();
    }));

    it('should test tlMinus function to call setTracelvl', inject([UtilityService], (utilService: UtilityService) => {
        let spy1 = spyOn(UtilityService.prototype, 'setTracelvl');
        let trv = 4;
        localStorage["Tracelvl"] = trv;
        component.tlMinus();
        expect(spy1).toHaveBeenCalled();
    }));
});
