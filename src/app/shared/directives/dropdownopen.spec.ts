/*
============LICENSE_START==========================================
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

import { DropdownOpen } from './dropdownopen';
import { Dropdown } from './dropdown';
import { ElementRef, Host, HostListener } from '@angular/core';
import { async, TestBed, inject } from '@angular/core/testing';


describe('DropdownOpen', () => {
    let directive;
    let dropdown = new Dropdown(new ElementRef(''));

    beforeEach(() => {
        directive = new DropdownOpen(dropdown, new ElementRef(''));
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    describe('should validate on Host click event', () => {
        it('should validate openDropdown method if activateOnFocus, openedByFocus are true', () => {
            let event = new Event('click');
            let dispatchEvent = window.dispatchEvent(event);
            dropdown.activateOnFocus = true;
            directive.openedByFocus = true;

            directive.openDropdown();
        });

        it('should validate openDropdown method if dropdown.isOpened(), dropdown.toggleClick false', () => {
    });
    });

    it('should validate on Host keydown event', () => {
        let spy = spyOn(directive, 'openDropdown')
        var event = new KeyboardEvent("keydown");

        Object.defineProperty(event, "keyCode", {"value" : 40})

        directive.dropdownKeydown(event);
        
        expect(spy).toHaveBeenCalled()
    });

    it('should validate on Host focus event', () => {
        
        dropdown.activateOnFocus  = false;

        directive.onFocus();

    });

    it('should test toggle function to call close function', ()=>{
       spyOn(Dropdown.prototype, 'isOpened').and.returnValue(true);
       let spy = spyOn(directive, 'close');
       directive.toggle();
       expect(spy).toHaveBeenCalled();

    });

    it('should test toggle function to call open function', ()=>{
        spyOn(Dropdown.prototype, 'isOpened').and.returnValue(false);
        let spy = spyOn(directive, 'open');
        directive.toggle();
        expect(spy).toHaveBeenCalled();
 
     });
});