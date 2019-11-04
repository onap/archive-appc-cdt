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

import { async, TestBed } from '@angular/core/testing';
import { ConfirmComponent } from './confirm.component';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

describe('ConfirmComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConfirmComponent
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [DialogService]

        });
        TestBed.compileComponents();
    });

    it('should create the component', async(() => {
        const fixture = TestBed.createComponent(ConfirmComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it('should test confirm method with proper return value', async(() => {
        const fixture = TestBed.createComponent(ConfirmComponent);
        const comp = fixture.debugElement.componentInstance;
        comp.onConfirm();
        expect(comp.result).toBe(true);
    }));

    it('should test cancel method with proper return value', async(() => {
        const fixture = TestBed.createComponent(ConfirmComponent);
        const comp = fixture.debugElement.componentInstance;
        comp.onCancel();
        expect(comp.result).toBe(false);
    }));
});
