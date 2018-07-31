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

/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NotificationService} from '../../shared/services/notification.service';
import {ParamShareService} from '../../shared/services/paramShare.service';
import {MappingEditorService} from '../../shared/services/mapping-editor.service';
import {ModalComponent} from '../../shared/modal/modal.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {ConfirmComponent} from '../../shared/confirmModal/confirm.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpUtilService} from '../../shared/services/httpUtil/http-util.service';
import {UtilityService} from '../../shared/services/utilityService/utility.service';

import {NotificationsService} from 'angular2-notifications';
import {HomeComponent} from '../../home/home/home.component';
import {LogoutComponent} from '../../shared/components/logout/logout.component';
import {HelpComponent} from '../../shared/components/help/help/help.component';
import {AboutUsComponent} from '../../about-us/aboutus.component';
import {TestComponent} from '../../test/test.component';
import {HttpModule} from '@angular/http';
import { NgProgress } from 'ngx-progressbar';

import {BuildDesignComponent} from './build-artifacts.component';

describe('BuildDesignComponent', () => {
    let component: BuildDesignComponent;
    let fixture: ComponentFixture<BuildDesignComponent>;
 const routes = [
        {
            path: 'home',
            component: HomeComponent
        }, {
            path: 'vnfs',
            loadChildren: './vnfs/vnfs.module#VnfsModule'
        }, {
            path: 'test',
            component: TestComponent
        },
        {
            path: 'help',
            component: HelpComponent
        }, {
            path: 'aboutUs',
            component: AboutUsComponent
        }, {
            path: 'logout',
            component: LogoutComponent
        }, {
            path: '',
            redirectTo: '/home',
            pathMatch: 'full'
        }
    ];
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BuildDesignComponent, HomeComponent, TestComponent, HelpComponent, AboutUsComponent, LogoutComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpModule, FormsModule, RouterTestingModule.withRoutes(routes)],
            providers : [ NotificationsService ]
            
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BuildDesignComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should validate getRefData method', () => {
        let refData = {"action":"Configure",
        "action-level":"vnf",
        "scope": {
            "vnf-type":"ticktack",
            "vnfc-type":""
                },
         "template":"Y",
         "vm":[],
         "device-protocol":"CHEF",
         "user-name":"",
         "port-number":"",
         "artifact-list":[
             {"artifact-name":"template_Configure_ticktack_0.0.1V.json","artifact-type":"config_template"},
             {"artifact-name":"pd_Configure_ticktack_0.0.1V.yaml","artifact-type":"parameter_definitions"}],
        "scopeType":"vnf-type"
        };
        
        component.refDataRequiredFiels = false;
        component.getRefData(refData);
        expect(component.refDataRequiredFiels).toBeTruthy();
    });

// Test checkRefDataReqFields Method
    it('Should notify error message if action is not valid', () => {
        let spy = spyOn(NotificationsService.prototype, 'error');
        component.refList = {"action": "", "scope": {"vnf-type": "test 1"}, "device-protocol": "ANSIBLE"};

        component.checkRefDataReqFields();

        expect(spy).toHaveBeenCalled();
    });

    it('Should notify error message if VNF Type is not valid', () => {
        let spy = spyOn(NotificationsService.prototype, 'error');
        component.refList = {"action": "Configure", "scope": {"vnf-type": ""}, "device-protocol": "ANSIBLE"};

        component.checkRefDataReqFields();

        expect(spy).toHaveBeenCalled();
    });

    it('Should notify error message if Device Protocol is not valid', () => {
        let spy = spyOn(NotificationsService.prototype, 'error');
        component.refList = {"action": "Configure", "scope": {"vnf-type": "test 1"}, "device-protocol": ""};

        component.checkRefDataReqFields();

        expect(spy).toHaveBeenCalled();
    });

    it('Should test updateAccessUpdatePages method to call setAllowOtherUpdates with true', ()=> {
        spyOn(component, 'setAllowOtherUpdates');        
        component.updateAccessUpdatePages('config', [{'action' : 'configModify'}, {'action' : 'config'}]);
        expect(component.setAllowOtherUpdates).toHaveBeenCalledWith(true);
    });

    it('Should test updateAccessUpdatePages method to call setAllowOtherUpdates with fasle', ()=> {
        spyOn(component, 'setAllowOtherUpdates');        
        component.updateAccessUpdatePages('config', [{'action' : 'configModify'}]);
        expect(component.setAllowOtherUpdates).toHaveBeenCalledWith(false);
    });
});
