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


    });
});