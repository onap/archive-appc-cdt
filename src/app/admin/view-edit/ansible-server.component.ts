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

import * as XLSX from 'xlsx';
import * as _ from 'underscore';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UtilityService } from '../../shared/services/utilityService/utility.service';

// Common Confirm Modal
import { DialogService } from 'ng2-bootstrap-modal';
import { ParamShareService } from '../../shared/services/paramShare.service';


declare var $: any;
type AOA = Array<Array<any>>;

@Component({
    selector: 'ansible-server',
    templateUrl: './ansible-server.component.html',
    styleUrls: ['./ansible-server.component.css'],
})
export class AnsibleServerComponent implements OnInit {
  
    //settings for the notifications.
    options = {
        timeOut: 4500,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    };
   
    public ownerIdErrMsg;
    public regionIdErrMsg;
    public tenantIdErrMsg
    public zeroTenantIdsErrorMsg;
    public porterrorMessage;
    public portwarningMessage;
    public errorMessage;
    public warningMessage;
    public invalid = true;
    public portinvalid = true;
    public item;
    public sample = {ownerid:"", regionid:"", tenantid:""};
    public updateIndex;
    public currentUser;
    constructor(
        private paramShareService: ParamShareService, 
        private router: Router, 
        private activeROute: ActivatedRoute,
        private utilService: UtilityService
        
      )
    {
      console.log("testing....");
    }

ngOnInit() {
    this.currentUser = localStorage['userId'];
    this.item = JSON.parse(sessionStorage.getItem("ansibleserver"));
    this.updateIndex = parseInt(sessionStorage.getItem("updateIndex"));
    console.log("index===>"+this.updateIndex);
    if(!this.paramShareService.ansibleServerData) {
        this.invalid = true;
    } else {
        this.invalid = false;
    }
    console.log("selecteditem===>"+JSON.stringify(this.item));
}

addInfo() {
    console.log("selectediteminfo===>"+JSON.stringify(this.item.info));
    if(this.validateTenantId()) {
        this.item.info.push(this.sample)
        this.sample = {ownerid:"", regionid:"", tenantid:""};
        this.zeroTenantIdsErrorMsg = "";
    }

}

removeInfo(index) {
    console.log("selectediteminfo===>"+index+JSON.stringify(this.item.info));
    this.item.info.splice(index, 1);
    console.log("selectediteminfo===>"+JSON.stringify(this.item.info));
    
}

// save() {
//     console.log("ansibleServerData===>"+ JSON.stringify(this.paramShareService.ansibleServerData))
//     let ansibleServer = this.createAnsibleserverData(this.item);
//     this.paramShareService.ansibleServerData["fqdn-list"].push(ansibleServer);
//      this.router.navigate(['../admin'], {
//                 relativeTo: this.activeROute
//             });
// }

update() {
    console.log("ansibleServerData===>"+ JSON.stringify(this.paramShareService.ansibleServerData))
    
        
        let ansibleServer = this.createAnsibleserverData(this.item);
        //need to revisit to initialize paramShareService.ansibleServerData
        if(!this.paramShareService.ansibleServerData) {
            this.paramShareService.ansibleServerData = {"fqdn-list" : []};
        }
        if(this.updateIndex != this.paramShareService.ansibleServerData["fqdn-list"].length) {
            ansibleServer["modify-username"] = this.currentUser;
            ansibleServer["modify-date"] = this.utilService.getDate();
            console.log("update........")
        }
        this.paramShareService.ansibleServerData["fqdn-list"][this.updateIndex] = ansibleServer;
        this.router.navigate(['../admin'], {
                relativeTo: this.activeROute
            });
    
    
}

cancel() {
    sessionStorage.removeItem("ansibleserver");
     this.router.navigate(['../admin'], {
                relativeTo: this.activeROute
            });
}

createAnsibleserverData(displayAnsibleServer){
    let cloudOwnerList = this.createCloudOwnerList(displayAnsibleServer);
    let anisble = { 
        "vnf-management-server-fqdn": displayAnsibleServer.server+":"+displayAnsibleServer.port,
        "cloud-owner-list":cloudOwnerList,
                    "description":displayAnsibleServer.descr,
                    "username":displayAnsibleServer.creator,
                    "create-date":displayAnsibleServer['created-date'],
                    "modify-username":displayAnsibleServer.modifier,
                    "modify-date":displayAnsibleServer['modified-date']
    };
    return anisble;

}

createCloudOwnerList(displayAnsibleServer) {
        let cloudOwnerList = [];

        //prepare unique cloud-owner
        for(let i=0; i<displayAnsibleServer.info.length; i++) {
            let info = displayAnsibleServer.info[i];
            let cloudOwner = {};
            cloudOwner["cloud-owner"] = info.ownerid;
            let exist = false;
            cloudOwnerList.forEach(element => {
                if(element["cloud-owner"] == info.ownerid) {
                    exist = true;
                    
                }
            });
            if(!exist){
                cloudOwnerList.push(cloudOwner);
            }
            
        }
        console.log("cloudOwnerList===>"+JSON.stringify(cloudOwnerList));

        //prepare region id
        cloudOwnerList.forEach(cloudOwner => {
            let regionIdList = [];
            for(let i=0; i<displayAnsibleServer.info.length; i++) {
                let info = displayAnsibleServer.info[i];
                if(cloudOwner["cloud-owner"] == info.ownerid) {
                    let exist = false;
                    regionIdList.forEach(element => {
                        if(element["region-id"] == info.regionid) {
                            exist = true;
                        }
                    });
                    if(!exist){
                        regionIdList.push({"region-id":info.regionid});
                    }
                }
                
        }
         cloudOwner["region-id-list"] = regionIdList;
        });
        
         console.log("cloudOwnerList===>"+JSON.stringify(cloudOwnerList));

         //prepare tenant id
        cloudOwnerList.forEach(cloudOwner => {
            cloudOwner["region-id-list"].forEach(regionid => {
            let teanantIdList = [];
            for(let i=0; i<displayAnsibleServer.info.length; i++) {
                let info = displayAnsibleServer.info[i];
                if(cloudOwner["cloud-owner"] == info.ownerid && regionid["region-id"] == info.regionid) {
                    let exist = false;
                    teanantIdList.forEach(element => {
                        if(element == info.tenantid) {
                            exist = true;
                        }
                    });
                    if(!exist){
                        teanantIdList.push(info.tenantid);
                    }
                }
                
        }
         regionid["tenant-id-list"] = teanantIdList;
         });
        });
        console.log("cloudOwnerList===>"+JSON.stringify(cloudOwnerList));
        return cloudOwnerList;
    }
    
    //validating the fdqn url
    validateFdqn(fdqn) {
        if (fdqn.trim().length < 1) {
            this.errorMessage = 'Please enter Configuration Server FQDN';
            this.warningMessage = '';
            this.invalid = true;
        } else if (fdqn.startsWith(' ') || fdqn.endsWith(' ')) {
            this.errorMessage = 'Leading and trailing spaces are not allowed';
            this.warningMessage = '';
            this.invalid = true;
        } else if (!(fdqn.startsWith('http') || fdqn.endsWith('https'))) {
            this.warningMessage = 'FDQN can start with eighther http or https protocol';
            this.errorMessage = '';
            this.invalid = false;
            
        // } else if (name.includes('  ')) {
        //     this.errorMessage = 'More than one space is not allowed in VNFC Type';
        //     this.invalid = true;
        // } else if (name.length > 50) {
        //     this.errorMessage = 'VNFC Type should be of minimum one character and maximum 50 character';
        //     this.invalid = true;
        //
     } else {
            this.invalid = false;
            this.errorMessage = '';
            this.warningMessage = '';
        }
    }

    //validating the port
    validatePort(port) {
        if (port.trim().length < 1) {
            this.porterrorMessage = 'Please enter port';
            this.portwarningMessage = '';
            this.invalid = true;
        } else if (port.startsWith(' ') || port.endsWith(' ')) {
            this.porterrorMessage = 'Leading and trailing spaces are not allowed';
            this.portwarningMessage = '';
            this.invalid = true;
            
        } else if (isNaN(port)) {
            this.portwarningMessage = '';
            this.porterrorMessage = 'Port should be a number';
            this.invalid = true;
            port = parseInt(port);
        } else if (!(0 <= port && port <= 65535 )) {
            this.portwarningMessage = 'Port should be a number in range of 0 to 65535';
            this.porterrorMessage = '';
            this.invalid = false;
        } else {
            this.invalid = false;
            this.porterrorMessage = '';
            this.portwarningMessage = '';
        }
    }

    validate() {
        this.validateFdqn(this.item.server);
        this.validatePort(this.item.port);
        if(this.item.info.length <= 0) {
            this.zeroTenantIdsErrorMsg = "Please add atleast one Tenant ID.";
            this.invalid = true;
        }
        if(!this.invalid) {
            this.update();
        }
    }

    validateTenantId(){
        let valid = true;
        if(this.sample.ownerid.trim().length == 0) {
            this.ownerIdErrMsg = "Enter OwnerID";
            valid = false;
        } else {
            this.ownerIdErrMsg = "";
        }
        if(this.sample.regionid.trim().length == 0) {
            this.regionIdErrMsg = "Enter RegionID";
            valid = false;
        } else {
            this.regionIdErrMsg = "";
        }
        if(this.sample.tenantid.trim().length == 0) {
            this.tenantIdErrMsg = "Enter TenantID";
            valid = false;
        } else {
            this.tenantIdErrMsg = "";
        }
        return valid;
    }


}
