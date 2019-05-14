/*
============LICENSE_START==========================================
===================================================================
Copyright (C) 2019 AT&T Intellectual Property. All rights reserved.
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

============LICENSE_END============================================ */
//... deleteOldData.js - to be started by parent server process
const fs = require('fs');

var logger = require('./srvlogger');

var clName= "deleteOldData";
var cdt_home = ".";

  this.thePid= process.pid;
  console.log(clName+": thePid="+this.thePid );

  console.log(clName+
    ": execArgv:["+process.execArgv+"]\n argv:["+process.argv+"]");
  var taskIdArgstr= process.argv[ 2 ];
  var CDT_HOME= process.argv[ 3 ];
  var LOG_DIR= process.argv[ 4 ];
  console.log( clName+": argv: CDT_HOME:["+CDT_HOME+"]" );
  var LogF= LOG_DIR+"/ndserver.log";
  logger.addLog( clName+": start: CDT_HOME:["+CDT_HOME+"]\n",LogF);

  var indT= taskIdArgstr.indexOf('=', 0);
  if( indT < 0 ) {
    this.taskId= taskIdArgstr;
  } else {
    this.taskId= taskIdArgstr.substr( indT+1 );
  }
  console.log(clName+": taskId:["+this.taskId+"]\n");
  logger.addLog( clName+": taskId:["+this.taskId+"]\n",LogF);
  if(  this.taskId == null || this.taskId == undefined || this.taskId.length < 1 )
  {
    var errMsg= clName+": Error: taskId is empty !\n";
    console.log( errMsg );
    throw new Error( errMsg );
  };
  var inpFilePfx= CDT_HOME+"/posted_data_";
  var outFilePfx= CDT_HOME+"/sync_template_res_";
  var parmFilePfx= CDT_HOME+"/template_params_";
  var pstatfNamePfx= CDT_HOME+"/proc_status_";

  let timeStamp = new Date().toISOString();
 // console.log(clName+": timeStamp:["+timeStamp+"]\n");
  logger.addLog( clName+": timeStamp:["+timeStamp+"]\n",LogF);

  var inpFile= inpFilePfx +this.taskId +".txt";
 // console.log(clName+": deleting inpFile:\n"+inpFile );
  logger.addLog( clName+": deleting inpFile:\n"+inpFile+"\n",LogF);

  fs.unlink( inpFile, (err) => {
    if( err) {
      console.log(clName+
        ": Error while deleting "+inpFile+"\n "+err.message+"]\n");
    }
  });

  timeStamp = new Date().toISOString();
  console.log(clName+": timeStamp:["+timeStamp+"]\n");

  var pstatfName= pstatfNamePfx +this.taskId+".json";
  console.log(clName+": deleting proc.status File:\n"+pstatfName );

  fs.unlink( pstatfName, (err) => {
    if( err) {
      console.log(clName+
        ": Error while deleting "+pstatfName+"\n "+err.message+"]\n");
    }
  });

  timeStamp = new Date().toISOString();
  console.log(clName+": timeStamp:["+timeStamp+"]\n");

  var outFile= outFilePfx+ this.taskId+".txt";
  console.log(clName+": deleting proc.result File:\n"+outFile );

  fs.unlink( outFile, (err) => {
    if( err) {
      console.log(clName+
        ": Error while deleting "+outFile+"\n "+err.message+"]\n");
    }
  });

  timeStamp = new Date().toISOString();
  console.log(clName+": timeStamp:["+timeStamp+"]\n");

  var parmFile= parmFilePfx+ this.taskId+".txt";
  console.log(clName+": deleting parameters File:\n"+parmFile+"]\n");

  fs.unlink( parmFile, (err) => {
    if( err) {
      console.log(clName+
        ": Error while deleting "+parmFile+"\n "+err.message+"]\n");
    }
  });

  timeStamp = new Date().toISOString();
  console.log(clName+": timeStamp:["+timeStamp+"]\n");

  console.log(clName+": finish.");
