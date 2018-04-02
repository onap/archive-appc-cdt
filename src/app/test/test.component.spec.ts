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

// Modules
import { async, ComponentFixture, TestBed,inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { Http, Headers, HttpModule, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';

// Component
import { TestComponent } from './test.component';

// Services
import { NotificationService } from '../shared/services/notification.service';
import { ParamShareService } from '.././shared/services/paramShare.service';
import { MappingEditorService } from '../shared/services/mapping-editor.service';
import { HttpUtilService } from '../shared/services/httpUtil/http-util.service';
import { UtilityService } from '../shared/services/utilityService/utility.service';
import { environment } from '../.././environments/environment';
import { NgProgress } from 'ngx-progressbar';
import { NgProgressModule } from 'ngx-progressbar';

describe( 'TestComponent', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<TestComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TestComponent],
			imports: [
			FormsModule,
			RouterTestingModule,
			SimpleNotificationsModule,
			HttpModule,
			NgProgressModule
			],
			providers: [
			NotificationService, 
			ParamShareService,
			MappingEditorService,
			HttpUtilService,
			UtilityService,
			NgProgress,MockBackend, BaseRequestOptions,
				{
                    provide: Http,
                    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
                        return new Http(backend, defaultOptions);
                    },
                    deps: [MockBackend, BaseRequestOptions],
                }
			]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should ...', inject([HttpUtilService], (service: HttpUtilService) => {
		fixture.detectChanges(); // onInit()

		component.pollTestStatus();
        
        expect(service).toBeTruthy();
    }));
	
	// Test download Method
	describe('Test download Method', () => {
		it('Should have download method', () => {
			expect(component.download).toBeDefined();
		});

		it('test if apiRequest if true', inject( [SimpleNotificationsModule], (service: SimpleNotificationsModule) => {
			component.apiRequest = '{"input":{"common-header":{"timestamp":"2018-03-05T07:41:14.329Z","api-ver":"2.00","originator-id":"CDT","request-id":"1520235674330","sub-request-id":"1520235674330","flags":{"mode":"NORMAL","force":"TRUE","ttl":3600}},"action":"ConfigModify","action-identifiers":{"vnf-id":"ibcx0001","vserver-id":"test"},"payload":""';
			component.apiResponse = '';
			component.action  = 'ConfigModify';
			component.actionIdentifiers['vnf-id'] = 'ibcx0001';
			let fileName = 'test_' + component.action + '_' + component.actionIdentifiers['vnf-id'] + '_request';
			let theJSON = component.apiRequest; 
			var blob = new Blob([theJSON], {
                type: 'text/json'
            });

			component.download();

			expect(service instanceof SimpleNotificationsModule).toBeTruthy();
			expect(component.apiRequest).not.toBe('');
			expect(fileName).not.toBe('');
			expect(fileName).not.toBeNull();
			expect(fileName).toContain('test_');
			expect(fileName).toContain('_request');
			expect(typeof (blob)).toBe('object');

		}));

		it('test method if apiResponse is true', () => {
			component.apiResponse = '{"input":{"common-header":{"timestamp":"2018-03-05T07:41:14.329Z","api-ver":"2.00","originator-id":"CDT","request-id":"1520235674330","sub-request-id":"1520235674330","flags":{"mode":"NORMAL","force":"TRUE","ttl":3600}},"action":"ConfigModify","action-identifiers":{"vnf-id":"ibcx0001","vserver-id":"test"},"payload":""';
			component.apiRequest = '';
			component.action  = 'ConfigModify';
			component.actionIdentifiers['vnf-id'] = 'ibcx0001';
			let fileName = 'test_' + component.action + '_' + component.actionIdentifiers['vnf-id'] + '_response';
			let theJSON = component.apiRequest;
			var blob = new Blob([theJSON], {
                type: 'text/json'
            });

			component.download();

			expect(component.apiResponse).not.toBe('');
			expect(fileName).not.toBe('');
			expect(fileName).not.toBeNull();
			expect(fileName).toContain('test_');
			expect(fileName).toContain('_response');
			expect(typeof (blob)).toBe('object');

		});
	});

	// Test abortTest Method
	describe('Test abortTest Method', () => {
		it('Should have abortTest method', () => {
			expect(component.abortTest).toBeDefined();
		});

		it('Test abortTest Method', () => {
			component.abortTest();
			expect(component.enableBrowse).toBeTruthy();
			expect(component.enableTestButton).toBeTruthy();
			expect(component.enablePollButton).toBeTruthy();
		});
	});

	// Test excelBrowseOption Method
	describe('Test excelBrowseOption Method', () => {
		it('test excelBrowseOption', () => {
			spyOn(component, 'excelBrowseOption');
			let button = fixture.debugElement.query(By.css('#excelInputFile ~ button.browse'));
			button.nativeElement.click();
			expect(component.excelBrowseOption).toHaveBeenCalled()
		});
	});

	// Test Upload Method
	describe('Test Upload Method', () => {
		it('Should have upload method', () => {
			expect(component.upload).toBeDefined();
		});

		it('should execute if file extension is XLS, XLSX', () => {
			let reader = new FileReader();
			let file = new File(["testing"], "foo.XLS", {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
			let fileExtension = 'XLS';
			let event = { isTrusted: true, type: "change", target: {files: [file]} }

			component.upload(event);

			expect(reader instanceof FileReader).toBeTruthy();
			expect(component.pollCounter).toBe(0)
		});

		it('should return an error if file extension is not XLS, XLSX', () => {
			let reader = new FileReader();
			let file = new File(["testing"], "foo.doc", {type: ""})
			let fileExtension = 'doc';
			let event = { isTrusted: true, type: "change", target: {files: [file]} }
			
			component.upload(event);

			expect(reader instanceof FileReader).toBeTruthy();
			expect(component.flag).toBe(1)
		});

		it('Should return an error is files length is not equal to 1', () => {
			
		});
	});

	// Test processUploadedFile Method
	describe('Test processUploadedFile Method', () => {
		it('should return valid payload', () => {
			let data = [
				{"TagName":"action","Value":"ConfigModify"},
				{"List Name":"action-identifiers","TagName":"vserver-id","Value":"test"},
				{"List Name":"payload","List Name_1":"request-parameters","TagName":"vnf-name","Value":"ibcx0001"},
				{"List Name":"payload","List Name_1":"request-parameters","List Name_2":"[vm]","List Name_3":"vnfc","TagName":"vnfc-name","Value":"ibcx0001vm001ssc001"},
				{"List Name":"payload","List Name_1":"configuration-parameters","TagName":"CORE_NETWORK_DEFAULT_GATEWAY","Value":"192.168.30.44"}
			]

			let payload = component.processUploadedFile(data);
		});
	});

	// Test uploadedFileResult Method
	describe('Test uploadedFileResult', () => {
		it('should return success message', inject([SimpleNotificationsModule],(service: SimpleNotificationsModule) => {
			component.action  = 'ConfigModify';
			component.actionIdentifiers['vnf-id'] = 'ibcx0001';

			component.uploadedFileResult();

			expect(service instanceof SimpleNotificationsModule).toBeTruthy();
		}));

		it('should return error message', inject([SimpleNotificationsModule], (service: SimpleNotificationsModule) => {
			component.action  = '';
			component.actionIdentifiers['vnf-id'] = '';

			component.uploadedFileResult();

			expect(service instanceof SimpleNotificationsModule).toBeTruthy();
		}));
	});

	// Test constructTestPayload Method 
	describe('Test constructTestPayload Method', () => {
		it('Should have constructTestPayload method', () => {
			expect(component.constructTestPayload).toBeDefined();
		});

		it('test if listName2, listName3 are undefined', () => {
			let temp = component.constructTestPayload(undefined, undefined, 'vnfc-type', 'vISBC - ssc');
			expect(component.subPayload['vnfc-type']).toEqual('vISBC - ssc')
		});

		it('test if lastName2 is not undefined', () => {
			let temp = component.constructTestPayload(['vm'], undefined, 'vnfc-type', 'vISBC - ssc');
			expect(typeof(component.vmJson)).toEqual('object');
			expect(typeof(component.vnfcJson)).toEqual('object');
			expect(component.vmJson['vnfc-type']).toBe('vISBC - ssc');
			expect(component.flag).toBe(0);
		});

		it('test if lastNmae2, lastName3 are not undefined', () => {
			let temp = component.constructTestPayload(['vm'], 'vnfc', 'vnfc-type', 'vISBC - ssc');
			expect(component.vnfcJson['vnfc-type']).toEqual('vISBC - ssc');
			expect(component.vmJson['vnfc']['vnfc-type']).toEqual('vISBC - ssc');
			expect(component.flag).toBe(1);
		})
	});

	// Test constructRequest Method
	describe('Test constructRequest Method', () => {
		it('Should have constructRequest method', () => {
			expect(component.constructRequest).toBeDefined();
		});

		it('test method', () => {
			let temp = component.constructRequest();
		});
	});

	// Test testVnf Method
	describe('Test testVnf Method', () => {
		it('Should have testVnf method', () => {
			expect(component.testVnf).toBeDefined();
		});

		it('should return response on success', inject([MockBackend], (mockBackend: MockBackend) => {	
			let mockData = 'testing';
	        let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => { 
	            	c.mockRespond(baseResponse)
	            }
	        );

	        component.action  = 'ConfigModify';
			
			component.testVnf();
		}));

		it('should return an error if fails', inject([HttpUtilService],( httpUtilService: HttpUtilService) => {
			let error = 'Error in connecting to APPC Server';
			let spy = spyOn(httpUtilService, 'post').and.returnValue(Observable.throw(error));
			component.action  = 'ConfigModify';
			
			component.testVnf();

			expect(spy).toHaveBeenCalled();
			expect(component.enableBrowse).toBeTruthy();
			expect(component.enableTestButton).toBeTruthy();
			expect(component.enablePollButton).toBeTruthy();
			expect(component.enableCounterDiv).toBeFalsy();
		}));

		it('test setTimeout', inject([NgProgress], (ngProgress: NgProgress) => {
			component.action  = 'ConfigModify';
			
			component.testVnf();
		}));
	});

	// Test pollTestStatus Method
	describe('Test pollTestStatus Method', () => {
		it('Should have pollTestStatus method', () => {
			expect(component.pollTestStatus).toBeDefined();
		});

		it('should call fake server', inject([MockBackend], (mockBackend: MockBackend) => {
			component.requestId = new Date().getTime().toString();
			component.actionIdentifiers['vnf-id'] = 123456;
			let mockData = { "output": { "common-header": { "originator-id": "CDT", "sub-request-id": "653018029941", "timestamp": "2018-02-12T07:27:21.448Z", "api-ver": "2.00", "request-id": "653018029941", "flags": { "force": "TRUE", "mode": "NORMAL", "ttl": 3600 } }, "payload": "{\"status-reason\":\"FAILED\",\"status\":\"FAILED\"}", "status": { "message": "SUCCESS - request has been processed successfully", "code": 400 } } } ;
	        let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => c.mockRespond(baseResponse)
	        );
			
			component.pollTestStatus();
		}));

		it('should call fake server if status is success', inject([MockBackend], (mockBackend: MockBackend) => {
			component.requestId = new Date().getTime().toString();
			component.actionIdentifiers['vnf-id'] = 123456;
			let mockData = { "output": { "common-header": { "originator-id": "CDT", "sub-request-id": "653018029941", "timestamp": "2018-02-12T07:27:21.448Z", "api-ver": "2.00", "request-id": "653018029941", "flags": { "force": "TRUE", "mode": "NORMAL", "ttl": 3600 } }, "payload": "{\"status-reason\":\"SUCCESS\",\"status\":\"SUCCESS\"}", "status": { "message": "SUCCESS - request has been processed successfully", "code": 400 } } } ;
	        let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => c.mockRespond(baseResponse)
	        );
			
			component.pollTestStatus();
		}));

		it('should execute else part if timeStamp && status && statusReason are false', inject([MockBackend], (mockBackend: MockBackend) => {
			component.requestId = new Date().getTime().toString();
			component.actionIdentifiers['vnf-id'] = 123456;
			let mockData = { "output": { "common-header": { "originator-id": "CDT", "sub-request-id": "653018029941", "timestamp": "2018-02-12T07:27:21.448Z", "api-ver": "2.00", "request-id": "653018029941", "flags": { "force": "TRUE", "mode": "NORMAL", "ttl": 3600 } }, "payload": "{\"status-reason\":\"FAILED\",\"status\":\"\"}", "status": { "message": "SUCCESS - request has been processed successfully", "code": 400 } } } ;
	        let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => c.mockRespond(baseResponse)
	        );
			
			component.pollTestStatus();
		}));

		 it('should check error condition on polling where timestamp and test status are not available', inject([MockBackend], (mockBackend: MockBackend) => {
			component.requestId = new Date().getTime().toString();
			component.actionIdentifiers['vnf-id'] = 123456;
			//let mockData = { "output": { "common-header": { "originator-id": "CDT", "sub-request-id": "653018029941", "timestamp": "2018-02-12T07:27:21.448Z", "api-ver": "2.00", "request-id": "653018029941", "flags": { "force": "TRUE", "mode": "NORMAL", "ttl": 3600 } }, "payload": "{\"status-reason\":\"FAILED\",\"status\":\"\"}", "status": { "message": "SUCCESS - request has been processed successfully", "code": 400 } } } ;
	        let mockData={"output":{"common-header":{"timestamp":"2018-03-21T14:20:30.910Z","api-ver":"2.00","request-id":"1521642030910","flags":{"force":"TRUE","mode":"NORMAL","ttl":3600},"originator-id":"CDT","sub-request-id":"1521642030910"},"status":{"message":"INVALID INPUT PARAMETER - vserver-id","code":301}}};
            let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => c.mockRespond(baseResponse)
	        );
			
			component.pollTestStatus();
		}));

		it('should return an error if fails', inject([MockBackend], (mockBackend: MockBackend) => {
			let error = 'Error Connecting to APPC server';
			component.requestId = new Date().getTime().toString();
			component.actionIdentifiers['vnf-id'] = 123456;
	        let mockData = '';
	        let response = new ResponseOptions({
	            body: JSON.stringify(mockData)
	        });
	        const baseResponse = new Response(response);
	        mockBackend.connections.subscribe(
	            (c: MockConnection) => c.mockError(new Error(error))
	        );

			component.pollTestStatus();
		}));
	});
	
	// Test getUrlEndPoint Method
	describe('Test getUrlEndPoint Method', () => {
		it('Should have getUrlEndPoint method', () => {
			expect(component.getUrlEndPoint).toBeDefined();
		});

		it('getUrlEndPoint Should return value', () => {
			expect(component.getUrlEndPoint('configmodify')).toEqual('config-modify');
			expect(component.getUrlEndPoint('configbackup')).toEqual('config-backup');
			expect(component.getUrlEndPoint('configrestore')).toEqual('config-restore');
			expect(component.getUrlEndPoint('healthcheck')).toEqual('health-check');
			expect(component.getUrlEndPoint('quiescetraffic')).toEqual('quiesce-traffic');
			expect(component.getUrlEndPoint('resumetraffic')).toEqual('resume-traffic');
			expect(component.getUrlEndPoint('startapplication')).toEqual('start-application');
			expect(component.getUrlEndPoint('stopapplication')).toEqual('stop-application');
			expect(component.getUrlEndPoint('upgradebackout')).toEqual('upgrade-backout');
			expect(component.getUrlEndPoint('upgradepostcheck')).toEqual('upgrade-post-check');
			expect(component.getUrlEndPoint('upgradeprecheck')).toEqual('upgrade-pre-check');
			expect(component.getUrlEndPoint('upgradesoftware')).toEqual('upgrade-software');
			expect(component.getUrlEndPoint('DeFaultCASE')).toEqual('defaultcase');
			expect(component.getUrlEndPoint('upgradebackup')).toEqual('upgrad-ebackup');
			expect(component.getUrlEndPoint('attachvolume')).toEqual('attach-volume');
			expect(component.getUrlEndPoint('detachvolume')).toEqual('detach-volume');
		});
	});
})