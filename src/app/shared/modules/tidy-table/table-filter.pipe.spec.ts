/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

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


/* tslint:disable:no-unused-variable */

import {TableFilterPipe} from './table-filter.pipe';

describe('TableFilterPipe', () => {
    it('create an instance', () => {
        const pipe = new TableFilterPipe();
        expect(pipe).toBeTruthy();
    });
    it('filter table based on input ', () => {
        const pipe = new TableFilterPipe();

        let data =[
            {'vnf-type':'vnf1','vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        let filter = ['vnf-type', 'vnfc-type', 'artifact-name'];
        expect(pipe.transform(data,'vnf1',filter).length).toBe(1);
    });

    it('should return entire array when no query is passed..', () => {
        const pipe = new TableFilterPipe();

        let data =[
            {'vnf-type':'vnf1','vnfc-type':'vnfc1','artifact-name':'artf1'},
            {'vnf-type':'vnf2','vnfc-type':'vnfc2','artifact-name':'artf2'}
          
        ]
        let filter = ['vnf-type', 'vnfc-type', 'artifact-name'];
        expect(pipe.transform(data, null, filter).length).toBe(2);
    });
});
