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
import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { Http, Response, ResponseOptions, XHRBackend } from '@angular/http';

import { BuildDesignComponent } from '../build-artifacts.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import { MappingEditorService } from '../../..//shared/services/mapping-editor.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgModule } from '@angular/core';
import { NgProgress } from 'ngx-progressbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { Observable } from 'rxjs/Observable';
import { ParamShareService } from '../../..//shared/services/paramShare.service';
import { ReferenceDataformComponent } from './reference-dataform.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../shared/shared.module';
import { environment } from '../../../../environments/environment';

describe('ReferenceDataformComponent', () => {
    let component: ReferenceDataformComponent;
    let fixture: ComponentFixture<ReferenceDataformComponent>;
    let service: MockMappingService;

    let httpMock: HttpUtilService
    //mockingthe data for mappingEditorService

    class HttpMock {
        post(req) {

            return Observable.of(


                {
                    "output": { "data": { "block": "{\"userID\":null,\"designInfo\":null,\"statusInfo\":null,\"artifactInfo\":[{\"artifact-content\":\" {\\\"reference_data\\\":[{\\\"action\\\":\\\"Configure\\\",\\\"action-level\\\":\\\"vnf\\\",\\\"scope\\\":{\\\"vnf-type\\\":\\\"Btesting123\\\",\\\"vnfc-type\\\":\\\"\\\"},\\\"template\\\":\\\"Y\\\",\\\"vm\\\":[],\\\"device-protocol\\\":\\\"ANSIBLE\\\",\\\"user-name\\\":\\\"root\\\",\\\"port-number\\\":\\\"830\\\",\\\"artifact-list\\\":[{\\\"artifact-name\\\":\\\"template_Configure_Btesting123_0.0.1V.json\\\",\\\"artifact-type\\\":\\\"config_template\\\"},{\\\"artifact-name\\\":\\\"pd_Configure_Btesting123_0.0.1V.yaml\\\",\\\"artifact-type\\\":\\\"parameter_definitions\\\"}],\\\"scopeType\\\":\\\"vnf-type\\\"},{\\\"action\\\":\\\"AllAction\\\",\\\"action-level\\\":\\\"vnf\\\",\\\"scope\\\":{\\\"vnf-type\\\":\\\"Btesting123\\\",\\\"vnfc-type\\\":\\\"\\\"},\\\"artifact-list\\\":[{\\\"artifact-name\\\":\\\"reference_AllAction_Btesting123_0.0.1V.json\\\",\\\"artifact-type\\\":\\\"reference_template\\\"}]},{\\\"action\\\":\\\"ConfigScaleOut\\\",\\\"action-level\\\":\\\"vnf\\\",\\\"scope\\\":{\\\"vnf-type\\\":\\\"Btesting123\\\",\\\"vnfc-type\\\":\\\"\\\"},\\\"template\\\":\\\"Y\\\",\\\"vm\\\":[{\\\"template-id\\\":\\\"id1\\\",\\\"vm-instance\\\":1,\\\"vnfc\\\":[{\\\"vnfc-instance\\\":\\\"1\\\",\\\"vnfc-function-code\\\":\\\"12313\\\",\\\"ipaddress-v4-oam-vip\\\":\\\"Y\\\",\\\"group-notation-type\\\":\\\"first-vnfc-name\\\",\\\"group-notation-value\\\":\\\"pair\\\",\\\"vnfc-type\\\":\\\"vDBE-V\\\"}]},{\\\"template-id\\\":\\\"id1\\\",\\\"vm-instance\\\":2,\\\"vnfc\\\":[{\\\"vnfc-instance\\\":\\\"1\\\",\\\"vnfc-function-code\\\":\\\"12313\\\",\\\"ipaddress-v4-oam-vip\\\":\\\"Y\\\",\\\"group-notation-type\\\":\\\"first-vnfc-name\\\",\\\"group-notation-value\\\":\\\"pair\\\",\\\"vnfc-type\\\":\\\"vDBE-V\\\"}]},{\\\"template-id\\\":\\\"id1\\\",\\\"vm-instance\\\":3,\\\"vnfc\\\":[{\\\"vnfc-instance\\\":\\\"1\\\",\\\"vnfc-function-code\\\":\\\"12313\\\",\\\"ipaddress-v4-oam-vip\\\":\\\"Y\\\",\\\"group-notation-type\\\":\\\"first-vnfc-name\\\",\\\"group-notation-value\\\":\\\"pair\\\",\\\"vnfc-type\\\":\\\"vDBE-V\\\"}]}],\\\"device-protocol\\\":\\\"CHEF\\\",\\\"user-name\\\":\\\"root\\\",\\\"port-number\\\":\\\"830\\\",\\\"artifact-list\\\":[{\\\"artifact-name\\\":\\\"template_ConfigScaleOut_Btesting123_0.0.1V_id1.json\\\",\\\"artifact-type\\\":\\\"config_template\\\"},{\\\"artifact-name\\\":\\\"pd_ConfigScaleOut_Btesting123_0.0.1V_id1.yaml\\\",\\\"artifact-type\\\":\\\"parameter_definitions\\\"}],\\\"scopeType\\\":\\\"vnf-type\\\",\\\"template-id-list\\\":[\\\"id1\\\"]}]}\"}]}", "requestId": "563507520187" }, "status": { "code": "400", "message": "success" } },

                    "status": { code: "400", message: "success" }
                }


            )
        }
    }
    class MockMappingService {
        public latestAction; // = {"action":"Configure"}
        appDataObject = {
            reference: {},
            template: {
                templateData: {},
                nameValueData: {}
            },
            pd: {}
        };
        downloadDataObject = {
            reference: {},
            template: {
                templateData: {},
                nameValueData: {},
                templateFileName: '',
                nameValueFileName: ''
            },
            pd: {
                pdData: '',
                pdFileName: ''
            }
        }
        referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]

        setTemplateMappingDataFromStore(data) {
            return "test"
        }
        getReferenceList() {
            return ["test data"]
        }
        changeNav() {
            return "test data"
        }
        setParamContent(data) {
            return "test"
        }
        setSessionParamData(data) {
            return "test"
        }

        saveLatestAction() { }
        saveLatestIdentifier() { }
        changeNavDownloadData() { }
        changeNavAppData() { }
    }
    class MockreferenceDataObject { }
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReferenceDataformComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [

                FormsModule, RouterTestingModule, HttpModule, NgbModule.forRoot(),
                SharedModule.forRoot()
            ],
            providers: [
                BuildDesignComponent, {
                    provide: MappingEditorService,
                    useClass: MockMappingService
                },
                ParamShareService,
                DialogService,
                NotificationService, {
                    provide: HttpUtilService,
                    useClass: HttpMock
                }

            ]
        }).compileComponents();
    }));
    beforeEach(() => {

        fixture = TestBed.createComponent(ReferenceDataformComponent);
        component = fixture.componentInstance;
        //  component = new ReferenceDataformComponent(service)
        fixture.detectChanges();
        service = TestBed.get(MappingEditorService)
        httpMock = TestBed.get(HttpUtilService)
        sessionStorage.setItem('vnfParams', JSON.stringify({ vnfType: "test", vnfcType: "testVnfcType" }));
        // component = new ReferenceDataformComponent(service)
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

    it("should set app data from service", () => {
        component.ngOnInit()
        expect(component.appData)
            .not
            .toBe(undefined)
    })
    it("should set download from service", () => {
        component.ngOnInit()
        expect(component.downloadData)
            .not
            .toBe(undefined)
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

        component.referenceDataObject = {
            action: 'Configure',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': []
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })

    it("prepare reference method at vnfc level", () => {

        component.referenceDataObject = {
            action: 'Configure',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '123',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })

    it("prepare reference method at vnf and vnfc level", () => {

        component.referenceDataObject = {
            action: 'starttApplication',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '123',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': 'ANSIBLE',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();

        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
    //deviceprotocols netconf
    it("prepare reference method testing with netconf", () => {

        component.referenceDataObject = {
            action: 'starttApplication',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '123',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': 'NETCONF-XML',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
    //template id list
    it("prepare reference method at template id list", () => {

        component.referenceDataObject = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '123',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': 'NETCONF-XML',
            'user-name': '',
            'port-number': '',
            'artifact-list': []

        }
        component.vnfcIdentifier = '346';
        component.referenceDataObject['template-id-list'] = ['id1', 'id2']

        component.prepareReferenceObject();

        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
    it("prepare reference method at vnfc level", () => {

        component.referenceDataObject = {
            action: 'startApplication',
            'action-level': 'vnfc',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })
    it("prepare reference method at vnf level", () => {

        component.referenceDataObject = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };
        component.vnfcIdentifier = '346';
        component.prepareReferenceObject();
        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })

    it('should create reference component', () => {

        expect(component).toBeTruthy();
    });
    it('configscaleout test', () => {
        service.latestAction = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type': ''
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        service.referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]
        component.ngOnInit()
        expect(component.referenceDataObject.action).toBe("ConfigScaleOut");

    });

    it('shoud add vms with template id when the acti0on is configscaleout ', () => {
        component.referenceDataObject = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [
                {
                    vnfc: [
                        {
                            test: "123"
                        }
                    ]

                }
            ],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }

        component.refernceScopeObj.from = "3"
        // let arr = [1, 2];
        component.addVms()
        expect(component.referenceDataObject.vm.length).toBe(4);
    });
    it('shoud add vms with template id when the action is not configscaleout', () => {
        component.referenceDataObject = {
            action: 'Config',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [
                {
                    vnfc: [
                        {
                            test: "123"
                        }
                    ]

                }
            ],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }

        component.refernceScopeObj.from = "3"
        // let arr = [1, 2];
        component.addVms()
        expect(component.referenceDataObject.vm[0]['template-id']).toBe(undefined);
    });

    it('testing ngdestroy', () => {
        this.uploadFileName = 'testing'
        component.ngOnDestroy()
        expect(component.uploadedDataArray.length).toBe(0);
        expect(component.uploadFileName).toBe('');
    });
    it('should validate numbers', () => {

        component.numberValidation(1)
        expect(component.numberOfVmTest).toBe(true);

    });

    it('should validate numbers if input is string', () => {

        component.numberValidation('test')
        expect(component.numberOfVmTest).toBe(false);

    });

    it('testing check if elements exixts in an array', () => {

        let x = component.checkIfelementExistsInArray(2, [1, 2, 3])
        expect(x).toBeTruthy();
    });

    it('should set action in session if type is action', () => {

        component.updateSessionValues("test event for action", "action")

        expect(sessionStorage.getItem('action')).toBe('test event for action');
    });
    it('should set action in session if type is vnfType', () => {

        component.updateSessionValues("test event for vnfType", "vnfType")

        expect(sessionStorage.getItem('vnfType')).toBe('test event for vnfType');
    });

    it('should add vnfs on to reference Object ', () => {

        component.referenceDataObject = {
            action: '',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [
                {
                    vnfc: [
                        {
                            test: "123"
                        }
                    ]

                }
            ],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };

        component.addVnfcData(0)

        expect(component.referenceDataObject.vm[0].vnfc.length).toBe(2);
    });

    it("should remove feature from the reference object ", () => {
        component.referenceDataObject = {
            action: 'Configure',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            vm: [
                {
                    vnfc: [
                        {
                            test: "123"
                        }
                    ]

                }, {
                    vnfc: [
                        {
                            test: "123"
                        }
                    ]

                }
            ],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };

        component.removeFeature(0, 0, 0)

        expect(component.referenceDataObject.vm.length).toBe(1)
    })

    it("remove templateIds vm if action is confiogscaleout", () => {
        component.referenceDataObject = {
            action: 'ConfigScaleOut',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type-list': ['346']
            },
            'template': 'Y',
            "vm": [
                {
                    "template-id": "klmklj",
                    "vm-instance": 1,
                    "vnfc": [
                        {
                            "vnfc-instance": "1",
                            "vnfc-function-code": "klkl",
                            "ipaddress-v4-oam-vip": "",
                            "group-notation-type": "",
                            "group-notation-value": "",
                            "vnfc-type": "nnk"
                        }
                    ]
                }, {
                    "template-id": "test 12",
                    "vm-instance": 2,
                    "vnfc": [
                        {
                            "vnfc-instance": "1",
                            "vnfc-function-code": "klkl",
                            "ipaddress-v4-oam-vip": "",
                            "group-notation-type": "",
                            "group-notation-value": "",
                            "vnfc-type": "nnk"
                        }
                    ]
                }
            ],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        };

        component.removeFeature(0, 0, 'test 12')

        //expect(component.referenceDataObject.vm.length).toBe(2)

    })

    it("should add capabilities", () => {
        component.uploadedDataArray = [
            ['y', 'n']
        ]
        component.addVmCapabilitiesData()

        expect(component.tempAllData.length).toBe(3)
    })
    it("should add capabilities", () => {
        service.latestAction = {
            action: 'OpenStack Actions',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type': ''
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        service.referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]

        component.prepareReferenceObject();

        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })

    it("should add capabilities", () => {
        service.latestAction = {
            action: 'OpenStack Actions',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type': ''
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }

        component.referenceDataObject.action = "OpenStack Actions"
        service.referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]

        component.prepareReferenceObject();

        expect(component.referenceDataObject['action-level']).toBe("vnf")
    })

    it("should switch vms if action is configscaleout", () => {

        component.currentAction = "ConfigScaleOut"
        service.latestAction = {
            action: 'OpenStack Actions',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type': ''
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        service.referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]

        component.tempAllData = [
            {
                action: "ConfigScaleOut",
                vm: [{}, {}]
            }
        ]

        component.prepareReferenceObject();

        expect(component.referenceDataObject.vm.length).toBe(2)
    })
    it("should switch vms if action is configscaleout", () => {

        component.currentAction = "ConfigScaleOut"
        service.latestAction = {
            action: 'OpenStack Actions',
            'action-level': 'vnf',
            scope: {
                'vnf-type': '',
                'vnfc-type': ''
            },
            'template': 'Y',
            vm: [],
            'device-protocol': '',
            'user-name': '',
            'port-number': '',
            'artifact-list': []
        }
        service.referenceNameObjects = [
            {
                action: "Configure"
            }, {
                action: "StartApplication"
            }
        ]

        component.tempAllData = [
            {
                action: "startAplicaton"
            }
        ]

        component.prepareReferenceObject();

        expect(component.referenceDataObject.vm.length).toBe(0)
    })
    it('shoud show template identifier when action is config scaleout', () => {
        let data = 'ConfigScaleOut'
        component.toggleIdentifier(data)
        expect(component.isConfigScaleOut).toBe(true);
    });
    it('shoud show template identifier when action is config scaleout', () => {
        let data = 'startApplication'
        component.toggleIdentifier(data)
        expect(component.isConfigScaleOut).toBe(false);
    });

    it('Should call get artifact', () => {

        service.referenceNameObjects = undefined
        component.ngOnInit()
        expect(component.tempAllData.length).toBe(2)
    })

    it('Should call get artifact', () => {
        let spy = spyOn(BuildDesignComponent.prototype, 'getRefData');
        let refData = { "action": "Configure", "vnf-type": "test 1", "device-protocol": "ANSIBLE" };
        sessionStorage.setItem('updateParams', JSON.stringify({ vnf: 123, userID: 'testUser' }))

        component.getArtifact()

        expect(spy).toHaveBeenCalled();
        expect(component.tempAllData.length).toBe(3);
    })

    it('Save file - should not process if action is null ', () => {
        component.referenceDataObject.action = ""
        let fileSaved = component.save({}, true)
        expect(fileSaved).toBe(undefined)
    })
    it('Save file - should not process if device protocol is null ', () => {
        component.referenceDataObject.action = "Configure"
        component.referenceDataObject['device-protocol'] = ''
        let fileSaved = component.save({}, true)
        expect(fileSaved).toBe(undefined)
    })
    it('Save file - should not process if device protocol is null ', () => {
        component.referenceDataObject.action = "Configure"
        component.referenceDataObject['device-protocol'] = "test"
        component.downloadData.template.templateData = { "test": "test" }
        component.downloadData.template.nameValueData = { "test": "test" }
        component.downloadData.pd.pdData = "test"
        let fileSaved = component.save({}, true)
        //expect(fileSaved).toBe(undefined)
    })

    it('Save to appc file - should not process if action is null ', () => {
        component.referenceDataObject.action = "";
        component.referenceDataObject.scope['vnf-type'] = '';
        component.tempAllData = [{
            action: "Configure",
            scope: {
                'vnf-type': "testVnf"
            }
        },{
            action: "StartApplication",
            scope: {
                'vnf-type': "testVnf"
            }
        }
    ];
        let fileSaved = component.saveToAppc();
        expect(fileSaved).toBe(undefined)
    })
    it('Save to app cfile - should not process if device protocol is null ', () => {
        component.referenceDataObject['device-protocol'] = ""
        component.referenceDataObject.action = "Configure"
        component.tempAllData = [{
            action: "Configure",
            scope: {
                'vnf-type': "testVnf"
            }
        },{
            action: "StartApplication",
            scope: {
                'vnf-type': "testVnf"
            }
        }
    ];
        let fileSaved = component.saveToAppc();
        expect(fileSaved).toBe(undefined)
    })
    it('Save to appc file - should not process if device protocol is null ', () => {
        component.tempAllData = [
            {
                action: "Configure",
                scope: {
                    'vnf-type': "testVnf"
                }
            }
        ]
        component.referenceDataObject.action = "Configure"
        component.referenceDataObject['device-protocol'] = "test"
        component.appData.template.templateData = { "test": "test" }
        component.appData.template.nameValueData = { "test": "test" }
        component.appData.pd = { "test": "test" }
        component.actionChanged = true
        component.currentAction = "COnfigure"
        let fileSaved = component.saveToAppc();
        expect(fileSaved).toBe(undefined)
    })

    //   it('uploadfile  ', () => {  let    files = { 0: {name:'foo.XLS', size:
    // 500001} };     var mockEVet = {         target:{files:files}     }
    // component.upload(mockEVet)     //expect(fileSaved).toBe(undefined) })

    it('downloadTemplate() of reference dataform', () => {
        component.downloadTemplate()
        expect
    })
    it('downloadNameValue() of reference dataform', () => {
        component.downloadNameValue()
    })

    it('downloadPd() of reference dataform', () => {
        component.downloadPd()
    })
    it('validateTempAllData() of reference dataform', () => {
        component.validateTempAllData()
    })
    it('retriveFromAppc() of reference dataform', () => {
        sessionStorage.setItem('updateParams', JSON.stringify({ vnf: 123, userID: 'testUser' }))
        component.retriveFromAppc()
        expect(component.noCacheData).toBeFalsy()
    })
    it('retriveFromAppc() of reference dataform for false', () => {
        sessionStorage.setItem('updateParams', 'undefined')
        component.retriveFromAppc()
        expect(component.noCacheData).toBeTruthy()
    })
    it(' cloneMessage(servermessage) of reference dataform', () => {
        let servermessage = {
            test: "test"
        }
        component.cloneMessage(servermessage)
    })

    it('resetGroupNotation() of reference dataform for false case', () => {
        component.resetGroupNotation()
        expect(component.disableGrpNotationValue).toBeFalsy()
    })
    it('resetGroupNotation() of reference dataform for true case', () => {
        component.Sample['group-notation-type'] = "existing-group-name"
        component.resetGroupNotation()
        expect(component.disableGrpNotationValue).toBeTruthy()
    })
    it('resetVms() of reference dataform', () => {
        component.resetVms()
        expect(component.referenceDataObject.vm).toBeNull
    })

    it('Clear cache ', () => {
        component.clearCache()
        expect(component.downloadData.reference['name']).toBe(undefined);

    })

    it('sholud reset group notification ', () => {
        component.Sample['group-notation-type'] = "existing-group-name"
        component.resetGroupNotation()
        expect(component.disableGrpNotationValue).toBe(true);

    })
    it('sholud reset group notification if value does not match ', () => {
        component.Sample['group-notation-type'] = "123"
        component.resetGroupNotation()
        expect(component.disableGrpNotationValue).toBe(false);

    })
    it('add identity group', () => {
        component.referenceDataObject['template-id-list'] = undefined
        component.templateId = "test"
        component.addToIdentDrp()
        expect(component.referenceDataObject['template-id-list'].length).toBe(1);

    })

    it('add identity group', () => {

        component.resetVms()
        expect(component.referenceDataObject.vm.length).toBe(0);
        //expect(fileSaved).toBe(undefined)
    })
    it('data modified', () => {

        component.dataModified()

        component.referenceDataObject.vm = [1, 2]
        expect(component.referenceDataObject.vm.length).toBe(2);
        //expect(fileSaved).toBe(undefined)
    })

    it("should set values on action change ConfigScaleOut", () => {
        component.actionChange('ConfigScaleOut', { valid: true });

        expect(component.groupAnotationType.length).toBe(5)
    })
    it("shpukd return false if its very first action", () => {
        component.actionChange(null,{ valid: true });

        expect(component.disableGrpNotationValue).toBe(false)
    })
    it("sholud check no configuration actions", () => {
        component.tempAllData = [
            {
                action: "Configure",
                scope: {
                    'vnf-type': "testVnf"
                }
            }
        ]
        component.actionChange("Configure", { valid: true });

        expect(component.nonConfigureAction).toBe(false)
    })

    it("should set values on action change when action is HealthCheck ", () => {
        component.populateExistinAction("HealthCheck")

        expect(component.deviceProtocols.length).toBe(4)

    })
    it("should set values on action change when action is UpgradeBackout", () => {
        component.populateExistinAction("UpgradeBackout")

        expect(component.deviceProtocols.length).toBe(3)

    })
    it("should set values on action change when action is OpenStack Actions", () => {
        component.populateExistinAction("OpenStack Actions")

        expect(component.deviceProtocols.length).toBe(2)

    })
    it("should set values on action change when action is Configure", () => {
        component.tempAllData = [
            {
                action: "Configure",
                scope: {
                    'vnf-type': "testVnf"
                }
            }
        ]
        component.populateExistinAction("Configure")
        expect(component.referenceDataObject.scope['vnf-type']).toBe('testVnf')

    })
    it("shoukd clear vnf data ", () => {
        component.clearVnfcData()
        expect(component.Sample['vnfc-instance']).toBe('1')
    })
    it("shoudl showUpload", () => {
        component.uploadTypes = [
            {
                value: 'Reference Data',
                display: 'Sample Json Param File'
            },
            {
                value: 'Mapping Data',
                display: 'Sample Json Param File'
            }
        ]
        component.showUpload()

        expect(component.selectedUploadType).toBe('Reference Data')
    })
    it("set vm instance", () => {

        component.referenceDataObject.vm = [
            {
                'vm-instance': 1
            }
        ]
        component.setVmInstance(0)
        expect(component.referenceDataObject.vm[0]['vm-instance']).toBe(1)

    })
    it("set vnfc type", () => {
       // component.setVnfcType("test")
       //    expect(component.Sample['vnfc-type']).toBe("test");
    })
    it("getChange", () => {
       // component.getChange("vnfType")
        // expect(component.referenceDataObject.scope['vnfc-type']).toBe("");
    })
    it("idChange", () => {
        component.idChange(null, { valid: true })
        component.oldAction = "Configure"
        expect(component.actionChanged).toBeFalsy()
    })
    it("idChange", () => {
        component.oldAction = "Configure"
        component.oldtemplateIdentifier = "id1"
        component.templateIdentifier = "id1"
        component.idChange(null, { valid: true })
        expect(component.actionChanged).toBe(false)
    })
    it('Should test deviceProtocolChange method', () => {
        let spy = spyOn(BuildDesignComponent.prototype, 'getRefData');
        let refData = { "action": "Configure", "vnf-type": "test 1", "device-protocol": "ANSIBLE" };
        component.deviceProtocolChange();
        expect(spy).toHaveBeenCalled()
    });

    it('should test uplaod function', () => {        
        let content = "Hello World";  
        let data = new Blob([content], { type: 'text/plain' });  
        let arrayOfBlob = new Array<Blob>();  
        arrayOfBlob.push(data);  
        let file = new File(arrayOfBlob, "Mock.XLS"); 
        let evnt = {target: {files: [file]}};
        component.upload(evnt);
    });

    it('Should validatte fileChange method if file type is xml', async(() => {
        let reader = new FileReader();
        let content = "{data : 'Hello World'}";  
        let data = new Blob([content], { type: 'text/plain' });  
        let arrayOfBlob = new Array<Blob>();  
        arrayOfBlob.push(data);  
        let file = new File(arrayOfBlob, "Mock.XLS"); 
        let input = {target: {files: [file]}};
    
        component.fileChange(input);
      }));
});