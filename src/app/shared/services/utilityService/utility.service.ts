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

ECOMP is a trademark and service mark of AT&T Intellectual Property.
============LICENSE_END============================================
*/


import {Injectable} from '@angular/core';
import {NotificationsService} from 'angular2-notifications';
import { saveAs } from 'file-saver';
import { appConstants } from '../../../../constants/app-constants';

@Injectable()
export class UtilityService {
    clName= "UtilityService";
    public putAction = appConstants.messages.artifactUploadAction;
    public getAction = appConstants.messages.artifactgetAction;
    private retrievalSuccessMessage = appConstants.messages.retrievalSuccessMessage;
    private retrievalFailureMessage = appConstants.messages.retrievalFailureMessage;
    private saveSuccessMessage = appConstants.messages.saveSuccessMessage;
    private saveFailureMessage = appConstants.messages.saveFailureMessage;
    public connectionErrorMessage = appConstants.errors.connectionError;
    
    private successMessage = appConstants.messages.artifactRetrivalsuccessMessage;
    private failureMessage = appConstants.messages.artifactRetrivalfailureMessage;

    constructor(private notificationService: NotificationsService) {
    }

    public setTracelvl( tlvl: number ) {
     // console.log( this.clName+": setTracelvl: arg="+tlvl );
      let tracelvl= tlvl;
      if( tracelvl == null || tracelvl == undefined ) tracelvl= 0;
      localStorage["Tracelvl"]= tracelvl;
    }

    public getTracelvl() : number {
      let tracelvl= localStorage["Tracelvl"];
     // console.log( this.clName+": getTracelvl: locS: tracelvl="+tracelvl );
      if( tracelvl == null || tracelvl == undefined ) {
        tracelvl=0; localStorage["Tracelvl"]= tracelvl;
      };
     // console.log( this.clName+": getTracelvl: tracelvl="+tracelvl );
      return tracelvl;
    };

    public randomId() {
        let x = (new Date().getUTCMilliseconds()) * Math.random();
        return (x + '').substr(4, 12);


    }

    public appendSlashes(artifactData) {
        return artifactData.replace(/"/g, '\\"');
    }

    public checkResult(result: any) {

        if (result.output.status.code == appConstants.errorCode["401"]) {
            this.notificationService.info(appConstants.notifications.titles.information, this.failureMessage);
            return false;
        }
        else if (result.output.status.code == appConstants.errorCode["400"]) {
            this.notificationService.success(appConstants.notifications.titles.success, this.successMessage);
            return true;
        }

    }

    public processApiSubscribe(result: any, action, artifactType) {

        if (result.output.status.code == appConstants.errorCode["401"] && action == this.getAction) {
            this.notificationService.info(appConstants.notifications.titles.information, this.retrievalFailureMessage);
        }
        else if (result.output.status.code == appConstants.errorCode["400"] && action == this.getAction) {
            this.notificationService.success(appConstants.notifications.titles.success, this.retrievalSuccessMessage);
        }
        if (result.output.status.code == appConstants.errorCode["401"] && action == this.putAction) {
            this.notificationService.warn(appConstants.notifications.titles.error, this.saveFailureMessage + artifactType);
        }
        else if (result.output.status.code == appConstants.errorCode["400"] && action == this.putAction) {
            this.notificationService.success(appConstants.notifications.titles.success, this.saveSuccessMessage + artifactType);
        }

    }

    public processApiError()
    {
        this.notificationService.error(appConstants.notifications.titles.error, this.connectionErrorMessage);
    }


    public checkNotNull(object:any)
    {

        if (object != undefined || object != null)
          {
              if(object.length > 0)
              return true;
              else return false;
          }    
          else return false;
    }

    public createPayLoadForSave(artifactType,vnfType,action,fileName, versionNo, artifactContent)
    {
        let userId=localStorage['userId'];
        let apiToken=localStorage['apiToken']
        let newPayload:any;
        switch(artifactType)
        {
        case "reference_data": 
        //newPayload='{"userID": "' + userId + '","vnf-type" : "' + vnfType + '","action: "'+action+'","artifact-name" : "' + fileName.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '","artifact-type" : "APPC-CONFIG","artifact-version" : "0.1","artifact-contents" :" ' + artifactContent + '"}';
        newPayload='{"userID": "' + userId + '","vnf-type" : "' + vnfType + '","action" : "AllAction","artifact-name" : "' + fileName.replace(/ /g, '').replace(new RegExp('/', 'g'), '_').replace(/ /g, '') + '","artifact-type" : "APPC-CONFIG","artifact-version" : "0.1","artifact-contents" :" ' + artifactContent + '"}';
        break;
        case "template_data": 
        newPayload= JSON.stringify({
            "userID": userId,
            "vnf-type": vnfType,
            "action": action,
            "artifact-name": fileName,
            "artifact-type": "APPC-CONFIG",
            "artifact-version": versionNo,
            "artifact-contents": artifactContent.replace(/\(([^()]|(R))*\)=\(/g, '').replace(/\)}/g, '}')
        }); 
        break;
        case "param_data": 
        newPayload=JSON.stringify({
            "userID": userId,
            "vnf-type": vnfType,
            "action": action,
            "artifact-name": fileName,
            "artifact-type": "APPC-CONFIG",
            "artifact-version": versionNo,
            "artifact-contents": artifactContent
          }); 
        break;
        case "pd_data": 
        newPayload='{"userID": "' + userId + '","vnf-type" : "' + vnfType + '","action" : "' + action + '","artifact-name" : "' + fileName + '","artifact-type" : "APPC-CONFIG","artifact-version" :"'+versionNo+'","artifact-contents" : ' + artifactContent + '}';
        break;
          default : newPayload={};
        }

        let data =
          {
            "input": {
              "design-request": {
                "request-id": apiToken,
                "action": "uploadArtifact",
                "payload": newPayload

              }
            }
          }
          return data;
    }

    public createPayloadForRetrieve(isReference:boolean,action,vnfType,fileName)
    {
        let payload:any;
        if(isReference) {
            payload=JSON.parse(sessionStorage.getItem('updateParams'));
            payload['userID'] = localStorage['userId'];
            payload = JSON.stringify(payload);
        }
        else payload = '{"userID": "' + localStorage['userId'] + '","action": "' + action + '", "vnf-type" : "' + vnfType + '", "artifact-type":"APPC-CONFIG", "artifact-name":"' + fileName + '"}';
        let data = {
                'input': {
                    'design-request': {
                        'request-id': localStorage['apiToken'],
                        'action': 'getArtifact',
                        'payload': payload
                    }
                }
            };
        return data;    
    }

    public downloadArtifactToPc(data,extension, fileName, delay)
    {
        var blob = new Blob([data], {
                type: 'text/'+extension
            });
        setTimeout(() => {
            saveAs(blob, fileName);
        }, delay)
    }

}
