/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'underscore';
import { NotificationsService } from 'angular2-notifications';
import { appConstants } from '../../../constants/app-constants';

export const ACTIONS_REQUIRED_DROPDOWN = ['Configure', 'ConfigModify', 'ConfigScaleOut', 'DistributeTraffic']


@Component({ selector: 'app-build-design', templateUrl: './build-artifacts.component.html', styleUrls: ['./build-artifacts.component.css'] })
export class BuildDesignComponent implements OnInit {
    tabs: Array<Object> = [];
    private allowOtherUpdates: boolean = true;
    public refDataRequiredFiels: boolean = false;
    public refList;

    constructor (private router: Router, private notificationsService: NotificationsService) {
    }

    ngOnInit() {
        this.tabs = appConstants.tabs;
    }

    public setAllowOtherUpdates(allowOtherUpdates: boolean) {
        this.allowOtherUpdates = allowOtherUpdates;
    }

    // Allow / block access to the update pages of GT and PD if no reference data present
    public updateAccessUpdatePages(selectedAction, referenceList) {
        // Disable/enable the menu items for update pages of GT and PD.
        if (this.isReferenceFound(selectedAction, referenceList)) {
            this.setAllowOtherUpdates(true);
        } else {
            //alert("false")
            this.setAllowOtherUpdates(false);
        }
    }

    public isReferenceFound(selectedAction, referenceList) {
        let selectedActioneObject = _.find(referenceList, function (obj) {
            return obj['action'] == selectedAction;
        });
        if (selectedActioneObject) {
            return true;
        } else {
            return false;
        }
    }

    public getRefData(referenceList, reqObj?) {
        this.refList = referenceList;
        if (referenceList.action !== '' && referenceList.scope['vnf-type'] !== '' && referenceList['device-protocol'] !== '') {
            if(ACTIONS_REQUIRED_DROPDOWN.indexOf(referenceList.action) > -1) {
            //if (referenceList.action === 'ConfigScaleOut') {
                //console.log(typeof reqObj, selectedIdentifier)
                // if (referenceList.hasOwnProperty('template-id') && referenceList['template-id'] !== undefined && referenceList['template-id'] != '')
                //     this.refDataRequiredFiels = true;
                // else this.refDataRequiredFiels = false;
                if(referenceList.action == 'ConfigScaleOut') {
                    if(reqObj != undefined && reqObj.hasOwnProperty('reqField') && reqObj.reqField != '') this.refDataRequiredFiels = true;
                    else this.refDataRequiredFiels = false;
                }

                // else if( referenceList.action == 'Configure' || referenceList.action == 'ConfigModify' ) {
                //     if(referenceList.displayVnfc == 'false') this.refDataRequiredFiels = true;
                //     else if( referenceList.displayVnfc != 'false' && referenceList.vnfcIdentifier ) this.refDataRequiredFiels = true;
                // }
                
                else this.refDataRequiredFiels = true;
            }
            else this.refDataRequiredFiels = true;
        }
        else {
            this.refDataRequiredFiels = false;
        }
    }

    public checkRefDataReqFields() {
        if (this.refList.action == appConstants.Actions.blank && this.refList.scope['vnf-type'] == '' && this.refList['device-protocol'] == appConstants.DeviceProtocols.blank) {
            this.notificationsService.error(appConstants.errors.error, appConstants.errors.noActionVnfProtocolError);
        }
        else if (this.refList.action == appConstants.Actions.blank) {
            this.notificationsService.error(appConstants.errors.error, appConstants.errors.noActionError);
        }
        else if (this.refList.scope['vnf-type'] == '') {
            this.notificationsService.error(appConstants.errors.error, appConstants.errors.noVnfTypeError);
        }
        else if (this.refList['device-protocol'] == appConstants.DeviceProtocols.blank) {
            this.notificationsService.error(appConstants.errors.error, appConstants.errors.noDeviceProtocolError);
        }
        else if (this.refList.action === appConstants.Actions.configScaleOut) {
            this.notificationsService.error(appConstants.errors.error, appConstants.errors.noValidTemplateIdentifierError);
        }
    }

}
