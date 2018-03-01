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

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
    production: false,
    getDesigns: 'https://' + window.location.hostname + ':8443/restconf/operations/design-services:dbservice',
    //getDesigns: "http://localhost:9090/" + "https://mtanjv9apbc51.aic.cip.att.com:8443/restconf/operations/design-services:dbservice",

    //getDesigns:"http://localhost:8443/restconf/operations/design-services:dbservice",
    // validateTemplate:"https://"+window.location.hostname+":8443/restconf/operations/design-services:validator"
    validateTemplate: 'https://' + window.location.hostname + ':8443/restconf/operations/design-services:validator',
    testConfigure: 'https://' + window.location.hostname + ':8443/restconf/operations/appc-provider-lcm:configure'
};
