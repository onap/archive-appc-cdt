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
//.. srvlogger.js -logging in file system
const fs = require('fs');

const clName= "srvlogger";

var MaxLogSize= 5000000;
var LogFileNm;
var fdL;

exports.addLog = function( logStr, fileNm ) {

  this.LogFileNm= fileNm
  this.fdL= fs.openSync( this.LogFileNm, 'a' );
 // console.log(clName+": log opened. fdL="+this.fdL);

  var lfStats= fs.fstatSync( this.fdL );
  if( lfStats.size + logStr.length >= MaxLogSize )
  {
    this.changeLogFile();
  };

  try {
    fs.appendFileSync( this.fdL, logStr, 'utf8' );
  }
  catch( err ) {
    console.log(clName+": log append: error:"+err.message );
    throw err;
  };
  fs.closeSync( this.fdL );
}

exports.changeLogFile = function() {

  var msgO= "\n=== The Log reached max size. Changing the file. ===\n";
  try {
    fs.appendFileSync( this.fdL, msgO, 'utf8' );
  }
  catch( err ) {
    console.log(clName+": log append: error:"+err.message );
    throw err;
  };
  fs.closeSync( this.fdL );

  var LogFileNm_o= this.LogFileNm +".old";
  try {
    fs.renameSync( this.LogFileNm, LogFileNm_o );
  }
  catch( err ) {
    throw err;
  };

  try {
    this.fdL= fs.openSync( this.LogFileNm, 'a' );
  }
  catch( err ) {
    console.log(clName+": New Log file open: error:["+err.message+"]\n");
    throw err;
  }
  console.log( clName+": New Log file opened: fdL="+this.fdL+"\n");

  var msgN= "\n=== New Log file ===\n";
  try {
    fs.appendFileSync( this.fdL, msgN, 'utf8' );
  }
  catch( err ) {
    console.log( clName+": new log append: error:"+err.message );
    throw err;
  };
}

exports.setMaxLogSize = function( newMaxLogSize ) {
  if( newMaxLogSize > 0 )
    MaxLogSize= newMaxLogSize;
  else
    console.log(clName+": Wrong arg: newMaxLogSize <= 0 !");
}
