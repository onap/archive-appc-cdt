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


import {Directive, ElementRef, Host, HostListener, OnDestroy} from '@angular/core';
import {Dropdown} from './dropdown';

@Directive({
    selector: '[dropdown-open]',
    exportAs: 'dropdownOpen'
})
export class DropdownOpen implements OnDestroy {

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    /**
     * This hack is needed for dropdown not to open and instantly closed
     */
    private openedByFocus: boolean = false;

    private closeDropdownOnOutsideClick: (event: Event) => void;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(@Host() public dropdown: Dropdown,
                private elementRef: ElementRef) {
        const _this = this;
        this.closeDropdownOnOutsideClick = function closeDropdownOnOutsideClick(event: MouseEvent) {
            _this.closeIfInClosableZone(event);
        };
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    toggle() {
        if (this.dropdown.isOpened()) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.dropdown.isOpened())
            return;

        this.dropdown.open();
        document.addEventListener('click', this.closeDropdownOnOutsideClick, true);
    }

    close() {
        if (!this.dropdown.isOpened())
            return;

        this.dropdown.close();
        document.removeEventListener('click', this.closeDropdownOnOutsideClick, true);
    }

    @HostListener('click')
    openDropdown() {
        if (this.dropdown.activateOnFocus && this.openedByFocus) {
            this.openedByFocus = false;
            return;
        }

        if (this.dropdown.isOpened() && this.dropdown.toggleClick) {
            this.close();
        } else {
            this.open();
        }
    }

    @HostListener('keydown', ['$event'])
    dropdownKeydown(event: KeyboardEvent) {
        if (event.keyCode === 40) { // down
            this.openDropdown();
        }
    }

    @HostListener('focus')
    onFocus() {
        if (!this.dropdown.activateOnFocus) return;
        this.openedByFocus = true;
        this.dropdown.open();
        document.addEventListener('click', this.closeDropdownOnOutsideClick, true);
    }

    @HostListener('blur', ['$event'])
    onBlur(event: FocusEvent) {
        if (!this.dropdown.activateOnFocus) return;
        if (event.relatedTarget &&
            !this.dropdown.isInClosableZone(<HTMLElement> event.relatedTarget) &&
            event.relatedTarget !== this.elementRef.nativeElement) {

            this.dropdown.close();
            document.removeEventListener('click', this.closeDropdownOnOutsideClick, true);
        }
    }

    // -------------------------------------------------------------------------
    // Lifecycle Methods
    // -------------------------------------------------------------------------

    ngOnDestroy() {
        document.removeEventListener('click', this.closeDropdownOnOutsideClick, true);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private closeIfInClosableZone(event: Event) {
        if (!this.dropdown.isInClosableZone(<HTMLElement> event.target)
            && event.target !== this.elementRef.nativeElement
            && !this.elementRef.nativeElement.contains(event.target)) {
            this.dropdown.close();
            document.removeEventListener('click', this.closeDropdownOnOutsideClick, true);
        }
    }

}