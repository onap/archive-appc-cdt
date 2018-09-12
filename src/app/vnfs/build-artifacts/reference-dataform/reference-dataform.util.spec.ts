/*
============LICENSE_START==========================================
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

import { inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReferenceDataFormUtil } from './reference-dataform.util';
import { NotificationsService } from 'angular2-notifications';
import { UtilityService } from '../../../shared/services/utilityService/utility.service';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';

describe('ReferenceDataFormUtil', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [ReferenceDataFormUtil, HttpUtilService, NotificationsService, UtilityService, BaseRequestOptions, MockBackend,
                {
                    provide: Http,
                    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions],
                }]
        });
    });

    it('should ...', inject([ReferenceDataFormUtil], (service: ReferenceDataFormUtil) => {
        expect(service).toBeTruthy();
    }));

    it('should test checkResult function when status is 401', inject([ReferenceDataFormUtil], (service: ReferenceDataFormUtil) => {
        let spy = spyOn(NotificationsService.prototype, 'info');
        let result = {output: {status: { code: '401'}}};
        let returnValue = service.checkResult(result);
        expect(spy).toHaveBeenCalled();
        expect(returnValue).toBe(false);
    }));

    it('should test checkResult function when status is 400', inject([ReferenceDataFormUtil], (service: ReferenceDataFormUtil) => {
        let spy = spyOn(NotificationsService.prototype, 'success');
        let result = {output: {status: { code: '400'}}};
        let returnValue = service.checkResult(result);
        expect(spy).toHaveBeenCalled();
        expect(returnValue).toBe(true);
    }));


    it('should test nullCheckForVnfcType and nullCheckForVnfcTypeList function', inject([ReferenceDataFormUtil], (service: ReferenceDataFormUtil) => {
        let returnValueVnfcType = service.nullCheckForVnfcType(false);
        let returnValueVnfcTypeList = service.nullCheckForVnfcTypeList('null');
        expect(returnValueVnfcType).toBe(true);
        expect(returnValueVnfcTypeList).toBe(true);
    }));
});
