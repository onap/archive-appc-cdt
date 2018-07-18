/*
============LICENSE_START==========================================
===================================================================
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

============LICENSE_END============================================
*/

import { inject, TestBed } from '@angular/core/testing';
import { ParamShareService } from './paramShare.service';

fdescribe('ParamShareService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ParamShareService]
        });
    });

    it('should ...', inject([ParamShareService], (service: ParamShareService) => {
        expect(service).toBeTruthy();
    }));

    it('should set and return proper paramData value', inject([ParamShareService], (service: ParamShareService) => {
        service.setSessionParamData([
            { paramName: 'A-IP', paramValue: '234' },
            { paramName: 'B-IP', paramValue: '10.168.15.15' }]);
        let paramData = service.getSessionParamData();
        expect(paramData).toEqual([
            { paramName: 'A-IP', paramValue: '234' },
            { paramName: 'B-IP', paramValue: '10.168.15.15' }]);
    }));

    it('should set and return proper DisplayData value', inject([ParamShareService], (service: ParamShareService) => {
        service.setDisplayData([
            { name: 'A-IP', value: '234' },
            { name: 'B-IP', value: '10.168.15.15' }]);
        let displayData = service.getDisplayData();
        expect(displayData).toEqual([
            { name: 'A-IP', value: '234' },
            { name: 'B-IP', value: '10.168.15.15' }]);
    }));

    it('should set and return proper templateData value', inject([ParamShareService], (service: ParamShareService) => {
        service.setTemplateData([
            { tempName: 'A-IP', tempValue: '234' },
            { tempName: 'B-IP', tempValue: '10.168.15.15' }]);
        let tempData = service.getTemplateData();
        expect(tempData).toEqual([
            { tempName: 'A-IP', tempValue: '234' },
            { tempName: 'B-IP', tempValue: '10.168.15.15' }]);
    }));

    it('should set and return proper sharedData value', inject([ParamShareService], (service: ParamShareService) => {
        service.setData(
            { displayName: 'A-IP', displayValue: '234' });
        let sharedData = service.getData();
        expect(sharedData).toEqual(
            { displayName: 'A-IP', displayValue: '234' });
    }));

    it('should set templateData value', inject([ParamShareService], (service: ParamShareService) => {
        service.setTemplateData1();
    }));

});
