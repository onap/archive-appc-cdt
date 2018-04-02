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

============LICENSE_END============================================
*/

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'underscore';

@Component({ selector: 'app-build-design', templateUrl: './build-artifacts.component.html', styleUrls: ['./build-artifacts.component.css'] })
export class BuildDesignComponent implements OnInit {
    tabs: Array<Object> = [];
    private allowOtherUpdates: boolean = true;
    public refDataRequiredFiels: boolean = false;

    constructor(private router: Router) {
    }

    ngOnInit() {
        this.tabs = [
            {
                type: 'dropdown',
                name: 'Reference Data',
                url: 'references',
            }, {
                name: 'Template',
                type: 'dropdown',
                url: 'templates/myTemplates',
            }, {
                name: 'Parameter Definition',
                type: 'dropdown',
                url: 'parameterDefinitions/create'
            } /*, {
        name: "Test",
        url: 'test',
      }*/
        ];
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

    public getRefData(referenceList) {
        if (referenceList.action !== '' && referenceList['vnf-type'] !== '' && referenceList['device-protocol'] !== '') {
            this.refDataRequiredFiels = true;
        }
        else {
            this.refDataRequiredFiels = false;
        }
    }

}
