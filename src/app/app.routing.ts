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

import {RouterModule, Routes} from '@angular/router';

import {AboutUsComponent} from './about-us/aboutus.component';
import { CanActivate } from '@angular/router';
import {HelpComponent} from './shared/components/help/help/help.component';
import {HomeComponent} from './home/home/home.component';
import { LoginGuardService } from './vnfs/LoginGuardService/Login-guard-service';
import {LogoutComponent} from './shared/components/logout/logout.component';
import {NgModule} from '@angular/core';
import {TestComponent} from './test/test.component';

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    }, {
        path: 'vnfs',
        loadChildren: './vnfs/vnfs.module#VnfsModule'
    }, {
        path: 'test',
        component: TestComponent,
        canActivate:[LoginGuardService]
    },
    {
        path: 'help',
        component: HelpComponent,
        canActivate:[LoginGuardService]
    }, {
        path: 'aboutUs',
        component: AboutUsComponent,
        canActivate:[LoginGuardService]
    }, {
        path: 'logout',
        component: LogoutComponent
    }, {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    
exports: [RouterModule]
})
export class AppRoutingModule {
}