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

import { Collapse } from './collapse.component';
import { ElementRef } from '@angular/core';


describe('CollapseComponent', () => {
    let directive;

    beforeEach(() => {
        directive = new Collapse();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    describe('should toggle', () => {
        it('should call hide() if isExpanded is true', () => {
            directive.isExpanded = true;

            directive.toggle();
        });

        it('should call show() if isExpanded is false', () => {
            directive.isExpanded = false;

            directive.toggle();
        });

        it('should return proper expand value collapse method', () => {
            directive.isExpanded = true;
            let expandValue = directive.collapse;
            expect(expandValue).toBe(true);
        });
    });
});
