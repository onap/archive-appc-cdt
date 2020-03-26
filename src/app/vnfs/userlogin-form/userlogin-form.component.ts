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

import {Component, OnInit} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import {EmitterService} from '../../shared/services/emitter.service';
import {Router} from '@angular/router';
import {UtilityService} from '../../shared/services/utilityService/utility.service';

@Component({selector: 'app-mvnfs-form', templateUrl: './userlogin-form.component.html', styleUrls: ['./userlogin-form.component.css']})
export class userloginFormComponent implements OnInit {

    userId: string = '';
    returnUrl:string
    invalid = true;
    errorMessage = '';

    constructor(private router: Router, private utiltiy: UtilityService, private route: ActivatedRoute
        ) {
    }

    ngOnInit() {
           this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    }


    getData() {
        localStorage['userId'] = this.userId;
        localStorage['apiToken'] = this.utiltiy.randomId();
        EmitterService
            .get('userLogin')
            .emit(this.userId);
       this.router.navigateByUrl(this.returnUrl);
    }

    validateUserName(){
        if (!this.userId.trim() || this.userId.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        }else if(this.userId.startsWith(' ') || this.userId.endsWith(' ')){
            this.errorMessage = 'Leading and trailing space is not allowed';
            this.invalid = true;
        } else if(this.userId.includes('  ')){
            this.errorMessage = 'More than one space is not allowed in username';
             this.invalid = true;
        } else if(this.userId.length > 50) {
            this.errorMessage = 'Username should be of minimum one character and maximum 50 character';
             this.invalid = true;
        }else {
            this.invalid = false;
            this.errorMessage = '';
        }
    }

}
