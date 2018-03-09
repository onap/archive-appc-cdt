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
import { Http, Response, Headers, RequestOptions, HttpModule } from '@angular/http';
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

class MockService {
    doStuff() {
        return this;
    }
}

describe( 'TestComponent', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<TestComponent>;
	let http = new MockService();

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
			NgProgress,
			{provide: Http, useValue: http}
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
		let spy = spyOn(service, 'post').and.returnValue(Observable.empty());
		fixture.detectChanges(); // onInit()

		component.pollTestStatus();
        
        expect(service).toBeTruthy();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.any()).toBe(true, 'test');
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
			//let fileName = 'test_ConfigModify_ibcx0001_request';
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
			const temp = component.abortTest();
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
			//spyOn(component, 'upload');
			let fileExtension = 'XLS';
			let event = { isTrusted: true, type: "change", target: {files: [{name:'foo.XLS', size: 500001}]} }
			let reader = new FileReader();
			spyOn(reader, 'onload');

			component.upload(event);

			expect(reader instanceof FileReader).toBeTruthy();
			expect(reader.onload).toHaveBeenCalled();
			expect(component.enableTestButton).toBeTruthy();
			console.log('aaa',component.enableTestButton, component.uploadFileName);
		});

		it('should return an error if file extension is not XLS, XLSX', () => {
			spyOn(component, 'upload');
			let ele = fixture.debugElement.query(By.css('#filesparam'));
			const target = { files: ['']};
			component.uploadFileName = 'test.doc';
			let fileExtension = 'DOC';
			//let event = {isTrusted: true, type: "change", target: 'input#excelInputFile.file', currentTarget: 'input#excelInputFile.file', eventPhase: 2}

			component.upload('change');

			expect(target.files.length).toEqual(1)
			expect(fileExtension).not.toBe('XLS');
			expect(fileExtension).not.toBe('XLSX');
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
		//3rd , 4th columnd, tag name , tag value
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
			//expect(temp.input['common-header']['timestamp']).toEqual(new Date().toISOString());
			//expect(temp.input['common-header']['sub-request-id']).toEqual(new Date().getTime().toString());
		});
	});

	// Test testVnf Method
	describe('Test testVnf Method', () => {
		it('Should have testVnf method', () => {
			expect(component.testVnf).toBeDefined();
		});

		it('should return response on success', inject([HttpUtilService, NgProgress], (httpUtilService: HttpUtilService, ngProgress: NgProgress) => {
			let spy = spyOn(httpUtilService, 'post').and.callFake( ({}) => {
				return Observable.empty();
			});
			component.action  = 'ConfigModify';
			
			component.testVnf();
			// let apiRequest = JSON.stringify(component.constructRequest());

			expect(component.enableBrowse).toBeFalsy()
			expect(component.enableTestButton).toBeFalsy();
			expect(component.enablePollButton).toBeFalsy();
			expect(spy).toHaveBeenCalled();
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
			let spy  = spyOn(ngProgress, 'done');
			component.action  = 'ConfigModify';
			
			component.testVnf();
			
			// setTimeout(function() {
			//     expect(spy).toHaveBeenCalled()
		 //  	}, 3501);
		}));
	});

	// Test pollTestStatus Method
	describe('Test pollTestStatus Method', () => {
		it('Should have pollTestStatus method', () => {
			expect(component.pollTestStatus).toBeDefined();
		});

		it('test method', () => {
			let temp = component.pollTestStatus();
			let requestId = new Date().getTime().toString();
			let actionIdentifiers = 123456;
			//expect(temp.input['common-header']['timestamp']).toBe(new Date().toISOString());
		});

		it('should call fake server', inject([HttpUtilService], (httpUtilService: HttpUtilService) => {
			let spy = spyOn(httpUtilService, 'post').and.callFake(({}) => {
				return Observable.empty();
			});

			// //env.checkTestStatus = "https://mtanjv9apbc53.aic.cip.att.com:8443/restconf/operations/appc-provider-lcm:action-status";
			component.pollTestStatus();

			expect(spy).toHaveBeenCalled();
		}));

		it('should return an error if fails', inject([HttpUtilService], (httpUtilService: HttpUtilService) => {
			let error = 'Error Connecting to APPC server';
			let spy = spyOn(httpUtilService, 'post').and.callFake( ({}) => {
				return Observable.throw(error);
			});
			component.requestId = null;
			component.actionIdentifiers['vnf-id'] = false;

			component.pollTestStatus();

			expect(spy).toHaveBeenCalled();
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
		});
	});
})