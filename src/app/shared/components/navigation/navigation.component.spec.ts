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

import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { BaseRequestOptions, Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/of';

import { NavigationComponent } from './navigation.component';
import { EmitterService } from '../../services/emitter.service';

describe('NavigationComponent', () => {
    let component: NavigationComponent;
    let fixture: ComponentFixture<NavigationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationComponent],
            imports: [RouterTestingModule.withRoutes([])],
            providers: [EmitterService, MockBackend, BaseRequestOptions, {
                    provide: Http,
                    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions],
                }]
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

    describe('Should test ngOnChanges', () => {
        it('should validate on ngOnChanges subscribe return', () => {
            let spy = spyOn(EmitterService, 'get').and.returnValue(Observable.of('you object'));
            component.id = 'userLogin';

            component.ngOnChanges();

            expect(spy).toHaveBeenCalled();
        });

        it('should validate on ngOnChanges if subscribe return null or undefined', inject([Router],(router: Router) => {
            let spy = spyOn(EmitterService, 'get').and.returnValue(Observable.of(''));
            let spy1 = spyOn(component, 'logout');
            component.id = 'userLogin';
            component.ngOnChanges();

            expect(spy).toHaveBeenCalled();
            
            expect(spy1).toHaveBeenCalled()
        }));
    });

    it('should go to /vnfs/list if url = vnfs and userId is not null or undefined', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');
        sessionStorage['userId'] = 'testingId';
        let testUrl = 'vnfs';

        component.gotoDetail(testUrl);
    }));

    it('should go to /vnfs if url = vnfs and userId is null or undefined', inject([Router],(router: Router) => {
        let navigateSpy = spyOn(router, 'navigate');
        sessionStorage['userId'] = '';
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
});
