/* 
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 AT&T Intellectual Property. All rights reserved.

Modifications Copyright (C) 2019 IBM
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
============LICENSE_END============================================ */
import {VmFilteringPipe} from './vm-filtering.pipe';

describe('VmFilteringPipe', () => {
    it('create an instance', () => {
        const pipe = new VmFilteringPipe();
        expect(pipe).toBeTruthy();
    });
    it('should return configscaleout values if template id matches',()=>{
        const pipe = new VmFilteringPipe();

        let objArray = [
            {action:"Configure","template-id":2,"type":"con"},
            {action:"ConfigScaleout","template-id":1,"type":"conScale"}
        ]
        expect(pipe.transform(objArray,"ConfigScaleOut",1, {})[0].type,).toBe("conScale")

    });
    it('should return configure calues',()=>{
        const pipe = new VmFilteringPipe();

        let objArray = [
            {action:"Configure","template-id":2,"type":"con"},
            {action:"ConfigScaleout","template-id":1,"type":"conScale"}
        ]
        expect(pipe.transform(objArray,"Config",2, {})[0].type).toBe("con")

    });
});
