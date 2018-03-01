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
import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NotificationService} from '../../../shared/services/notification.service';
import {ParamShareService} from '../../../shared/services/paramShare.service';
import {MappingEditorService} from '../../../shared/services/mapping-editor.service';
import {ModalComponent} from '../../../shared/modal/modal.component';
import {DialogService} from 'ng2-bootstrap-modal';
import {ConfirmComponent} from '../../../shared/confirmModal/confirm.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpUtilService} from '../../../shared/services/httpUtil/http-util.service';
import {UtilityService} from '../../../shared/services/utilityService/utility.service';

import {BuildDesignComponent} from '../build-artifacts.component';
import {NotificationsService} from 'angular2-notifications';
import {HomeComponent} from '../../../home/home/home.component';
import {LogoutComponent} from '../../../shared/components/logout/logout.component';
import {HelpComponent} from '../../../shared/components/help/help/help.component';
import {AboutUsComponent} from '../../../about-us/aboutus.component';
import {TestComponent} from '../../../test/test.component';
import {ParameterComponent} from './parameter.component';
import {HttpModule} from '@angular/http';
import { NgProgress } from 'ngx-progressbar';



describe('ParameterComponent', () => {
    let component: ParameterComponent;
    let fixture: ComponentFixture<ParameterComponent>;
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
            declarations: [ParameterComponent, HomeComponent, TestComponent, HelpComponent, AboutUsComponent, LogoutComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [HttpModule, FormsModule, RouterTestingModule.withRoutes(routes)],
            providers: [UtilityService, NgProgress, BuildDesignComponent, ParamShareService, DialogService, NotificationService, HttpUtilService, MappingEditorService, NotificationsService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ParameterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


     it('should retrieve PD from APPC...', () => {
    expect(component.getPD());
  });

  it('should infer some information from reference object...', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    mappingEditorService.latestAction = {"action":"Configure","action-level":"vnf","scope":{"vnf-type":"ticktack","vnfc-type":""},"template":"Y","vm":[],"device-protocol":"CHEF","user-name":"","port-number":"","artifact-list":[{"artifact-name":"template_Configure_ticktack_0.0.1V.json","artifact-type":"config_template"},{"artifact-name":"pd_Configure_ticktack_0.0.1V.yaml","artifact-type":"parameter_definitions"}],"scopeType":"vnf-type"};
    expect(component.ngOnInit());
    expect(component.vnfType).toEqual('ticktack');
    expect(component.vnfcType).toEqual('');
    expect(component.protocol).toEqual('CHEF');
    expect(component.action).toEqual('Configure');
    expect(component.artifact_fileName).toEqual('pd_Configure_ticktack_0.0.1V.yaml');
  }));


  it('should retrieve the PD from cache...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    mappingEditorService.latestAction = {"action":"Configure","action-level":"vnf","scope":{"vnf-type":"ticktack","vnfc-type":""},"template":"Y","vm":[],"device-protocol":"CHEF","user-name":"","port-number":"","artifact-list":[{"artifact-name":"template_Configure_ticktack_0.0.1V.json","artifact-type":"config_template"},{"artifact-name":"pd_Configure_ticktack_0.0.1V.yaml","artifact-type":"parameter_definitions"}],"scopeType":"vnf-type"};
    paramShareService.setSessionParamData("TEST PD INFORMATION")
    expect(component.ngAfterViewInit()).toEqual("TEST PD INFORMATION");
  }));

/*
   it('should read file key file content...', () => {
    let input = {"__zone_symbol__changefalse":[{"type":"eventTask","state":"running","source":"HTMLInputElement.addEventListener:change","zone":"angular","runCount":2}]};
    expect(component.fileChange(input, 'keyfile'));
  });

let content = new Blob(["PARAMVALUE|SOURCE|RULETYPE|KEY1|VALUE1|KEY2|VALUE2|KEY3|VALUE3\nvalue1|INSTAR|interface_ip_address|UniqueKeyName1|addressfqdn123|UniqueKeyValue|m001ssc001p1n001v001|FieldKeyName|ipaddress_v4\nvalue2|INSTAR|interface_ip_address|UniqueKeyName2|addressfqdnAsgar1|UniqueKeyValue|m001ssc001p1n001v002|FieldKeyName|ipaddress_v4"]
{includes:()});
let file = new File(content, "test.txt");
  it('should read file PD file content...', () => {
   let input = {"__zone_symbol__changefalse":[{"type":"eventTask","state":"running","source":"HTMLInputElement.addEventListener:change","zone":"angular","runCount":2}]};
    
    expect(component.fileChange(input, 'pdfile'));
  });
  */

  it('should set the ruletypes for source A&AI...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = "A&AI";
    expect(component.sourceChanged(data, obj));
    expect(obj.ruleTypeValues).toEqual([null, 'vnf-name', 'vm-name-list', 'vnfc-name-list', 'vnf-oam-ipv4-address', 'vnfc-oam-ipv4-address-list']);
  }));

  it('should set the ruletypes for source Manual...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = "Manual";
    expect(component.sourceChanged(data, obj));
    expect(obj.ruleTypeValues).toEqual([null]);
    expect(obj['rule-type']).toBeNull();
  }));

  it('should set the ruletypes for source INSTAR...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = "INSTAR";
    expect(component.sourceChanged(data, obj));
    expect(obj.ruleTypeValues).toEqual([null]);
  }));

  it('should set the ruletypes for ruletype null...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = null
    expect(component.ruleTypeChanged(data, obj));
    expect(obj['showFilterFields']).toBeFalsy();
    expect(obj['rule-type']).toBeNull();
  }));

  it('should set the ruletypes for ruletype vm-name-list...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = 'vm-name-list';
    let sourceObject = component.ruleTypeConfiguaration[data];

    expect(component.ruleTypeChanged(data, obj));
    expect(obj['showFilterFields']).toBeTruthy();
    expect(obj['rule-type']).toBeNull();

    for (let x = 0; x < sourceObject.length; x++) {
        expect(obj['response-keys'][x]['key-name']).toEqual(sourceObject[x]['key-name']);
        expect(obj['response-keys'][x]['key-value']).toEqual(sourceObject[x]['key-value']);
    }
  }));


  it('should set the ruletypes for ruletype vnf-name...', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService:ParamShareService) => {
    let obj = {"name":"name1","type":"ipv4-address","description":"xxx","required":"true","default":null,"source":"A&AI","rule-type":null,"request-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"response-keys":[{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null},{"key-name":null,"key-value":null}],"ruleTypeValues":[null]}
    let data = "vnf-name";
    expect(component.ruleTypeChanged(data, obj));
    expect(obj['showFilterFields']).toBeFalsy();
    expect(obj['response-keys'][3]['key-name']).toBeNull;
    expect(obj['response-keys'][3]['key-value']).toBeNull;
    expect(obj['response-keys'][4]['key-name']).toBeNull;
    expect(obj['response-keys'][4]['key-value']).toBeNull;
  }));



});
