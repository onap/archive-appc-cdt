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

============LICENSE_END============================================ */

import {Component} from '@angular/core';
import {DialogComponent, DialogService} from 'ng2-bootstrap-modal';

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
                    <h4 class="modal-title">Confirm</h4>
                </div>
                <div class="modal-body">
                    <p>Change Actions Without Saving?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" (click)="confirm()">Yes</button>
                    <button type="button" class="btn btn-default" (click)="close()">Cancel</button>
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

    confirm() {
        // we set dialog result as true on click on confirm button,
        // then we can get dialog result from caller code
        this.result = true;
        this.close();
    }
}