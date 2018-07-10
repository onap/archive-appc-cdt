/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2018 IBM Intellectual Property. All rights reserved.
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



export const appConstants = {
        "errors": {
            "error": "Error",
            "noActionVnfProtocolError": "Select Valid Action, VNF Type, Device Protocol",
            "noActionError": "Select a valid Action",
            "noVnfTypeError": "Select a valid VNF Type",
            "noDeviceProtocolError": "Select a valid Device Protocol",
            "noValidTemplateIdentifierError": "Select a valid Template Identifier"
        },
        "tabs": [
            {
                type: 'dropdown',
                name: 'Reference Data',
                url: 'references',
            }, {
                name: 'Template',
                type: 'dropdown',
                url: 'templates/myTemplates',
            }, {
                name: 'Parameter Definition',
                type: 'dropdown',
                url: 'parameterDefinitions/create'
            }
        ],
        "Actions" : {
            "blank" : '',
            "configure" : "Configure",
            "ConfigModify" : "ConfigModify",
            "configBackup" : "ConfigBackup",
            "configRestore" : "ConfigRestore",
            "getRunningConfig" : "GetRunningConfig",
            "healthCheck" : "HealthCheck",
            "startApplication" : "StartApplication",
            "stopApplication" : "StopApplication",
            "quiesceTraffic" : "QuiesceTraffic",
            "resumeTraffic" : "ResumeTraffic",
            "upgradeBackout" : "UpgradeBackout",
            "upgradeBackup" : "UpgradeBackup",
            "upgradePostCheck" : "UpgradePostCheck",
            "upgradePreCheck" : "UpgradePreCheck",
            "upgradeSoftware" : "UpgradeSoftware",
            "openStackActions" : "OpenStack Actions",
            "configScaleOut" : "ConfigScaleOut"
        },
        "DeviceProtocols" : {
            "blank" : '',
            "ansible" : "ANSIBLE",
            "chef" : "CHEF",
            "netconfXML" : "NETCONF-XML",
            "rest" : "REST",
            "cli" : "CLI",
            "restConf" : "RESTCONF"
        }
};