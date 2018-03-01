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
import * as _ from 'underscore';

@Pipe({name: 'tableFilter'})
export class TableFilterPipe implements PipeTransform {

    transform(array: any[], query: string, filetrColumns: Array<String>): any {
        if (query) {
            return _.filter(array, (row: Object) => this.filterRows(filetrColumns, row, query));
        }
        return array;
    }

    filterRows(columsn, row, query) {
        let temp: Array<boolean> = [];
        for (let x = 0; x < columsn.length; x++) {
            if ((row[columsn[x]]) != null && query != null) {
                temp.push((row[columsn[x]].toLowerCase().indexOf(query.toLowerCase()) > -1));
            }
        }

        return _.reduce(temp, function (memoizer, value) {

            return (memoizer || value);
        }, false);

    }

}
