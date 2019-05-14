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
//.. processing on server side
'use strict';

const fs = require('fs');
//var spawn = require("child_process").spawn;
var Chproc = require("child_process");
var logger = require('./srvlogger');

var clName= "ServerDataSvc";
//const DIST_FLDR = join(process.cwd(), 'dist');
//var DIST_FLDR = "dist";
var cdt_home = ".";
var LOG_DIR = "/tmp";
var LogF = "ndserver.log";
var SubProcScript= "/app/subnproc.js";
//var HTML_ROOT_FLDR= DIST_FLDR;
//var DelScript= DIST_FLDR +"/app/deleteOldData.js";
//var inputFilePfx = DIST_FLDR +"/posted_data_";
var fsAvSpaceKB= -1;
var rsfname= "";
var remAddr= ""; //.. remote client address
var taskId= "";
var fdI;
var fdRsf;
var fDelim= "&";

  //.. to be called by server at initialization
exports.setHomeDir = function( homeDir, logDir ) {
  this.cdt_home= homeDir;
  this.LOG_DIR= logDir;
  // this.DIST_FLDR= this.cdt_home+"/dist";
  this.LogF= this.LOG_DIR+"/ndserver.log";
  console.log( clName+": setHomeDir: cdt_home:["+this.cdt_home+"]");
  console.log( clName+": setHomeDir: LogF:["+this.LogF+"]");
};

  //.. to be called by server on receiving GET /getUserRole request
  //   (simulation only)
exports.getUserRoles = function( requrl ) {
  var methName= "getUserRoles";
    logger.addLog( clName+": "+methName+
      ": start: url:["+ requrl+"]\n cdt_home:["+this.cdt_home+"]\n",this.LogF);
  let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
  var resp= '{\"respStr\":\"notfoundResp\"}';
    this.urolfname= this.cdt_home+"/userRoles.json";
    resp= this.readResultFile( this.urolfname );
    logger.addLog( clName+": "+methName+
      ": result length="+resp.length+"\n",this.LogF);
  return resp;
};

  //.. to be called by server on receiving GET /api/* request
exports.getData = function( requrl ) {
  var methName= "getData";
  //console.log(clName+": getData: start: url:["+ requrl+"]\n cdt_home:["+
  //  this.cdt_home+"]");
    logger.addLog( clName+": "+methName+
      ": start: url:["+ requrl+"]\n cdt_home:["+this.cdt_home+"]\n",this.LogF);
  let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
  var resp= '{\"respStr\":\"notfoundResp\"}';
  var taskStr= "taskId=";
  //... Regular Expressions for different requests ...
  //.. to get processing result
  var rexpGRESUL= new RegExp(/\/api\/get_result/);
  //.. to get progress percentage of the processing
  var rexpGPROGR= new RegExp(/\/api\/get_progress/);
  //.. to get parameters calculated via the processing
  var rexpGPRMS= new RegExp(/\/api\/get_params/);
  //.. to get parameters format-error file
  var rexpPFMTERR= new RegExp(/\/api\/get_pfmterr/);
  //.. to get Available space in server-side file-system
  var rexpGFSAVSP= new RegExp(/\/api\/get_fsAvSpace/);
  //.. to check for ACE-editor resource files
  var rexpACERES= new RegExp(/\/node_modules\/ace-builds\/src-min/);
  //
  //... checking which url is matching ...
  if( requrl == '/' ) {
   // console.log(clName+": getData: this is a ROOT request ...");
    logger.addLog( clName+": getData: this is a ROOT request ...\n",this.LogF);
    return this.getRoot();
  };
  //.. non-root, api url
  var match1= null;
  if( (match1= rexpGRESUL.exec(requrl)) != null ) {
    logger.addLog( clName+": "+methName+": URL match /api/get_result\n",this.LogF);
    //.. assuming: /api/get_result?taskId=f7be82e43e34cb4e960b45d35e8d9596
    var indT= requrl.indexOf( taskStr, 0);
    if( indT < 0 ) {
      var errMsg=
          clName+": "+methName+": Error: No taskId found in the URL !\n";
        logger.addLog( errMsg,this.LogF);
        resp= '{\"Error\":\"'+errMsg+'\"}';
    }
    else { //.. indT > -1 - have taskId in URL
      this.taskId= requrl.substr( indT+ taskStr.length );
        logger.addLog( clName+": "+methName+
          ": extracted from URL: taskId:["+this.taskId+"]\n",this.LogF);
        this.rsfname= this.cdt_home+"/sync_template_res_"+this.taskId+".txt";
        resp= this.readResultFile( this.rsfname );
        logger.addLog( clName+": "+methName+
          ": result length="+resp.length+"\n",this.LogF);
        logger.addLog( clName+": "+methName+
          ": got result -Start data cleanup...\n",this.LogF);
      this.deleteOldFiles( this.taskId );
    };
  }
  else
  if( (match1= rexpGPROGR.exec(requrl)) != null ) {
    logger.addLog( clName+": "+methName+
      ": URL match /api/get_progress\n",this.LogF);
    //.. assuming: /api/get_progress?taskId=f7be82e43e34cb4e960b45d35e8d9596
    var indT= requrl.indexOf( taskStr, 0);
    if( indT < 0 ) {
      var errMsg=
        clName+": "+methName+": Error: No taskId found in the URL !\n";
      logger.addLog( errMsg,this.LogF);
      resp= '{\"Error\":\"'+errMsg+'\"}';
    }
    else { //.. indT > -1 - have taskId in URL
      this.taskId= requrl.substr( indT+ taskStr.length );
      logger.addLog( clName+": "+methName+
        ": extracted from URL: taskId:["+this.taskId+"]\n",this.LogF);
      this.pgfname= this.cdt_home+"/proc_status_"+this.taskId+".json";
     // resp= '{\"percentage\":\"3\"}';
      resp= this.readResultFile( this.pgfname );
    }
    logger.addLog( clName+": "+methName+
      ": result length="+resp.length+"\n",this.LogF);
    logger.addLog( clName+": "+methName+": progress:["+resp+"]\n",this.LogF);
  }
  else
  if( (match1= rexpGPRMS.exec(requrl)) != null ) {
    logger.addLog( clName+": "+methName+
      ": URL match /api/get_params\n",this.LogF);
    //.. assuming: /api/get_params?taskId=f7be82e43e34cb4e960b45d35e8d9596
    var indT= requrl.indexOf( taskStr, 0);
    if( indT < 0 ) {
      var errMsg=
        clName+": "+methName+": Error: No taskId found in the URL !\n";
      logger.addLog( errMsg,this.LogF);
      resp= '{\"Error\":\"'+errMsg+'\"}';
    }
    else { //.. indT > -1 - have taskId in URL
      this.taskId= requrl.substr( indT+ taskStr.length );
      logger.addLog( clName+": "+methName+
         ": extracted from URL: taskId:["+this.taskId+"]\n",this.LogF);
      var prmfname= this.cdt_home+"/template_params_"+this.taskId+".txt";
      resp= this.readResultFile( prmfname );
    }
    logger.addLog( clName+": "+methName+
      ": params length="+resp.length+"\n",this.LogF);
  }
  else
  if( (match1= rexpPFMTERR.exec(requrl)) != null ) {
    //.. parameter format error file
      logger.addLog( clName+": "+methName+
        ": URL match /api/get_pfmterr\n",this.LogF);
      //.. assuming: /api/get_pfmterr?taskId=f7be82e43e34cb4e960b45d35e8d9596
      var indT= requrl.indexOf( taskStr, 0);
      if( indT < 0 ) {
        var errMsg=
          clName+": "+methName+": Error: No taskId found in the URL !\n";
        logger.addLog( errMsg,this.LogF);
        resp= '{\"Error\":\"'+errMsg+'\"}';
      }
      else { //.. indT > -1 - have taskId in URL
        this.taskId= requrl.substr( indT+ taskStr.length );
        logger.addLog( clName+": "+methName+
           ": extracted from URL: taskId:["+this.taskId+"]\n",this.LogF);
        var errfname= this.cdt_home+"/sync_template_err_"+this.taskId+".txt";
        resp= this.readResultFile( errfname );
      }
      logger.addLog( clName+": "+methName+
        ": params length="+resp.length+"\n",this.LogF);
  }
  else
  if( (match1= rexpGFSAVSP.exec(requrl)) != null ) {
    //.. Available Space in Server-side file-system
    logger.addLog( clName+": "+methName+
      ": URL match /api/get_fsAvSpace \n",this.LogF);
    var errMsg= this.getFsAvailSpace( this.cdt_home );
    if( errMsg.length > 0 ) {
      //.. return non-empty Error message
      resp= '{\"Error\":\"'+errMsg+'\"}';
    }else{
      resp= fsAvSpaceKB; //.. empty return means no error
    };
  }
  else
  if( (match1= rexpACERES.exec(requrl)) != null ) {
    //.. (simulated env.) ACE-editor resource files
    logger.addLog( clName+": "+methName+
      ": URL match /node_modules/ace-builds...\n",this.LogF);
    var acebldStr= "src-min\/";
    var indAB= requrl.indexOf( acebldStr, 0);
    if( indAB < 0 ) {
      logger.addLog( clName+": "+methName+
        ": Warn: No URL match("+acebldStr+").\n",this.LogF);
    }
    else { //.. indAB > -1 -got acebldStr
      var acefname= requrl.substr( indAB +acebldStr.length );
      logger.addLog( clName+": "+methName+
        ": req.file name:["+acefname+"]\n",this.LogF);
     // if( acefname == "mode-velocity.js" || acefname == "theme-chrome.js" )
      if( acefname == "mode-velocity.js" )
      {
        var aresfname= this.cdt_home+"/app/"+acefname;
        resp= this.readResultFile( aresfname );
      }
      else {
        logger.addLog( clName+": "+methName+
          ": Warn: No ace URL match("+acebldStr+"...js).\n",this.LogF);
      }
    }
  }
  else { //.. 
    logger.addLog( clName+": "+methName+
      ": Warn: No URL match - nothing to do !\n",this.LogF);
  };
  logger.addLog( clName+": "+methName+
    ": resp.length="+resp.length+"\n finish.\n",this.LogF);
  return resp;
};

exports.deleteOldFiles = function( ctaskId ) {
  var methName= "deleteOldFiles";
    logger.addLog( clName+": "+methName+
      ": start. the complete task Id:["+ctaskId+"]\n",this.LogF);
  var cp_args= new Array( 0 );
    cp_args.push( ctaskId ); //.. give it taskId in args
    cp_args.push( cdt_home );
    cp_args.push( LOG_DIR );
  var DelScript= this.cdt_home +"/app/deleteOldData.js";
  var chprocI= Chproc.fork( DelScript, cp_args );
    logger.addLog( clName+": "+methName+
      ": DelScript started ...\n",this.LogF);
    let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
};

exports.getRoot = function() {
  var methName= "getRoot";
    logger.addLog( clName+": "+methName+": start. ROOT URL match \n",this.LogF);
    logger.addLog( clName+": "+methName+
      ": cdt_home:["+this.cdt_home+"]\n",this.LogF);
  var HTML_ROOT_FLDR= this.cdt_home;
  this.rsfname= HTML_ROOT_FLDR+"/index.html";
  var resp= this.readResultFile( this.rsfname );
    logger.addLog( clName+": "+methName+
      ": result length="+resp.length+"\n",this.LogF);
    logger.addLog( clName+": "+methName+": resp:["+resp+"]\n",this.LogF);
  return resp;
};

exports.readResultFile = function( rfname ) {
  var methName= "readResultFile";
  //.. read processing result from file and send back to the client
    logger.addLog( clName+": "+methName+
      ": start. rfname:["+rfname+"]\n",this.LogF);
  var rdata= "";
  try {
    rdata= fs.readFileSync( rfname, 'utf8');
  }
  catch( err ) {
    logger.addLog( clName+": "+methName+
      ": result-file read: Error: code="+err.code+"\n",this.LogF);
      throw err;
  }
  logger.addLog( clName+": "+methName+
    ": result-file content length="+rdata.length+"\n",this.LogF);
  return rdata;
};

exports.postSrvLogRec = function ( requrl, inpdata, remaddr ) {
  //.. to be called by server on receiving POST /api/post_logrec request
  var methName= "postSrvLogRec";
    logger.addLog( clName+": "+methName+
      ": start: url:["+ requrl+"]\n",this.LogF);
  let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
    logger.addLog( clName+": "+methName+
      ": cdt_home:\n["+cdt_home+"]\n",this.LogF);
    logger.addLog( clName+": "+methName+
      ": client: remaddr:["+ remaddr+"]\n",this.LogF);
    if( remaddr != null && remaddr != undefined ) {
      this.remAddr= remaddr;
    };
    logger.addLog( clName+": "+methName+
      ": Log Record:\n-["+inpdata+"]-\n",this.LogF);
    var resp= '{\"respStr\":\"OK\"}';
    logger.addLog( clName+": "+methName+": done: resp:["+resp+"]\n",this.LogF);
  return( resp );
};

exports.procReq = function ( requrl, inpdata, remaddr ) {
  //.. to be called by server on receiving POST /api/* request
  //   receive input data, save into a file and start server-side processing task
  var methName= "procReq";
    logger.addLog( clName+": "+methName+
      ": start: url:["+ requrl+"]\n",this.LogF);
  let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
    logger.addLog( clName+": "+methName+
      ": cdt_home:\n["+cdt_home+"]\n",this.LogF);
    logger.addLog( clName+": "+methName+
      ": client: remaddr:["+ remaddr+"]\n",this.LogF);
    if( remaddr != null && remaddr != undefined ) {
      this.remAddr= remaddr;
    };
    logger.addLog( clName+": "+methName+
      ": remAddr:["+ this.remAddr+"]\n",this.LogF);
  var inpdLen= inpdata.length;
  logger.addLog( clName+": "+methName+": inpdata length="+inpdLen+"\n",this.LogF);
  if( inpdLen > 300 ) {
    logger.addLog( clName+": "+methName+
      ": inpdata:\n["+inpdata.substr(0,299)+"...]\n",this.LogF);
  }else{
    logger.addLog( clName+": "+methName+
      ": inpdata:\n["+inpdata+"]\n",this.LogF);
  };
   var resp= '{\"respStr\":\"postNotFoundResp\"}';
    var taskStr= "taskId=";
      var rexp2= new RegExp(/\/api\/proc_cont/);
      var match2= rexp2.exec( requrl );
      if( match2 ) {
        logger.addLog( clName+": "+methName+
          ": URL match: proc_cont - processing content...\n",this.LogF);
        //.. check available space before server-side processiong
        var emsg= this.getFsAvailSpace( this.cdt_home );
        var doAdd= ''; //.. false
        var doProc= ''; //.. false
        //.. assuming format:
        //   url: /api/proc_cont?taskId=1fcf9ebb05cec21caeb71ebac7e34b2c&part=2of2
        var indT= requrl.indexOf( taskStr, 0);
        if( indT < 0 ) {
          logger.addLog( clName+": "+methName+
            ": Warn: No taskId found in the URL - New Task !\n",this.LogF);
          this.calcTaskId();
          logger.addLog( clName+": "+methName+
            ": calculated New taskId:["+this.taskId+"]\n", this.LogF);
          resp= '{\"respStr\":\"proc_start\",\"taskId\":\"'+this.taskId+'\"}';
        }
        else { //.. indT > -1 - have taskId in URL
          var indTV= indT+ taskStr.length;
          var indDL= requrl.indexOf( fDelim, indTV );
          if( indDL < 0 ) {
            logger.addLog( clName+": "+methName+
              ": no more fields after taskId.\n",this.LogF);
            this.taskId= requrl.substr( indTV );
          }else{ //.. found delimiter
            this.taskId= requrl.substring( indTV, indDL );
          };
          logger.addLog( clName+": "+methName+
            ": extracted from URL: taskId:["+this.taskId+"]\n", this.LogF);
          doAdd= "true"; //.. will add to old content
          resp= '{\"respStr\":\"proc_upload\"}'; //.. no return of old taskId
        }
        var inputFilePfx = this.cdt_home +"/posted_data_";
        var infname= inputFilePfx +this.taskId +".txt";
          logger.addLog( clName+": "+methName+
            ": got input file name:["+infname+"]\n",this.LogF);
        //.. extracting parts info, e.g.: "...&part=2of2"
        var rexp2p= new RegExp(/part=(\d+)of(\d+)/);
          var match2p= rexp2p.exec( requrl );
        if( match2p == null ) {
          logger.addLog( clName+": "+methName+
            ": Warn: No part number found in the URL "+
            "-cant determine the last part !\n",this.LogF);
        }
        else { //.. match2p != null
          logger.addLog( clName+": "+methName+
              ": match2p:  length="+match2p.length+"\n",this.LogF);
            for( var i1=0; i1 < match2p.length; i1++ ) {
              logger.addLog( clName+": "+methName+
                ": match2p:["+match2p[i1]+"]\n",this.LogF);
            };
            var partNum= match2p[ 1];
            var partCnt= match2p[ 2];
            logger.addLog( clName+": "+methName+
              ": partNum:["+partNum+"] partCnt:["+partCnt+"]\n",this.LogF);
            if( partNum == partCnt ) {
              logger.addLog( clName+": "+methName+
                ": this is the last part -need doProc\n",this.LogF);
              doProc= "true";
            };
        };
        //.. write data into the file and start processing right after the close
        var errW= this.writeInp2File( infname, inpdata, doAdd, doProc );
        if( errW.length > 0 ) {
          resp= errW;
        };
      }
      else { //.. no match2
        logger.addLog( clName+": "+methName+": Warn: No URL match.\n",this.LogF);
      }
      logger.addLog( clName+": "+methName+": done: resp:["+resp+"]\n",this.LogF);
    return( resp );
};

exports.getFsAvailSpace = function ( fspath ) {
  var methName= "getFsAvailSpace";
  //.. get available space (kB) in filesystem where the fspath is mounted
   logger.addLog( clName+": "+methName+
     ": start: fspath:\n["+fspath+"]\n",this.LogF);
  var timeStampI = Date.now();
    logger.addLog( clName+": "+methName+": timeStampI="+timeStampI+"\n",this.LogF);
  var timeStamp = new Date( timeStampI ).toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
  if( fspath.length < 1 ) {
    var errMsg= methName+": Error: the filesystem directory path is empty !";
    logger.addLog( clName+ errMsg+"\n", this.LogF);
    return errMsg;
  };
 // var carg= "-k "+fspath;
 // var mopts= { input: carg, timeout: 4000 };
 //var moutObj= Chproc.spawnSync('df',[],mopts);
  var c_args= new Array( 0 );
    c_args.push( '-k' );
    c_args.push( fspath );
  var mopts= { timeout: 4000 };
    logger.addLog( clName+": "+methName+
      ": mopts:["+JSON.stringify(mopts)+"]\n",this.LogF);
  //.. start
  var moutObj= Chproc.spawnSync('df', c_args, mopts);
    logger.addLog( clName+": "+methName+
      ": df done: moutObj: status:["+moutObj.status+"](0 means Ok)\n",this.LogF);
  var timeStampI = Date.now();
    logger.addLog( clName+": "+methName+": timeStampI="+timeStampI+"\n",this.LogF);
  if( moutObj.error != null ) {
    var errMsg= clName+": "+methName+
      ": spawn df: Error:["+JSON.stringify(moutObj.error)+"]";
    logger.addLog( errMsg+"\n", this.LogF);
    return errMsg;
  };
    logger.addLog( clName+": "+methName+
      ": df moutObj.output: length="+moutObj.output.length+"\n",this.LogF);
  if( moutObj.output.length > 0 ) {
    for( var i0=0; i0 < moutObj.output.length; i0++ ) {
        logger.addLog( clName+": "+methName+
          ": moutObj.output["+i0+"]:["+moutObj.output[i0]+"]\n",this.LogF);
    }; //.. loop
    //.. output[1]: should contain 2 lines:
    // [Filesystem     1K-blocks    Used Available Use% Mounted on\n
    //  /dev/dm-0       37383720 8933604  26528068  26% /\n]
    var out1= moutObj.output[1];
    logger.addLog( clName+": "+methName+": to parse out1:["+out1+"]\n",this.LogF);
    var rexp1= new RegExp(/\s+(\d+)\s+(\d+)\s+(\d+)\s+/);
    logger.addLog( clName+": "+methName+": rexp1:["+rexp1+"]\n",this.LogF);
    var matchArr= rexp1.exec( out1 );
    if( matchArr == null ) {
      var errMsg= clName+": "+methName+
        ": spawn: Error: No digitals (bytes counts) found in the output !";
      logger.addLog( errMsg+"\n", this.LogF);
      return errMsg;
    };
    if( matchArr[3] == null || matchArr[3] == undefined ) {
      var errMsg= clName+": "+methName+
        ": parsed: Error: The 3-rd byte count is empty (no Available Kbytes) !";
      logger.addLog( errMsg+"\n", this.LogF);
      return errMsg;
    };
    fsAvSpaceKB= matchArr[3];
    logger.addLog( clName+": "+methName+
      ": extracted fsAvSpaceKB="+fsAvSpaceKB+"\n",this.LogF); 
  }else{
    var errMsg= clName+": "+methName+
      ": spawn: Error: Empty df-command output array !";
    logger.addLog( errMsg+"\n", this.LogF);
    return errMsg;
  }
  logger.addLog( clName+": "+methName+": finished.\n",this.LogF);
  return '';
};

exports.calcTaskId = function () {
  var methName= "calcTaskId";
  //.. calculate taskId
    logger.addLog( clName+": "+methName+": start:\n",this.LogF);
  var timeStampI = Date.now();
    logger.addLog( clName+": "+methName+": timeStampI="+timeStampI+"\n",this.LogF);
  var timeStamp = new Date( timeStampI ).toISOString();
    logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);

  var rawId = String( this.remAddr+'-'+timeStampI );
    logger.addLog( clName+": "+methName+": rawId:["+rawId+"]\n",this.LogF);

  var mopts= { input: rawId, timeout: 4000 };
    logger.addLog( clName+": "+methName+
      ": mopts:["+JSON.stringify(mopts)+"]\n",this.LogF);

  var moutObj= Chproc.spawnSync('md5sum',[],mopts);
    logger.addLog( clName+": "+methName+
      ": moutObj: status:["+moutObj.status+"]\n",this.LogF);
  if( moutObj.error != null ) {
    logger.addLog( clName+": "+methName+
      ": moutObj calc.: Error:["+JSON.stringify(moutObj.error)+"]\n",this.LogF);
    throw moutObj.error;
  }
  else { //.. no errors
    logger.addLog( clName+": "+methName+
      ": moutObj: output: length="+moutObj.output.length+"\n",this.LogF);
    if( moutObj.output.length > 0 ) {
      for( var i0=0; i0 < moutObj.output.length; i0++ ) {
        logger.addLog( clName+": "+methName+
          ": moutObj: output:["+moutObj.output[i0]+"]\n",this.LogF);
      }
    }
    var out1= moutObj.output[ 1 ];
    logger.addLog( clName+": "+methName+": out1:["+out1+"]\n",this.LogF);
    var rexp1= new RegExp(/\w+/); //.. alphanumeric
    logger.addLog( clName+": "+methName+": rexp1:["+rexp1+"]\n",this.LogF);
    var match1= rexp1.exec( out1 );
    if( match1 == null ) {
      logger.addLog( clName+": "+methName+
        ": Warn.: No Match of rexp1 in the cmd output (No taskId) !\n",this.LogF);
    }
    else {
      logger.addLog( clName+": "+methName+
        ": match1:["+match1[0]+"] length="+match1.length+"\n",this.LogF);
      this.taskId= match1[0];
    };
  };
  logger.addLog( clName+": "+methName+
    ": done: calculated taskId:["+this.taskId+"]\n",this.LogF);
};

exports.writeInp2File = function ( fname,  inpd, doAdd, doProc ) {
  var methName= "writeInp2File";
  //.. write input data to the file
    logger.addLog( clName+": "+methName+
      ": Start: file:["+fname+"]\n",this.LogF);
  let timeStamp = new Date().toISOString();
  logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
  var inpdLen= inpd.length;
    logger.addLog( clName+": "+methName+": inpd length="+ inpdLen+"\n",this.LogF);
  if( inpdLen < 1 ) {
    logger.addLog( clName+": "+methName+
      ": Warn.: Empty input - nothing to do !\n",this.LogF);
    return ''; //.. not an error
  };
  if( inpdLen > 300 ) {
    logger.addLog( clName+": "+methName+
      ": inpd(begin):["+ inpd.substr(0,299)+"...]\n",this.LogF);
  }
  else {
    logger.addLog( clName+": "+methName+": inpd:["+ inpd+"]\n",this.LogF);
  };
  logger.addLog( clName+": "+methName+
    ": doAdd:["+doAdd+"] doProc:["+doProc+"]\n",this.LogF);
  if( ! doAdd ) {
    logger.addLog( clName+": "+methName+
      ": Dont doAdd - need new content.\n",this.LogF);
    //.. removing old file if is there with the same name (async is Not OK !)
    var fname_o= fname+".save";
    try {
      fs.renameSync( fname, fname_o );
    }
    catch( err ) {
      var errMsg= clName+": "+methName+
        ": Warn.: Failed to rename old file:["+fname+"]"+
        " err.code="+err.code+"\n";
      logger.addLog( errMsg, this.LogF );
    };
  };
  logger.addLog( clName+": "+methName+": opening file:["+fname+"]\n",this.LogF);
  try {
    this.fdI= fs.openSync( fname, 'a' );
  }
  catch( err ) {
    var errMsg= clName+": "+methName+
      ": Error: Failed to open file:["+fname+"]"+
      " err.code="+err.code+"\n";
    logger.addLog( errMsg, this.LogF );
    return( errMsg );
  };
  logger.addLog( clName+": "+methName+
    ": writing data into the file: fdI="+ this.fdI+"\n",this.LogF);
  try {
    fs.appendFileSync( this.fdI, inpd, 'utf8' );
  }
  catch( err ) {
    var errMsg= clName+": "+methName+
      ": Error: Failed to append input data to file: err.code="+err.code+"\n";
    logger.addLog( errMsg, this.LogF );
    return( errMsg );
  };
  logger.addLog( clName+": "+methName+
    ": closing input data file...\n",this.LogF);
  try {
    fs.closeSync( this.fdI );
  }
  catch( err ) {
    var errMsg= clName+": "+methName+
      ": Error: Failed to close input data file: err.code="+err.code+"\n";
    logger.addLog( errMsg, this.LogF );
    return( errMsg );
  };
  logger.addLog( clName+": "+methName+
    ": input file was written and closed successfully.\n",this.LogF);
  timeStamp = new Date().toISOString();
  logger.addLog( clName+": "+methName+": timeStamp:["+timeStamp+"]\n",this.LogF);
  if( doProc ) {
    logger.addLog( clName+": "+methName+
      ": starting processing...\n",this.LogF);
    this.startProcFile();
  };
  return ''; //.. no error
};

exports.startProcFile = function () {
  var methName= "startProcFile";
  //.. start processing of the input file in external sub-process
  logger.addLog( clName+": "+methName+
    ": Start: taskId:["+this.taskId+"]\n",this.LogF);
    let timeStamp = new Date().toISOString();
    logger.addLog( clName+": "+methName+
      ": timeStamp:["+timeStamp+"]\n",this.LogF);
  console.log(methName+": cdt_home:["+this.cdt_home+"]");
  var SubProcScriptP= this.cdt_home + SubProcScript;
    logger.addLog( clName+": "+methName+
      ": run SubProcScript:\n["+SubProcScriptP+"]\n",this.LogF);
  var cp_args= new Array( 0 );
    cp_args.push( this.taskId ); //.. give it taskId in args
    cp_args.push( this.cdt_home );
    cp_args.push( this.LOG_DIR ); 
  var chprocI= Chproc.fork( SubProcScriptP, cp_args );

 // chprocI.on('message', (msg) => {
 //   console.log(methName+": chprocI got msgJ:["+JSON.stringify(msg)+"]");
 // });
 // console.log("startProcFile: sending a message to child.");
 // chprocI.send({ hello: 'world' });
  logger.addLog( clName+": "+methName+" done submit.\n",this.LogF);
};
