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

/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReferenceDataformComponent } from './reference-dataform.component';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { ParamShareService } from '../../..//shared/services/paramShare.service';
import { MappingEditorService } from '../../..//shared/services/mapping-editor.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { NgModule } from '@angular/core';
import { NgProgress } from 'ngx-progressbar';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { environment } from '../../../../environments/environment';
import { BuildDesignComponent } from '../build-artifacts.component';
import { Http, Response, ResponseOptions, XHRBackend } from '@angular/http';

describe('ReferenceDataformComponent', () => {
    let component: ReferenceDataformComponent;
    let fixture: ComponentFixture<ReferenceDataformComponent>;
    //mockingthe data for mappingEditorService
    class MockMappingService {
        referenceNameObjects = [
            {
                action: "Configure"
            },
            {
                action: "StartApplication"
            }
        ]
        getReferenceList(){
            return ["test data"]
        }
        changeNav(){
            return "test data"
        }
    }
    class MockreferenceDataObject {
    }
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReferenceDataformComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [FormsModule, RouterTestingModule, HttpModule, NgbModule.forRoot(), SharedModule.forRoot()],
            providers: [BuildDesignComponent, { provide: MappingEditorService, useClass: MockMappingService }, ParamShareService, DialogService, NotificationService, HttpUtilService]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ReferenceDataformComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create reference component', () => {
        expect(component).toBeTruthy();
    });
    it('Should load data from mapping sevice', () => {
        component.ngOnInit()
        expect(component.tempAllData.length).toBe(2)
    })
    it('testing init method', () => {
        component.ngOnInit()
        expect(component.tempAllData.length).toBe(2)
    })
    it('Should reset form', () => {
        component.resetForm()
        expect(component.referenceDataObject['device-protocol']).toBe('')
        expect(component.referenceDataObject['action-level']).toBe('vnf')
        expect(component.referenceDataObject.template).toBe('Y')
        expect(component.referenceDataObject['user-name']).toBe('')
        expect(component.Sample['vnfc-type']).toBe('')
        expect(component.refernceScopeObj.sourceType).toBe('')
        expect(component.referenceDataObject['port-number']).toBe('')
    })
    it("prepare reference method at vnf level", () => {
        component.prepareReferenceObject();
        component.referenceDataObject = {
            action: 'Configure',
            'action-level': 'vnf',
            scope: { 'vnf-type': '', 'vnfc-type': '' },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
    it("prepare reference method at vnfc level", () => {
        component.prepareReferenceObject();
        component.referenceDataObject = {
            action: 'startApplication',
            'action-level': 'vnfc',
            scope: { 'vnf-type': '', 'vnfc-type': '' },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        expect(component.referenceDataObject['action-level']).toBe("vnfc")
    })
    it("prepare reference method for configscaleout", () => {
        component.prepareReferenceObject();

        component.referenceDataObject = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: { 'vnf-type': '', 'vnfc-type': '' },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
});
