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

============LICENSE_END============================================ */

import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

export interface ConfirmModel {
    title: string;
    message: string;
}

@Component({
    selector: 'confirm',
    template: `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" (click)="close()">&times;</button>
                    <h6 class="modal-title">{{title || 'Save all changes for current action to APPC database.'}}</h6>
                </div>
                <div class="modal-body">
                    <p>{{message || 'Do you want to save the changes?'}}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" (click)="onCancel()">No</button>
                    <button type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary" (click)="onConfirm()">Yes</button>
                </div>
            </div>
        </div>`
})
export class ConfirmComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
    title: string;
    message: string;

    constructor(dialogService: DialogService) {
        super(dialogService);
    }

    onConfirm() {
        // we set dialog result as true on click on Yes button,
        // then we can get dialog result from caller code
        this.result = true;
        this.close();
    }

    onCancel() {
        // we set dialog result as false on click on Yes button,
        // then we can get dialog result from caller code
        this.result = false;
        this.close();
    }
}