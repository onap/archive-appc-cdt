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
        "noValidTemplateIdentifierError": "Select a valid Template Identifier",
        "noAction&VNFTypeInRDscreenError": "Please enter Action and VNF type in Reference Data screen",
        "connectionError": "Error in connecting to APPC Server",
        "multipleFileUploadError" : "Cannot upload multiple files on the entry",
        "notTxtFileError" : "Uploaded file is not a TXT file",
        "notYAMLFileError" : "Uploaded file is not a YAML file"
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
    "Actions": {
        "blank": '',
        "configure": "Configure",
        "ConfigModify": "ConfigModify",
        "configBackup": "ConfigBackup",
        "configRestore": "ConfigRestore",
        "getRunningConfig": "GetRunningConfig",
        "healthCheck": "HealthCheck",
        "startApplication": "StartApplication",
        "stopApplication": "StopApplication",
        "quiesceTraffic": "QuiesceTraffic",
        "resumeTraffic": "ResumeTraffic",
        "distributeTraffic": "DistributeTraffic",
        "distributeTrafficCheck": "DistributeTrafficCheck",
        "upgradeBackout": "UpgradeBackout",
        "upgradeBackup": "UpgradeBackup",
        "upgradePostCheck": "UpgradePostCheck",
        "upgradePreCheck": "UpgradePreCheck",
        "upgradeSoftware": "UpgradeSoftware",
        "openStackActions": "OpenStack Actions",
        "configScaleOut": "ConfigScaleOut",
        "configScaleIn": "ConfigScaleIn"
    },
    "DeviceProtocols": {
        "blank": '',
        "ansible": "ANSIBLE",
        "chef": "CHEF",
        "netconfXML": "NETCONF-XML",
        "rest": "REST",
        "cli": "CLI",
        "restConf": "RESTCONF",
        "openStack": "OpenStack"
    },
    "ruleTypeConfiguaration": {
        'vnf-name': [
            {
                'key-name': 'unique-key-name',
                'key-value': 'parent-name'
            },
            {
                'key-name': 'unique-key-value',
                'key-value': 'vnf'
            },
            {
                'key-name': 'field-key-name',
                'key-value': 'vnf-name'
            }
        ],
        'vm-name-list': [
            {
                'key-name': 'unique-key-name',
                'key-value': 'parent-name'
            },
            {
                'key-name': 'unique-key-value',
                'key-value': 'vserver'
            },
            {
                'key-name': 'field-key-name',
                'key-value': 'vserver-name'
            }
        ],
        'vnfc-name-list': [
            {
                'key-name': 'unique-key-name',
                'key-value': 'parent-name'
            },
            {
                'key-name': 'unique-key-value',
                'key-value': 'vnfc'
            },
            {
                'key-name': 'field-key-name',
                'key-value': 'vnfc-name'
            }
        ],
        'vnf-oam-ipv4-address': [
            {
                'key-name': 'unique-key-name',
                'key-value': 'parent-name'
            },
            {
                'key-name': 'unique-key-value',
                'key-value': 'vnf'
            },
            {
                'key-name': 'field-key-name',
                'key-value': 'ipv4-oam-ipaddress'
            }
        ],
        'vnfc-oam-ipv4-address-list': [
            {
                'key-name': 'unique-key-name',
                'key-value': 'parent-name'
            },
            {
                'key-name': 'unique-key-value',
                'key-value': 'vnfc'
            },
            {
                'key-name': 'field-key-name',
                'key-value': 'ipaddress-v4-oam-vip'
            }
        ]
    },
    "ruleTypeValues": [null, 'vnf-name', 'vm-name-list', 'vnfc-name-list', 'vnf-oam-ipv4-address', 'vnfc-oam-ipv4-address-list'],
    "typeValues": [null, 'ipv4-address', 'ipv6-address', 'ipv4-prefix', 'ipv6-prefix'],
    "responseKeyNameValues": ['', 'unique-key-name', 'unique-key-value', 'field-key-name'],
    "responseKeyValues": ['(none)', 'addressfqdn', 'ipaddress-v4', 'ipaddress-v6'],
    "requestKeyNameValues": [''],
    "requestKeyValues": ['', '(none)'],
    "sourceValues": ['Manual', 'A&AI'],
    "filterByFieldvalues": [null, 'vm-number', 'vnfc-function-code'],
    "requiredValues": [null, true, false],
    "uploadTypes": [{ value: 'External Key File', display: 'KeyFile' },
    { value: 'Pd File', display: 'Pd File' }
    ],
    "optionsToNotificationComponent": {
        timeOut: 1000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 200
    },
    "messages" : {
        "retrievalSuccessMessage" : 'Retrieved artifact successfully',
        "retrievalFailureMessage" : 'There is no artifact saved in APPC for the selected action',
        "saveSuccessMessage" : 'Successfully uploaded the ',
        "saveFailureMessage" : 'Error in saving the ',
        "artifactRetrivalsuccessMessage" : 'Retrieved artifact successfully',
        "artifactRetrivalfailureMessage" : 'There is no artifact saved in APPC for the selected action!',
        "artifactUploadAction" : 'uploadArtifact',
        "artifactgetAction" : 'getArtifact',
        "datafetched" : 'data fetched ',
        "vmDataUploadSuccess" : 'Vm capabilities data uploaded successfully',
        "emptyVmUpload" : 'Empty Vm capabilities file uploaded',
        "incorrectVmUpload" : 'Incorrect VM capabilities file uploaded',
        "artifactSaveError" : 'unable to save the artifact',
        "referenceDataUplaodSuccess" : 'successfully uploaded the Reference Data',
        "referenceDataUplaodFailure" : 'Error while saving Reference Data',
        "incorrectFileFormat" : 'Incorrect file format'
    },
    "errorCode" : {
        "401" : '401',
        "400" : '400'
    },
    "notifications" : {
        "titles" : {
            "information" : 'Information',
            "success" : 'Success',
            "error" : 'Error',
            "status" : 'Status'
        }
    },
    "groupAnotationValue" : {
        "blank" : '',
        "pair" : 'Pair'
    },
    "groupAnotationType" : {
        "blank" : '',
        "firstVnfcName" : 'first-vnfc-name',
        "fixedValue" : 'fixed-value',
        "relativeValue" : 'relative-value',
        "existingGroupName" : 'existing-group-name'
    },
    "deviceTemplates" : {
        "blank" : '',
        "y" : 'Y',
        "n": 'N'
    },
    "sourceTypeColl" : {
        "blank" : '',
        "vnfType" : 'vnfType',
        "vnfcType" : 'vnfcType'
    }
};