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

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
// modules
import {VnfRoutingModule} from './vnf.routing';
import {SharedModule} from '../shared/shared.module';

import {AceEditorComponent} from 'ng2-ace-editor';
// components
import {MyvnfsComponent} from './myvnfs/myvnfs.component';
import {ReferenceDataformComponent} from './build-artifacts/reference-dataform/reference-dataform.component';
import {GoldenConfigurationComponent} from './build-artifacts/template-holder/template-configuration/template-configuration.component';
import {ParameterComponent} from './build-artifacts/parameter-definitions/parameter.component';
import {ParameterHolderComponent} from './build-artifacts/parameter-holder/parameter-holder.component';
import {BootstrapModalModule} from 'ng2-bootstrap-modal';
import {BuildDesignComponent} from './build-artifacts/build-artifacts.component';
import {userloginFormComponent} from './userlogin-form/userlogin-form.component';
import {ReferenceDataHolderComponent} from './build-artifacts/reference-data-holder/reference-data-holder.component';
import {VnfsComponent} from './vnfs/vnfs.component';
import {ConfirmComponent} from '../shared/confirmModal/confirm.component';
import {GoldenConfigurationHolderComponent} from './build-artifacts/template-holder/template-holder.component';
import {GoldenConfigurationMappingComponent} from './build-artifacts/template-holder/param-name-value/param-name-value.component';
import {Tab} from './build-artifacts/template-holder/param-name-value/tab';
import {Tabs} from './build-artifacts/template-holder/param-name-value/tabs';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {AuthGuardModalComponent} from './auth-guard-modal/auth-guard-modal';
import {GCAuthGuardService} from './GCAuthGuard/gcauth-guard.service';
import {LoginGuardService} from './LoginGuardService/Login-guard-service';
import {SimpleNotificationsModule} from 'angular2-notifications';
import { NgxSpinnerModule } from 'ngx-spinner';

//import {SyncResultsComponent} from './build-artifacts/sync-results/sync-results.component';


export const components = [
    BuildDesignComponent,
    GoldenConfigurationComponent,
    GoldenConfigurationMappingComponent,
    ParameterComponent,
    ParameterHolderComponent,
    MyvnfsComponent,
    userloginFormComponent,
    VnfsComponent,
    ReferenceDataformComponent,
    ReferenceDataHolderComponent,
    GoldenConfigurationHolderComponent,
    AceEditorComponent,
    Tab,
    Tabs,
    ConfirmComponent,
    AuthGuardModalComponent
   // SyncResultsComponent

];

export const modules = [
    CommonModule, VnfRoutingModule, SharedModule.forRoot(),
    FormsModule, BootstrapModalModule, Ng2Bs3ModalModule, NgxSpinnerModule, SimpleNotificationsModule.forRoot()

];

@NgModule({
    imports: [...modules],
    declarations: [...components],
    providers: [GCAuthGuardService, LoginGuardService],


    entryComponents: [ConfirmComponent, AuthGuardModalComponent]
})
export class VnfsModule {
}