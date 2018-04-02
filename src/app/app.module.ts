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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {HomeModule} from './home/home.module';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {SharedModule} from './shared/shared.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {TestComponent} from './test/test.component';
import {AboutUsComponent} from './about-us/aboutus.component';
import {NgProgressModule} from 'ngx-progressbar';
import {LoginGuardService} from './vnfs/LoginGuardService/Login-guard-service';

@NgModule({
    declarations: [AppComponent, TestComponent, AboutUsComponent],
    imports: [BrowserModule, FormsModule, HomeModule, SharedModule.forRoot(),
        NgbModule.forRoot(), NoopAnimationsModule, AppRoutingModule, SimpleNotificationsModule, NgProgressModule],
    exports: [RouterModule],
    providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}, LoginGuardService],

    bootstrap: [AppComponent]
})

export class AppModule {
}