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


import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { By, BrowserModule } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpUtilService } from '../../../../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../../../../shared/services/mapping-editor.service';
import { ArtifactRequest } from '../../../../shared/models/index';
import { ActivatedRoute, Router } from "@angular/router";
import { saveAs } from "file-saver";
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationsService } from "angular2-notifications"
import { ParamShareService } from '../../../../shared/services/paramShare.service';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../../../../shared/confirmModal/confirm.component';
import { BuildDesignComponent } from '../../build-artifacts.component';
import { environment } from '../../../../../environments/environment';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal'
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from '../../../../home/home/home.component';
import { LogoutComponent } from '../../../../shared/components/logout/logout.component';
import { HelpComponent } from '../../../../shared/components/help/help/help.component';
import { AboutUsComponent } from '../../../../about-us/aboutus.component';
import { TestComponent } from '../../../../test/test.component';
import { HttpModule } from '@angular/http';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { GoldenConfigurationComponent } from './template-configuration.component';
import { NgProgress } from 'ngx-progressbar';
import { BaseRequestOptions, Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

describe('GoldenConfigurationComponent', () => {
  let component: GoldenConfigurationComponent;
  let fixture: ComponentFixture<GoldenConfigurationComponent>;
  let buildDesignComponent: BuildDesignComponent;
  let paramShareService: ParamShareService;
  let dialogService: DialogService;
  let notificationService: NotificationService;
  let httpUtil: HttpUtilService;
  let mappingEditorService: MappingEditorService;
  let activeRoutes: ActivatedRoute;
  let router: Router;
  let nService: NotificationsService
  const routes = [
    {
      path: 'home',
      component: HomeComponent
    }, {
      path: 'vnfs',
      loadChildren: '../../../../vnfs/vnfs.module#VnfsModule'
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, BrowserModule, RouterTestingModule.withRoutes(routes), HttpModule, Ng2Bs3ModalModule, SimpleNotificationsModule.forRoot()],
      declarations: [GoldenConfigurationComponent, HomeComponent, TestComponent, HelpComponent, AboutUsComponent, LogoutComponent, AceEditorComponent],
      providers: [BuildDesignComponent, NgProgress, ParamShareService, DialogService, NotificationService, MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions],
        },

        HttpUtilService, MappingEditorService, NotificationsService],
      schemas: [NO_ERRORS_SCHEMA],
    })

  });

  beforeEach(async(() => {
    TestBed.compileComponents()

  }));


  it('validate if uploaded file should be xml or json', () => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    expect(component.validateUploadedFile('xls')).toBe(false);
    expect(component.validateUploadedFile('json')).toBe(true);
    expect(component.validateUploadedFile('xml')).toBe(true);
  });


  it('validate initialisation of variables in ngOnit() function', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" }

    expect(component.ngOnInit());
    expect(component.ngAfterViewInit());
    expect(component.action).toEqual('Configure');
    expect(component.vnfType).toEqual('testVnf');
    expect(component.vnfcType).toEqual('');
    expect(component.protocol).toEqual('CHEF');

    expect(component.artifactName).toEqual('template_Configure_test_0.0.1V.json');

    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "testVnfc" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" }
    expect(component.ngOnInit());
    expect(component.vnfcType).toEqual('testVnfc');


  }));

  it('check if variables are empty when reference data object is empty', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    // mappingEditorService.latestAction = { "action": "", "scope": { "vnf-type": "", "vnfc-type": "" }, "vm": [], "protocol": "", "download-dg-reference": "", "user-name": "", "port-number": "", "artifact-list": [], "deviceTemplate": "", "scopeType": "" };
    mappingEditorService.latestAction = undefined;
    expect(component.ngAfterViewInit());
    expect(component.action).toEqual('');
    expect(component.vnfType).toEqual('');
    expect(component.vnfcType).toEqual('');
    expect(component.protocol).toEqual('');
    expect(component.artifactName).toEqual('');

  }));

  it('check if correct notification is fired while initialising if reference data object is undefined', () => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    expect(component.ngAfterViewInit());
    expect(component.Actions.length).toBe(0)
    expect(component.enableBrowse).toBe(false)
  });

  it('test sync template when template data, param data and pd data are available', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService: ParamShareService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.fromScreen === 'MappingScreen'
    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>"
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);

    var pdData = [{ "name": "sync_auto-pop_name1", "type": null, "description": null, "required": null, "default": null, "source": "A&AI", "rule-type": "vnfc-oam-ipv4-address-list", "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{ "key-name": "unique-key-name", "key-value": "parent-name" }, { "key-name": "unique-key-value", "key-value": "vnfc" }, { "key-name": "field-key-name", "key-value": "ipaddress-v4-oam-vip" }, { "key-name": null, "key-value": "vm-number" }, { "key-name": null, "key-value": "test" }], "ruleTypeValues": [null, "vnf-name", "vm-name-list", "vnfc-name-list", "vnf-oam-ipv4-address", "vnfc-oam-ipv4-address-list"], "showFilterFields": true, "enableFilterByValue": true }, { "name": "sync_auto-pop_address1", "type": null, "description": null, "required": null, "default": null, "source": "A&AI", "rule-type": "vm-name-list", "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{ "key-name": "unique-key-name", "key-value": "parent-name" }, { "key-name": "unique-key-value", "key-value": "vserver" }, { "key-name": "field-key-name", "key-value": "vserver-name" }, { "key-name": null, "key-value": "vnfc-function-code" }, { "key-name": null, "key-value": null }], "ruleTypeValues": [null, "vnf-name", "vm-name-list", "vnfc-name-list", "vnf-oam-ipv4-address", "vnfc-oam-ipv4-address-list"], "showFilterFields": true, "enableFilterByValue": true }, { "name": "node0_tacplus_server_name2", "type": null, "description": null, "required": null, "default": null, "source": "Manual", "rule-type": null, "request-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "response-keys": [{ "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }, { "key-name": null, "key-value": null }], "ruleTypeValues": [null] }];
    paramShareService.setSessionParamData([pdData]);
    localStorage["paramsContent"] = {
      "sync_auto-pop_name1": "testIp1",
      "sync_auto-pop_address1": "",
      "node0_tacplus_server_name2": "testIp2"
    };
    expect(component.syncTemplate());


  }));

  it('test sync template when template data, param data and pd data are not available', inject([MappingEditorService, ParamShareService], (mappingEditorService: MappingEditorService, paramShareService: ParamShareService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.fromScreen === 'MappingScreen'
    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>"
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);

    var pdData = [];
    paramShareService.setSessionParamData([pdData]);
    localStorage["paramsContent"] = {};
    expect(component.syncTemplate());


  }));

  it('test whether proper param data and template data are getting set in the appDataObject', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();
    component.appDataObject = { reference: {}, template: { templateData: {}, nameValueData: {} }, pd: {} };
    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>"
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
    localStorage["paramsContent"] = JSON.stringify({ "sync_auto-pop_name1": "testIp1", "sync_auto-pop_address1": "", "node0_tacplus_server_name2": "testIp2" });

    component.userId = "testuser";
    component.apiToken = "87264736473";
    component.prepareAppData();
    var paramData = { "input": ({ "design-request": ({ "request-id": '87264736473', "action": 'uploadArtifact', "payload": '{"userID":"testuser","vnf-type":"testVnf","action":"Configure","artifact-name":"param_Configure_testVnf_0.0.1V.json","artifact-type":"APPC-CONFIG","artifact-version":"0.0.1","artifact-contents":"[{\"sync_auto-pop_name1\":\"10.0.1.34\",\"sync_auto-pop_address1\":\"\",\"node0_tacplus_server_name2\":\"192.34.45.5\"}]"}' }) }) };
    var templateData = { input: ({ "design-request": ({ "request-id": '87264736473', "action": 'uploadArtifact', "payload": '{"userID":"testuser","vnf-type":"testVnf","action":"Configure","artifact-name":"template_Configure_test_0.0.1V.json","artifact-type":"APPC-CONFIG","artifact-version":"0.0.1","artifact-contents":"<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n<version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n              </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n          <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n   </groups>\n    </configuration>"}' }) }) };
    expect(component.appDataObject.template.nameValueData["payload"]).toBe(JSON.stringify(paramData["payload"]));
    expect(component.appDataObject.template.templateData["payload"]).toBe(JSON.stringify(templateData["payload"]));
  }));


  it('test whether proper param data is getting set in the downloadDataObject', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();
    component.downloadDataObject = {
      reference: {},
      template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
      pd: { pdData: '', pdFileName: '' }
    };
    localStorage["paramsContent"] = JSON.stringify({ "sync_auto-pop_name1": "testIp1", "sync_auto-pop_address1": "", "node0_tacplus_server_name2": "testIp2" });

    component.onDownloadParameter();
    var nameValueData = {
      "sync_auto-pop_name1": "testIp1",
      "sync_auto-pop_address1": "",
      "node0_tacplus_server_name2": "testIp2"
    };
    expect(component.downloadDataObject.template.nameValueData).toBe(JSON.stringify(nameValueData, null, "\t"));
    expect(component.downloadDataObject.template.nameValueFileName).toBe("param_Configure_testVnf_0.0.1V.json");
  }));

  it('test whether proper template data is getting set in the downloadDataObject', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();
    component.downloadDataObject = {
      reference: {},
      template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
      pd: { pdData: '', pdFileName: '' }
    };
    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>"
    component.fileType = "text/xml"
    component.onDownloadTemplate('Template');

    component.fileType = "text/plain"
    component.onDownloadTemplate('Template');
    component.fileType = "text/json"
    component.onDownloadTemplate('Template');
    component.tempretrieveFlag = true;
    component.fileNameForTempSave = "Configure_testVnf_0.0.1V.json"
    component.onDownloadTemplate('Template');
    expect(component.downloadDataObject.template.templateData).toBe(component.configMappingEditorContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}'));
   }));


  it('test merge status for golden config template and uploaded parameter data', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();
    component.downloadDataObject = {
      reference: {},
      template: { templateData: {}, nameValueData: {}, templateFileName: '', nameValueFileName: '' },
      pd: { pdData: '', pdFileName: '' }
    };
    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \r\n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\r\n            <version>15.1X49-D50.3</version>\r\n            <groups>\r\n                <name>node0</name>\r\n                <system>\r\n                   <tacplus-server>\r\n                        <name>testIp1</name>\r\n                        <source-address>135.144.3.125</source-address>\r\n                    </tacplus-server>\r\n                    <tacplus-server>\r\n                        <name>199.37.184.242</name>\r\n                        <source-address>testIp2</source-address>\r\n                    </tacplus-server>\r\n                </system>         \r\n            </groups>\r\n     </configuration>";
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
    localStorage["paramsContent"] = JSON.stringify({
      "node0_tacplus_server_name1": "testIp1",
      "node0_tacplus_server_source_address1": "675453432",
      "node0_tacplus_server_name2": "testIp2"
    });
    component.mergeParams();
    expect(component.mergeStatus).toBe(true);

    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>"
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
    component.mergeParams();
    expect(component.mergeStatus).toBe(false);

  }));

  it('test handleAnnotation method', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();

    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \r\n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\r\n            <version>15.1X49-D50.3</version>\r\n            <groups>\r\n                <name>node0</name>\r\n                <system>\r\n                   <tacplus-server>\r\n                        <name>199.37.184.211</name>\r\n                        <source-address>675453432</source-address>\r\n                    </tacplus-server>\r\n                    <tacplus-server>\r\n                        <name>199.37.184.242</name>\r\n                        <source-address>675453432</source-address>\r\n                    </tacplus-server>\r\n                </system>         \r\n            </groups>\r\n     </configuration>";
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
    component.selectedWord = "node0";
    expect(component.handleAnnotation(component.modal));
  }));

  it('test handleAnnotation method', inject([MappingEditorService], (mappingEditorService: MappingEditorService) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" };
    component.ngOnInit();
    component.ngAfterViewInit();

    component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \r\n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\r\n            <version>15.1X49-D50.3</version>\r\n            <groups>\r\n                <name>node0</name>\r\n                <system>\r\n                   <tacplus-server>\r\n                        <name>{(node1)=(name1)}</name>\r\n                        <source-address>675453432</source-address>\r\n                    </tacplus-server>\r\n                    <tacplus-server>\r\n                        <name>199.37.184.242</name>\r\n                        <source-address>675453432</source-address>\r\n                    </tacplus-server>\r\n                </system>         \r\n            </groups>\r\n     </configuration>";
    mappingEditorService.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
    component.selectedWord = "node0";
    component.tempName = "name0";
    component.submitNameValues()
    expect(component.replaceWord).toContain("{(node0)=(name0)}");
    component.selectedWord = "{(node1)=(name1)}";
    component.submitNameValues();
    component.tempName = false;
    component.submitNameValues();
  }));

  it('retrieveTemplateFromAppc function should return response on success and set the configMappingEditorContent object', inject([HttpUtilService, NgProgress, MappingEditorService, MockBackend], (httpUtilService: HttpUtilService, mappingEditorService: MappingEditorService, ngProgress: NgProgress, mockBackend: MockBackend) => {
    fixture = TestBed.createComponent(GoldenConfigurationComponent);
    component = fixture.componentInstance;
    var mockData = {
      "output": {
        "data": {
          "block": "{\"userID\":null,\"designInfo\":null,\"statusInfo\":null,\"artifactInfo\":[{\"artifact-content\":\"   <configuration xmlns=\\\"http://xml.juniper.net/xnm/1.1/xnm\\\" \\n    xmlns:a=\\\"http://xml.juniper.net/junos/15.1X49/junos\\\" >\\n            <version>15.1X49-D50.3</version>\\n            <groups>\\n                <name>node0</name>\\n                <system>\\n                   <tacplus-server>\\n                        <name>${sync_auto-pop_name1}</name>\\n                        <source-address>${sync_auto-pop_address1}</source-address>\\n                    </tacplus-server>\\n                    <tacplus-server>\\n                        <name>${node0_tacplus_server_name2}</name>\\n                        <source-address>${sync_auto-pop_address1}</source-address>\\n                    </tacplus-server>\\n                </system>         \\n           </groups>\\n    </configuration>\"}]}",
          "requestId": "497085412083"
        },
        "status": {
          "code": "400",
          "message": "success"
        }
      }
    }
    let response = new ResponseOptions({
      body: JSON.stringify(mockData)
    });
    const baseResponse = new Response(response);
    mockBackend.connections.subscribe(
      (c: MockConnection) => c.mockRespond(baseResponse)
    );

    mappingEditorService.latestAction = { "action": "Configure", "action-level": "vnf", "scope": { "vnf-type": "testVnf", "vnfc-type": "" }, "template": "Y", "vm": [], "device-protocol": "CHEF", "user-name": "", "port-number": "", "artifact-list": [{ "artifact-name": "template_Configure_test_0.0.1V.json", "artifact-type": "config_template" }, { "artifact-name": "pd_Configure_test_0.0.1V.yaml", "artifact-type": "parameter_definitions" }], "scopeType": "vnf-type" }

    mappingEditorService.fromScreen = 'MappingScreen';
    component.action = 'Configure';
    component.refObj = mappingEditorService.latestAction;
    component.scopeName = "testVnf";
    component.vnfType = "testVnf";
    component.userId = "abc";
    component.item.action = "Configure";
    component.retrieveTemplateFromAppc();
    expect(component.configMappingEditorContent).not.toBe(null);

  }));

});
