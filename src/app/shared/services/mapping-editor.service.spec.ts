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

import { inject, TestBed, ComponentFixture } from '@angular/core/testing';
import { MappingEditorService } from './mapping-editor.service';

fdescribe('MappingEditorService', () => {
    let service;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MappingEditorService]
        });
    });

    beforeEach(() => {
        service = new MappingEditorService();
        service.editor = {};
    })

    it('should be created', inject([MappingEditorService], (service: MappingEditorService) => {
        expect(service).toBeTruthy();
    }));

    it('should test setSelectedWord function', () => {
        service.setSelectedWord('word');
        expect(service.selectedWord).toBe('word');
    });

    it('should test getSelectedWord function', () => {
        service.setSelectedWord('word');
        expect(service.getSelectedWord()).toBe('word');
    });

    it('should test changeNav function', () => {
        service.changeNav(null);
        expect(service._navItem).toBe(null);
        expect(service.referenceNameObjects).toBe(null);
    });

    it('should test changeNavAppData function', () => {
        service.changeNavAppData(null);
        expect(service._navItem).toBe(null);
        expect(service.appDataObject).toBe(null);
    });

    it('should test changeNavDownloadData function', () => {
        service.changeNavDownloadData(null);
        expect(service._navItem).toBe(null);
        expect(service.downloadDataObject).toBe(null);
    });

    it('should test saveLatestAction function', () => {
        service.saveLatestAction(null);
        expect(service.latestAction).toBe(null);
    });

    it('should test saveLatestIdentifier function', () => {
        service.saveLatestIdentifier(null);
        expect(service.identifier).toBe(null);
    });

    it('should test getParamContent function', () => {
        let paramContetnt = service.getParamContent('{}');
        expect(paramContetnt).toBe('{}');
    });

    it('should test saveTempAllData function', () => {
        service.saveTempAllData(null);
        expect(service.tempAllData).toBe(null);
    });

    it('should test navItem function', () => {
        service.changeNavAppData(null);
        let navItem = service.navItem();
        expect(service._navItem).toBe(null);
    });

    it('should test checkToDataAdd function to return true', () => {
        let toAdd = service.checkToDataAdd('><');
        expect(toAdd).toBe(true);
    });

    it('should test setParamContent function', () => {
        service.setParamContent('');
        expect(service.paramContent).toBe('');
    });

    it('should test checkToDataAdd function to return false', () => {
        let toAdd = service.checkToDataAdd('.');
        expect(toAdd).toBe(false);
    });
});
