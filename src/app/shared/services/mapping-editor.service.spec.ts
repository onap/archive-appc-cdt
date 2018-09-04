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
import { By, BrowserModule } from '@angular/platform-browser';
import { Component, OnInit, ViewChild, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { MappingEditorService } from './mapping-editor.service';
import { GoldenConfigurationComponent } from '../../vnfs/build-artifacts/template-holder/template-configuration/template-configuration.component';
import { ArtifactRequest } from '../../shared/models/index';
import { UtilityService } from '../../shared/services/utilityService/utility.service';
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from "file-saver";
import { NotificationService } from '../../shared/services/notification.service';
import { HttpUtilService } from '../../shared/services/httpUtil/http-util.service';
import { NotificationsService } from "angular2-notifications"
import { ParamShareService } from '../../shared/services/paramShare.service';
import { DialogService } from "ng2-bootstrap-modal";
import { ConfirmComponent } from '../../shared/confirmModal/confirm.component';
import { BuildDesignComponent } from '../../vnfs/build-artifacts/build-artifacts.component';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal'
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from '../../home/home/home.component';
import { LogoutComponent } from '../../shared/components/logout/logout.component';
import { HelpComponent } from '../../shared/components/help/help/help.component';
import { AboutUsComponent } from '../../about-us/aboutus.component';
import { TestComponent } from '../../test/test.component';
import { HttpModule } from '@angular/http';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { NgProgress } from 'ngx-progressbar';
import { BaseRequestOptions, Response, ResponseOptions, Http } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';


describe('MappingEditorService', () => {
    let service;
    let component: GoldenConfigurationComponent;
    let fixture: ComponentFixture<GoldenConfigurationComponent>;
    let httpUtil: HttpUtilService;
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
            providers: [MappingEditorService, BuildDesignComponent, NgProgress, ParamShareService, DialogService, NotificationService, NgxSpinnerService, MockBackend,
                BaseRequestOptions, UtilityService,
                {
                    provide: Http,
                    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions],
                },
                HttpUtilService, MappingEditorService, NotificationsService],
            schemas: [NO_ERRORS_SCHEMA]
            // providers: [MappingEditorService]
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

    it('should test getStartBeforeAfterSelection function', () => {
        let selection = { start: { column: 12 }, end: { column: 12 } };
        let beforeCOunt = 2;
        let afterCount = 4;

        expect(service.getStartBeforeAfterSelection(selection, beforeCOunt, afterCount)).toEqual({ start: { column: 10 }, end: { column: 16 } });
    });

    it('should test autoAnnotateDataForParams function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";

        localStorage["paramsContent"] = JSON.stringify({ "sync_auto-pop_name1": "10.0.1.34", "sync_auto-pop_address1": "", "node0_tacplus_server_name2": "192.34.45.5" });
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.autoAnnotateDataForParams();

    });

    it('should test checkApplied function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.checkApplied({ start: { column: 12 }, end: { column: 12 } });
    });

    it('should test checkComments function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.checkComments({ start: { column: 12 }, end: { column: 12 } });
    });

    it('should test checkDelimiters function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.checkDelimiters({ start: { column: 12 }, end: { column: 12 } });
    });

    it('should test checkAppliedForNamesOnly function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.checkAppliedForNamesOnly({ start: { column: 12 }, end: { column: 12 } });
    });

    it('should test checkToDataAddForJson function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        expect(service.checkToDataAddForJson("dsjfds")).toEqual(true);
    });


    it('should test replaceNamesWithBlankValues function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.replaceNamesWithBlankValues();
    });


    it('should test autoAnnotateTemplateForParam function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.autoAnnotateTemplateForParam();
    });

    it('should test generateTemplate function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.generateTemplate(component.templateeditor.getEditor());
    });

    it('should test generateParams function', () => {
        fixture = TestBed.createComponent(GoldenConfigurationComponent);
        component = fixture.componentInstance;
        component.configMappingEditorContent = "<configuration xmlns=\"http://xml.juniper.net/xnm/1.1/xnm\" \n    xmlns:a=\"http://xml.juniper.net/junos/15.1X49/junos\" >\n            <version>15.1X49-D50.3</version>\n            <groups>\n                <name>node0</name>\n                <system>\n                   <tacplus-server>\n                        <name>${sync_auto-pop_name1}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                    <tacplus-server>\n                        <name>${node0_tacplus_server_name2}</name>\n                        <source-address>${sync_auto-pop_address1}</source-address>\n                    </tacplus-server>\n                </system>         \n           </groups>\n    </configuration>";
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.generateParams(component.templateeditor.getEditor(), component.templateeditor.getEditor());
    });

    it('should test removeTheSelectedMarkers function', () => {
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.removeTheSelectedMarkers();
    });


    it('should test getsaveMarkers function', () => {
        service.initialise(component.templateeditor.getEditor(), component.configMappingEditorContent, component.modal);
        service.getsaveMarkers();
    });

    it('should test getTemplateMappingDataFromStore function', () => {
        service.getTemplateMappingDataFromStore();
    });

    it('should test setTemplateMappingDataFromStore function', () => {
        service.setTemplateMappingDataFromStore({ data: 'data' });
    });

    it('should test setReferenceList function', () => {
        service.setReferenceList();
    });

    it('should test getReferenceList function', () => {
        service.getReferenceList();
    });

    it('should test getKeysForValues function to return key value', ()=>{        
        service.paramContent = '{"Value":"value","key":"key"}';
        let value = service.getKeysForValues('value');
        expect(value).toBe('Value');
    });

    it('should call refreshEditor() function', ()=> {
        let spy = spyOn(MappingEditorService.prototype, 'refreshEditor');      
        service.handlekeyCompletion();
        expect(spy).toHaveBeenCalled();
    });

    it('should test setTemplateDataForStore function', ()=>{
        service.setTemplateDataForStore('data');
        let tmpDaa = service.getTemplateDataFromStore();
        expect(service.storedTemplateData).toBe('data');
    });

    it('should test selectedObj function', ()=>{
        service.selectedObj('data');
        expect(service.newObject).toBe('data');
    });
});