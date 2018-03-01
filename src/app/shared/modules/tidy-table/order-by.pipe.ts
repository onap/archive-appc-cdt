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


import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderBy'})
export class OrderBy implements PipeTransform {

    transform(array, orderBy, asc = true) {

        if (!orderBy || orderBy.trim() == '') {
            return array;
        }

        //ascending
        if (asc) {
            return Array
                .from(array)
                .sort((item1: any, item2: any) => {
                    return this.orderByComparator(item1[orderBy], item2[orderBy]);
                });
        } else {
            //not asc
            return Array
                .from(array)
                .sort((item1: any, item2: any) => {
                    return this.orderByComparator(item2[orderBy], item1[orderBy]);
                });
        }

    }

    orderByComparator(a: any, b: any): number {
        if (a != undefined && b != undefined) {
            if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
                // Isn't a number so lowercase the string to properly compare
                if (a.toLowerCase() < b.toLowerCase())
                    return -1;
                if (a.toLowerCase() > b.toLowerCase())
                    return 1;
            }
            else {
                //Parse strings as numbers to compare properly
                if (parseFloat(a) < parseFloat(b))
                    return -1;
                if (parseFloat(a) > parseFloat(b))
                    return 1;
            }
        } else {
            if (a == undefined) {
                return -1;
            } else {
                return 1;
            }
        }


        return 0; //equal each other
    }
}