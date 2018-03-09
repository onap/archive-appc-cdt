import { DropdownOpen } from './dropdownopen';
import { Dropdown } from './dropdown';
import { ElementRef, Host, HostListener } from '@angular/core';
import { async, TestBed, inject } from '@angular/core/testing';


describe('DropdownOpen', () => {
	let directive;
	let dropdown = new Dropdown(new ElementRef(''));
	// beforeEach(async(() => {
 //        TestBed.configureTestingModule({
 //            declarations: [DropdownOpen],
 //            imports: [Host, HostListener],
 //            providers: []
 //        })
 //            .compileComponents();
 //    }));

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
    		// let spy = spyOn(dropdown, 'isOpened').and.returnValue('');

    		// //directive.openDropdown();

    		// console.log(spy);
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
});