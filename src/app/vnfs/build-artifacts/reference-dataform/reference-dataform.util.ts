/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.
===================================================================
Copyright (C) 2018 IBM.
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

import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import {Observable} from 'rxjs';
import {UtilityService} from '../../../shared/services/utilityService/utility.service';
import { environment } from '../../../../environments/environment';
import { HttpUtilService } from '../../../shared/services/httpUtil/http-util.service';
import {APIService} from "../../../shared/services/cdt.apicall";

@Injectable()
export class ReferenceDataFormUtil {

    private successMessage = 'Retrieved artifact successfully';
    private failureMessage = 'There is no artifact saved in APPC for the selected action!';
    private response: Observable<Object>;

    constructor(private notificationService: NotificationsService, private utilityService:UtilityService, private apiService: APIService) {
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

    // utility to add the slashes to the payload
    appendSlashes(artifactData) {
        return artifactData.replace(/"/g, '\\"');
    }

    public nullCheckForVnfcType(object: any) {
        if (object == undefined || object == 'null' || object == false) {
            return true;
        }

    }

    public nullCheckForVnfcTypeList(object: any) {
        if (object == undefined || object == null || object.length == 0) {
            return true;
        }

    }

    //used for forming the file exension
    decideExtension(obj) {
        //marking the extension based on the device-protocol selected by the user 
        let extension = '.json';
        switch (obj['device-protocol']) {
            case 'ANSIBLE':
            case 'CHEF':
            case 'CLI':
                extension = '.json';
                break;
            case 'NETCONF-XML':
            case 'REST':
                extension = '.xml';
                break;
        }
        return extension;
    }



    createArtifactName(action, vnf, type, extension) {
        if (type)
            return action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + type + '_' + '0.0.1V' + extension;
        else
            return action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V' + extension;
    }

    createArtifactNameForIdentifiers(action, vnf, type, extension)
    {
        return action + '_' + vnf.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '_' + '0.0.1V_' + type + extension;
    }


    createConfigTemplate(config_template_fileName) {
        var template= {
            'artifact-name': 'template_' + config_template_fileName,
            'artifact-type': 'config_template'
        };

        return template;
    }

    createConfigTemplateForPushReplaceData(config_template_fileName) {
        var template= {
            'template_artifact': 'template_' + config_template_fileName,
        };

        return template;
    }

    createPdTemplate(pd_fileName) {
        var pd= {
            'artifact-name': 'pd_' + pd_fileName,
            'artifact-type': 'parameter_definitions'
        };

        return pd;
    }

    createPdTemplateForPushReplaceData(pd_fileName) {
        var pd= {
            'pd_artifact': 'pd_' + pd_fileName,
        };

        return pd;
    }

    createParamValue(param_fileName) {
        var paramValue= {
            'artifact-name': 'param_' + param_fileName,
            'artifact-type': 'param_values'
        };
        return paramValue;
    }

    createParamValueForPushReplaceData(param_fileName) {
        var paramValue= {
            'param_artifact': 'param_' + param_fileName,
        };
        return paramValue;
    }

    handleApiData(data,artifactType)
    {
        this.response = this.apiService.callGetArtifactsApi(data);
        this.response.subscribe(response => {
          this.utilityService.processApiSubscribe(response, this.utilityService.putAction, artifactType)
        },
        error => this.utilityService.processApiError());
    }

}
