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

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================
*/


import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EmitterService} from '../../services/emitter.service';
import { Subscription } from 'rxjs/Subscription';



@Component({selector: 'app-navigation', templateUrl: './navigation.component.html', styleUrls: ['./navigation.component.css']})
export class NavigationComponent implements OnInit {
    navigationTabs: Array<Object> = [];
    //@ViewChild(GoldenConfigurationComponent) goldenConfig: GoldenConfigurationComponent;
    @Input() id: string;
    userLoggedIn = false;
    userId: string = localStorage['userId'];
    subscription: Subscription;

    constructor(private router: Router) {
    };

    ngOnChanges() {
        this.subscription = EmitterService
            .get(this.id)
            .subscribe((value) => {
                if (value != null && value != '' && value != undefined && value != 'undefined') {
                    this.userId = value;
                    this.userLoggedIn = true;
                    localStorage['userId'] = this.userId;
                } else {
                    this.logout();
                }

            });
    }

    ngOnInit() {
        this.userId = localStorage['userId'];
        if (this.userId != undefined && this.userId != '') {
            this.userLoggedIn = true;
        }

        this.navigationTabs = [

            {
                name: 'Home',
                url: '/home'
            }, {
                name: 'MY VNFs',
                url: 'vnfs'
            },
            {
                name: 'Test',
                url: 'test',
            },
            {
                name: 'About us',
                url: 'aboutUs'
            }

        ];
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


    gotoDetail(url) {

        if (url == 'vnfs') {
            if (localStorage['userId'] != undefined && localStorage['userId'] != '' && localStorage['userId'] != null) {
                this.router.navigate(['/vnfs/list']);
            } else {
                this.router.navigate(url);
            }
        } else {
            this.router.navigate(url);
        }


    }

    logout() {
        window.localStorage.clear();
        sessionStorage.clear();
        localStorage.clear();
        this.userLoggedIn = false;
        //window.location.replace("/home");
        this.router.navigate(['home']);


    }

}