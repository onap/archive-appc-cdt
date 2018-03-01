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

import {AfterContentInit, Component, ContentChildren, QueryList} from '@angular/core';
import {Tab} from './tab';

@Component({
    selector: 'tabs',
    template: `
        <ul class="nav nav-tabs">
            <li [ngClass]="{'active-tab':(tab.isactive==true)}" class="nav-item" *ngFor="let tab of tabs" (click)="selectTab(tab)"
                [class.active]="tab.isactive">
                <a class="nav-link" ng-href=''>{{tab.title}}</a>
            </li>
        </ul>
        <ng-content></ng-content>
    `, styleUrls: ['./param-name-value.component.css']
})
export class Tabs implements AfterContentInit {

    @ContentChildren(Tab) tabs: QueryList<Tab>;


    // contentChildren are set
    ngAfterContentInit() {
        // get all active tabs
        let activeTabs = this.tabs.filter((tab) => tab.isactive);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    public selectTab(tab: Tab) {
        // deactivate all tabs
        this.tabs.toArray().forEach(tab => tab.isactive = false);

        // activate the tab the user has clicked on.
        tab.isactive = true;
    }

}
