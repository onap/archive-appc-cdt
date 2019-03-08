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


import {Injectable} from '@angular/core';

@Injectable()
export class ParamShareService {

    public sharedData: { [index: string]: string; } = {};

    //Stubbing Name-Value pairs for templateData->will come from Template Generation Component/Editor
    public templateData: {};
    public displayData: {};
    public paramData = [];
    public ansibleServerData : {};



    setData(data) {
        this.sharedData = data;
    }

    getData() {
        return this.sharedData;
    }

    setTemplateData1() {
        /* Stubbing **/
        var paramData = [
            {paramName: 'A-IP', paramValue: '234'},
            {paramName: 'B-IP', paramValue: '10.168.15.15'},
            {paramName: 'C-IP', paramValue: '100.168.150.15'},
            {paramName: 'D-IP', paramValue: '900.168.150.15'},
            {paramName: 'hostIP', paramValue: '200.168.150.15'},
            {paramName: 'hostnameIP', paramValue: '300.168.150.15'},
            {paramName: 'R-IP', paramValue: '400.168.150.15'},
            {paramName: 'someIP', paramValue: '500.168.150.15'}

        ];
        this.templateData = paramData;
    }

    setTemplateData(data) {
        this.templateData = data;
    }

    getTemplateData() {
        return (this.templateData);
    }

    setDisplayData(data: any[]) {
        this.displayData = data.slice(0);
    }

    getDisplayData() {
        return this.displayData;
    }

    setSessionParamData(data) {
        this.paramData = data;
    }

    getSessionParamData() {
        return this.paramData;
    }
}
