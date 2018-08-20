/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Copyright (C) 2018 IBM.
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MappingEditorService } from './shared/services/mapping-editor.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'app works!';
    item: any = {};
    subscription: any;

    constructor(private mappingEditorService: MappingEditorService) {

    }

    ngOnInit() {
        this.item = this.mappingEditorService.navItem();
        this.subscription = this.mappingEditorService.navChange$.subscribe(
            item => this.selectedNavItem(item));
    }

    selectedNavItem(item: any) {
        this.item = item;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
