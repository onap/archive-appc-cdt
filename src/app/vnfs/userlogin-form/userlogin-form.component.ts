/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018-2020 AT&T Intellectual Property. All rights reserved.
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
import { environment } from '../../../environments/environment';
import { HttpUtilService } from '../../shared/services/httpUtil/http-util.service';
import {Router} from '@angular/router';
import { NgProgress } from 'ngx-progressbar';
import {UtilityService} from '../../shared/services/utilityService/utility.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({selector: 'app-mvnfs-form', templateUrl: './userlogin-form.component.html', styleUrls: ['./userlogin-form.component.css']})
export class userloginFormComponent implements OnInit {

    userId: string = '';
    password: string = '';
    returnUrl:string
    invalid = true;
    errorMessage = '';

    constructor(private router: Router, private utiltiy: UtilityService, private route: ActivatedRoute,
            private http: Http, private ngProgress: NgProgress) {
    }

    ngOnInit() {
           this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    }


    getData() {
        this.ngProgress.start();
        var getHeader = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var authStr = btoa(this.userId + ':' + this.password);
        const options = {
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + authStr
                }),
                observe: 'response'
        };
        const data = {
                'input': {
                    'design-request': {
                        'request-id': '1',
                        'action': 'getDesigns',
                        'payload': '{"userID": "","filter":"reference"}'
                    }
                }
            };
            const x = JSON.parse(data.input['design-request']['payload']);
            x.userID = this.userId;
            data.input['design-request']['payload'] = JSON.stringify(x);
        console.log("auth " + btoa(this.userId + ':' + this.password));
        this.http.post(environment.getDesigns,data,options).subscribe(resp => {
                console.log("status " + resp.status);
                if(resp.status == 200){
                    console.log('logged in');
                    sessionStorage['userId'] = this.userId;
                    sessionStorage['apiToken'] = this.utiltiy.randomId();
                    sessionStorage['auth'] = authStr;
                    EmitterService
                        .get('userLogin')
                        .emit(this.userId);
                    this.router.navigateByUrl(this.returnUrl);
                } else {
                    console.log("Invalid user or password");
                    this.invalid = true;
                    this.errorMessage = 'Invalid user or password';
                }
            }, error => {
                console.log(error);
                if(error.status == 401){
                    this.invalid = true;
                    this.errorMessage = 'Invalid user or password';
                } else {
                    this.invalid = true;
                    this.errorMessage = 'Incorrect login or connection error.';
                }
            });
        console.log("After");
        
    }

    validateUserName(){
        if (!this.userId.trim() || this.userId.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        }else if(this.userId.startsWith(' ') || this.userId.endsWith(' ')){
            this.errorMessage = 'Leading and trailing space is not allowed in username';
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
    
    validatePassword(){
        if (!this.password.trim() || this.password.length < 1) {
            this.errorMessage = '';
            this.invalid = true;
        }else if(this.password.startsWith(' ') || this.password.endsWith(' ')){
            this.errorMessage = 'Leading and trailing space is not allowed in password';
            this.invalid = true;
        } else if(this.password.includes('  ')){
            this.errorMessage = 'More than one space is not allowed in password';
             this.invalid = true;
        } else if(this.password.length > 50) {
            this.errorMessage = 'Password should be of minimum one character and maximum 50 character';
             this.invalid = true;
        }else {
            this.invalid = false;
            this.errorMessage = '';
        }
    }

}
