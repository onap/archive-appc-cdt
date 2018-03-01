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


import {ModuleWithProviders, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Collapse} from './directives/collapse.component';
import {CommonModule} from '@angular/common';
import {DropDownToggleDirective} from './directives/drop-down-toggle.directive';
import {Dropdown} from './directives/dropdown';
import {DropdownNotClosableZone} from './directives/dropdownnotclosablezone';
import {DropdownOpen} from './directives/dropdownopen';
import {EmitterService} from './services/emitter.service';
import {HeaderComponent} from './components/header/header.component';
import {HelpComponent} from './components/help/help/help.component';
import {HttpModule} from '@angular/http';
import {HttpUtilService} from './services/httpUtil/http-util.service';
import {LogoutComponent} from './components/logout/logout.component';
import {MappingEditorService} from './services/mapping-editor.service';
import {NavigationComponent} from './components/navigation/navigation.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NotificationService} from './services/notification.service';
import {ParamShareService} from './services/paramShare.service';
import {TidyTableModule} from './modules/tidy-table/tidy-table.module';
import {UtilityService} from './services/utilityService/utility.service';
import {VmFilteringPipe} from '../pipes/vm-filtering.pipe';
import {SimpleNotificationsModule} from 'angular2-notifications';
import { NgProgressModule } from 'ngx-progressbar';
import {FormsModule} from '@angular/forms';

@NgModule({
    imports: [
        FormsModule,
        CommonModule, HttpModule, RouterModule, TidyTableModule, NgProgressModule, NgbModule, SimpleNotificationsModule.forRoot()],

    declarations: [VmFilteringPipe,

        HelpComponent,
        HeaderComponent, NavigationComponent, LogoutComponent, Collapse, Dropdown, DropdownNotClosableZone, DropdownOpen, DropDownToggleDirective
    ],
    exports: [VmFilteringPipe, NgProgressModule, NgbModule, HelpComponent, DropDownToggleDirective, HeaderComponent, NavigationComponent, LogoutComponent, TidyTableModule, Collapse, Dropdown, DropdownNotClosableZone, DropdownOpen]
})
export class SharedModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [HttpUtilService, EmitterService, NotificationService,
                UtilityService,
                ParamShareService, MappingEditorService]
        };
    }
}