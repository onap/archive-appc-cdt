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

import { async, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';

describe('ModalComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalComponent
            ],
            schemas: [NO_ERRORS_SCHEMA]
        });
        TestBed.compileComponents();
    });

    it('should create the component', async(() => {
        const fixture = TestBed.createComponent(ModalComponent);
        const comp = fixture.debugElement.componentInstance;
        expect(comp).toBeTruthy();
    }));

    it('should test isClose function', async(() => {
        const fixture = TestBed.createComponent(ModalComponent);
        const comp = fixture.debugElement.componentInstance;
        comp.isClose();
        expect(comp.isShow).toBe(false);
    }));
});
