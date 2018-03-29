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
import { observable } from 'rxjs/symbol/observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class HttpUtilService {
    headers: Headers;
    options: RequestOptions
    private username = require('../../../cdt_properties.json').username;
    private password = require('../../../cdt_properties.json').password;

    constructor (private http: Http) {
        this.headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        // this.options = new RequestOptions({headers: this.headers}); //
    }

    get(req) {

        return this
            .http
            .get(req.url, this.options)
            .map((res: Response) => res.json())
    }

    post(req) {

         this.headers.append('Authorization', 'Basic ' + btoa(this.username+':'+this.password));
         this.options = new RequestOptions({ headers: this.headers });

        return this
            .http
            .post(req.url, req.data, this.options)
            .map((res: Response) => res.json())
    }

}