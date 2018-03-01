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
import {NotificationsService} from 'angular2-notifications';

@Injectable()
export class UtilityService {

    private successMessage = 'Retrieved artifact successfully';
    private failureMessage = 'There is no artifact saved in APPC for the selected action!';

    constructor(private notificationService: NotificationsService) {
    }

    randomId() {
        let x = (new Date().getUTCMilliseconds()) * Math.random();
        return (x + '').substr(4, 12);


    }

    appendSlashes(artifactData) {
        return artifactData.replace(/"/g, '\\"');
    }

    checkResult(result: any) {

        if (result.output.status.code == '401') {
            this.notificationService.info('Information', this.failureMessage);
            return false;
        }
        else if (result.output.status.code == '400') {
            this.notificationService.success('Success', this.successMessage);
            return true;
        }

    }


}
