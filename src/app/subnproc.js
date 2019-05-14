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
//.. subnproc.js -to be started by parent server process
const fs = require('fs');
const Chproc = require('child_process');

var clName= "subnproc";
var thePid= 0;
var taskId= '';
//.. assuming all these files are in CDT_HOME
var inpFilePfx= "posted_data_";
var outFilePfx= "sync_template_res_"; //.. processing results
var errFilePfx= "sync_template_err_"; //.. error found while processing
var parmFilePfx= "template_params_";
var pstatfNamePfx= "proc_status_";
//.. pDlm -delimiter of params
//   (cant be: alphanumeric,underbar,dollar,dot,comma,brackets,dash,equal sign,etc)
var pDlm= '\n';
var logfname= clName+".log";
 var logfname_o= logfname+".save"; //.. to keep old content
var fdL;
var fdIn;
var fdOut;
var errMsgBadParm= ''; //.. create error message to report to client
//var checkSpecialCharsReg= new RegExp(/[^\w\s-]/);
var checkSpecialCharsReg= new RegExp(/[^\w\s-\.]/);
var doStopOnSpecChars= 'Y';
var doCheckComments= 'Y';
//var SYNC_T_KEY_EXPRES= '\\${.+?\\}';
var VSTART= '${';
var VEND= '}';
var lenVS= VSTART.length, lenVE= VEND.length;
var KEY_START= '${(';
var KEY_MID= ')=(';
var KEY_END= ')}';
var LD= "\n"; //.. LD -line delimeter in the input file
var lenLD= LD.length;
var percAtRngs= 55; //.. percentage defining report to client

var traceLvl= 1;
//var CCnt= 52;
var CCnt= 2;

  var taskIdArgstr= process.argv[ 2 ];
  var CDT_HOME= process.argv[ 3 ];
  var LOG_DIR= process.argv[ 4 ];
  this.thePid= process.pid;
  console.log(clName+": Start: thePid="+this.thePid );
  console.log(clName+": CDT_HOME:["+CDT_HOME+"]" );
  console.log(clName+":  LOG_DIR:["+LOG_DIR+"]" );

try {
  //.. need renameSync (not asynchronous) !
  fs.renameSync( LOG_DIR+"/"+logfname, LOG_DIR+"/"+logfname_o);
}
catch( err ) {
    console.log(clName+": log rename error: code="+ err.code );
    console.log(clName+": log rename error.msg:["+err.message+"]");
    //throw err;
};
fs.open( LOG_DIR+"/"+logfname, 'a', (err, fd) => {
  if( err ) {
    console.log(clName+": log file open error:"+err.message );
    throw err;
  }
  this.fdL= fd;
  console.log(clName+": log opened. fdL="+this.fdL);

  this.logWr( clName+": Start: thePid="+this.thePid+"\n");

  this.logWr( clName+
    ": execArgv:["+process.execArgv+"]\n argv:["+process.argv+"]\n");
  var indT= taskIdArgstr.indexOf('=', 0);
  if( indT < 0 ) {
   // this.logWr(clName+": Error: Failed to extract taskId from args:["+
   //   taskIdArgstr+"]\n");
   // this.taskId= "000";
    this.taskId= taskIdArgstr;
  } else {
    this.taskId= taskIdArgstr.substr( indT+1 );
  }
  this.logWr(clName+": taskId:["+this.taskId+"]\n");
  if(  this.taskId == null || this.taskId == undefined || this.taskId.length < 1 )
  {
    var errMsg= clName+": Error: taskId is empty !\n";
    console.log( errMsg );
    this.logWr( errMsg );
    throw new Error( errMsg );
  };
  this.logWr(clName+": CDT_HOME:["+CDT_HOME+"]\n");

  var timeStampI = Date.now();
  this.logWr(clName+": timeStampI="+timeStampI+" \n");
  var timeStamp = new Date( timeStampI ).toISOString();
  this.logWr(clName+": timeStamp:["+timeStamp+"]\n");

 //.. setup callback waiting for message from parent
 // process.on('message', (msg) => {
 //   console.log('subnp: got message:', msg);
 // });

  //this.logWr("subnp: sending msg to parent.\n");
 // var msg2parent = { taskid: taskId };
 // this.logWr("subnp: msg2parent:["+JSON.stringify(msg2parent)+"]\n");
 // process.send( msg2parent );

  var inpFile= CDT_HOME+"/"+ inpFilePfx +this.taskId +".txt";
  this.logWr(clName+": opening inpFile for reading:["+inpFile+"]\n");

  fs.open( inpFile, 'r', (err, fd0) => {
    if( err ) {
      console.log(clName+": inpFile file open: Error: code="+err.code );
      this.logWr(clName+": inpFile file open: Error: code="+err.code+"\n");
      throw err;
    }
    this.fdIn= fd0;
    console.log(clName+": Input file opened. fdIn="+this.fdIn);

    fs.readFile( this.fdIn, (err, data) => {
      if( err ) {
        console.log(clName+": Failed to read inpFile: Error: code="+err.code );
        this.logWr(clName+": Failed to read inpFile: Error: code="+err.code+"\n");
        throw err;
      }
      this.processData( data );
      //.. close log
      console.log(clName+": close: fdL="+this.fdL );
      fs.closeSync( this.fdL );
      this.fdL= -1;
    });
  });
});

exports.processData = function ( data ) {
  //.. processing data content from already opened input file
  var methName= "processData";
  this.logWr(methName+": start...\n");
  var timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");
  var fcontStr= new String( data );
  let fcontLen= fcontStr.length;
  this.logWr(methName+": fcontLen="+fcontLen+"\n");

  this.logWr(methName+": trying to close inpFile: fdIn="+this.fdIn+"\n");
  fs.closeSync( this.fdIn );
  this.logWr(methName+": inpFile closed.\n");

  var pstatfName= CDT_HOME+"/"+ pstatfNamePfx +this.taskId+".json";
  var percent= 1;
  var stmsg= '{\"percentage\":'+percent+'}';
  this.updateProcStatus( pstatfName, stmsg );

  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");

  var perrorfName= CDT_HOME+"/"+ errFilePfx+ this.taskId+".txt";
  var formatErr= '';
  var lineEnds= new Array( 0 ); //.. indexes of new-line chars
  var selecRanges= new Array( 0 ); //.. indexes of ${variables}
  var parmNamVals= new Map(); //.. parameter Name-Value pairs from inside ${...}
  var ind0= 0;
  var ind1= fcontStr.indexOf( LD,ind0 ); //.. line delimeter
  var rn= 0, li= 0;
  while( ind1 > -1 ) {
    lineEnds.push( ind1 );
    this.logWr(
      methName+":--line #:"+li+" beg: ind0="+ind0+" end: ind1="+ind1+
      " array:"+lineEnds[li]+"\n");
    var line0= fcontStr.substring( ind0, ind1 ); //.. not including LD
    var liLen= line0.length;
    this.logWr( methName+":  liLen="+liLen+"\n");
    if( liLen > 60 ) {
      this.logWr( methName+": line(p):["+line0.substr(0,60)+"]\n");
    } else {
      this.logWr( methName+": line:["+line0+"]\n");
    }
    //.. look for ${param variables}
    rn= this.getRangesForVars( line0, li, rn, selecRanges );
    if( rn < 0 ) {
      this.logWr( methName+": got Error:\n["+errMsgBadParm+"]");
      this.reportParamBadFmt( li, '', errMsgBadParm, perrorfName, pstatfName );
      this.logWr( methName+": Stopping processing !\n");
      return;
    }
    if( traceLvl > 1 )
      this.logWr( methName+": added ranges at li="+li+": next rn="+rn+"\n");
    ind0= ind1 +lenLD; //.. for next search of LD
    if( ind0 >= fcontLen ) { break; };
    li++;
    ind1= fcontStr.indexOf( LD,ind0 ); //.. line delimeter
  }; //.. loop
  //.. process the last line
  if( ind0 < fcontLen ) {
    this.logWr( methName+": have the last line: ind0="+ind0+"\n");
    lineEnds.push( fcontLen );
    var line0= fcontStr.substring( ind0 ); //.. up to the end
    var liLen= line0.length;
    this.logWr( methName+":  liLen="+liLen+"\n");
    if( liLen > 60 ) {
      this.logWr( methName+": line(p):["+line0.substr(0,60)+"]\n");
    } else {
      this.logWr( methName+": line:["+line0+"]\n");
    }
    //.. look for ${param variables}
    rn= this.getRangesForVars( line0, li, rn, selecRanges );
    if( rn < 0 ) {
      this.logWr( methName+": got Error in getRangesForVars:\n["+
        errMsgBadParm+"]");
      this.reportParamBadFmt( li, '', errMsgBadParm, perrorfName, pstatfName );
      this.logWr( methName+": Stopping processing !\n");
      return;
    }
  };
  this.logWr( methName+":  -=- lineEnds array length="+lineEnds.length+"\n");
  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");

  percent= percAtRngs;
  stmsg= '{\"percentage\":'+percent+'}';
  this.updateProcStatus( pstatfName, stmsg );

  //.. Cycle through Ranges
  this.logWr( methName+": selecRanges array length="+selecRanges.length+"\n");
  if( doCheckComments ) {
      this.logWr( methName+": doCheckComments is True.\n");
  } else {
      this.logWr( methName+": doCheckComments is False\n");
  };
  var rnAtUpd= Math.floor( selecRanges.length/ 3.);
  var percStep= (100.0 - percAtRngs);
  this.logWr( methName+": range number for proc.status update="+rnAtUpd+
    "\n percentage step="+percStep );
  var outLinBuf= new Array( 0 ); //.. array of output lines
  var outLnLast=-1; //.. last processed
  var rngLnLast=-1;
  for( var rn0=0; rn0 < selecRanges.length; rn0++ ) {
    var rng= selecRanges[rn0];
    this.logWr( methName+":--- range #:"+rn0+" lineNm="+rng.lineNm+
      " colBg="+rng.colBg+" colEn="+rng.colEn+"\n");
    this.logWr( methName+": outLnLast="+outLnLast+"\n");
    if( rn0 > 0 && (rn0 % rnAtUpd) == 0 && rn0 < selecRanges.length -rnAtUpd )
    {
      percent= Math.floor( percAtRngs + percStep *(rn0/selecRanges.length) );
      this.logWr( methName+": need to update proc.status: percent="+percent+"\n");
      stmsg= '{\"percentage\":'+percent+'}';
      this.updateProcStatus( pstatfName, stmsg );
    };
    rngLnLast= rng.lineNm;
    //.. prepare previous lines with no ranges
    if( rng.lineNm - outLnLast > 1 ) {
      this.logWr( methName+": prepare previous lines...\n");
      var plinNm0= outLnLast +1;
      var plinesIndB= 0;
       if( plinNm0 > 0 ) { plinesIndB= lineEnds[outLnLast] + lenLD; };
      var plinesIndE= lineEnds[rng.lineNm -1] + lenLD;
      this.logWr( methName+": plinesIndB="+plinesIndB+
        " plinesIndE="+plinesIndE+"\n");
      var plinStr= fcontStr.substring( plinesIndB, plinesIndE );
      if( traceLvl > 1 ) {
        if( plinStr.length > 60 ) {
          this.logWr( methName+": plinStr(p):["+plinStr.substr(0, 60)+"]\n");
        } else {
          this.logWr( methName+": plinStr:["+plinStr+"]\n");
        }
      };
      outLinBuf.push( plinStr );
      outLnLast= rng.lineNm -1;
    };
    var linIndB= 0;
    var linIndE= lineEnds[rng.lineNm];
    if( rng.lineNm > 0 ) { linIndB= lineEnds[rng.lineNm - 1] + lenLD; };
    var linLen= linIndE - linIndB;
    var line0= fcontStr.substr( linIndB, linLen );
    this.logWr( methName+": linIndB="+linIndB+"  linIndE="+linIndE+
      " line length="+linLen+"\n");
    if( traceLvl > 1 ) {
      if( linLen > 60 ) {
        this.logWr( methName+": line0(p):\n["+line0.substr(0,60)+"]\n");
      } else {
        this.logWr( methName+": line0:\n["+line0+"]\n");
      }
    };
    //.. content between ${ and }
    var vword= line0.substring( rng.colBg+lenVS, rng.colEn+1-lenVE );
    this.logWr( methName+":  vword:["+vword+"]\n");
    //.. try to check for (pvalue)=(pname)
    let specialKeys= null;
    var parmNamAndVal= Array( 0 );
    var pName= null;
    var pValue= null;
    formatErr= this.parseParmValAndName( vword, parmNamAndVal )
    if( formatErr ) {
      this.reportParamBadFmt(
        rng.lineNm, vword, formatErr, perrorfName, pstatfName );
      this.logWr( methName+": Stopping processing !\n");
      return;
    }
    //.. No errors - parsing done OK
      pName= parmNamAndVal[0]; //.. to be added to parmNamVals
      pValue= parmNamAndVal[1];
      this.logWr( methName+": parsing done: param.name:["+
        pName+"] value:["+pValue+"]\n");

    if( pName != null && pName.length > 0 ) {
      this.logWr( methName+": check spec.chars in Non empty pName.\n");
      specialKeys= checkSpecialCharsReg.exec( pName );
      if( specialKeys == null ) {
        this.logWr( methName+":  specialKeys obj is null\n");
      }
      else
      if( specialKeys.length > 0 ) {
        this.logWr( methName+":  specialKeys obj Not null:["+specialKeys+
          "] length="+specialKeys.length+"\n");
        if( doStopOnSpecChars ) {
          formatErr=
            "The parameter name("+pName+") contains prohibited character(s):("+
            specialKeys+") !";
          this.logWr( methName+": formatErr:["+formatErr+"]\n");
          this.reportParamBadFmt(
            rng.lineNm, vword, formatErr, perrorfName, pstatfName );
          this.logWr( methName+": Stopping processing !\n");
          return;
        };
      };
    };
    var haveComment= '';
    if( doCheckComments ) {
      this.logWr( methName+": doCheckComments is True.\n");
      if( line0.trim().startsWith("//") ) haveComment= 'Y';
    };
    if( haveComment ) {
      this.logWr( methName+":   haveComment is True !\n");
    };
    //.. prepare parameter name and value
    if( pName != null && pName.length > 0 && !specialKeys && !haveComment )
    {
      this.logWr( methName+": checking non-empty param.name:["+pName+"]\n");
      if( parmNamVals.has(pName) ) {
        this.logWr( methName+": the param. is already accounted.\n");
      } else {
        this.logWr( methName+": adding new param. with value:["+pValue+"]\n");
        parmNamVals.set( pName, pValue );
      };
    };
    //.. prepare for template output
    var colB= 0;
    if( rn0 > 0 ) {
      var rngP= selecRanges[rn0 - 1];
      if( rngP.lineNm == rng.lineNm ) { colB= rngP.colEn+lenVE; };
    };
    var colE= rng.colEn;
    //.. check range content for replacement
    let checkApplForNamOn=
      this.checkAppliedForNamesOnly( line0, rng.colBg, rng.colEn );
    this.logWr( methName+": checkApplForNamOn:["+checkApplForNamOn+"]\n");
    if( checkApplForNamOn && !specialKeys && !haveComment )
    {
      this.logWr( methName+": Need Name Replacement... \n");
      var replacWrd= KEY_START +KEY_MID +vword +KEY_END; // ${()=(...)}
      this.logWr( methName+": replacWrd:["+replacWrd+"]\n");
      var colM= rng.colBg; //.. not including beginning of VSTART
      var brngStr= line0.substring( colB, colM );
      this.logWr( methName+": part before word:["+brngStr+"]\n");
      outLinBuf.push( brngStr + replacWrd );
    }
    else {
      this.logWr( methName+": No Replacement for this range !\n");
      var rsubs= line0.substring( colB, colE+lenVE );
      this.logWr( methName+": rsubs:["+rsubs+"]\n");
      outLinBuf.push( rsubs );
    };
    outLnLast= rng.lineNm;
    //.. check tail of the line
    if( rn0 == selecRanges.length - 1 ) {
      var tailStr= line0.substring(colE+lenVE) + LD;
      this.logWr( methName+": last range: adding line tail:\n["+tailStr+"]\n");
      outLinBuf.push( tailStr );
    }
    else { //.. not the last range
      var rngN= selecRanges[rn0 + 1];
      if( rngN.lineNm == rng.lineNm ) {
        //.. next range on the same line - no tail yet
      }
      else { //.. next range on different line
        var tailStr= line0.substring(colE+lenVE) + LD;
        this.logWr( methName+": adding line tail:\n["+tailStr+"]\n");
        outLinBuf.push( tailStr );
      };
    };
  }; //... loop
  if( rngLnLast < lineEnds.length - 1) {
    this.logWr( methName+": adding last lines having no ranges...\n");
      var llinesIndB= 0;
       if( rngLnLast > 0 ) { llinesIndB= lineEnds[rngLnLast] + lenLD; };
      var llinesIndE= lineEnds[lineEnds.length -1] + lenLD;
      this.logWr( methName+": llinesIndB="+llinesIndB+
        " llinesIndE="+llinesIndE+"\n");
    var llinStr= fcontStr.substring( llinesIndB, llinesIndE );
    if( traceLvl > 1 ) {
      if( llinStr.length > 60 ) {
        this.logWr( methName+": llinStr(p):\n["+llinStr.substr(0,60)+"]\n");
      } else {
        this.logWr( methName+": llinStr:["+llinStr+"]\n");
      }
    }
    outLinBuf.push( llinStr );
  };
  this.logWr( methName+":  -=- outLinBuf: array length="+outLinBuf.length+"\n");
  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");

  var outFile= CDT_HOME+"/"+ outFilePfx+ this.taskId+".txt";
  var outFile_o= outFile+".save";
  try {
    fs.renameSync( outFile, outFile_o );
  }
  catch( err ) {
    this.logWr(clName+": old output file rename: error:["+err.message+"]\n");
   // throw err;
  };
  try {
    this.fdOut= fs.openSync( outFile, 'a' );
  }
  catch( err ) {
    this.logWr(clName+": output file open: error:["+err.message+"]\n");
    throw err;
  }
  this.logWr(methName+": output file opened: fdOut="+this.fdOut+"\n");
  for( let outLine of outLinBuf ) {
    try {
      fs.appendFileSync( this.fdOut, outLine, 'utf8' );
    }
    catch( err ) {
      this.logWr(clName+": output file append: error: code="+err.code );
      throw err;
    }
  }; //... loop
  this.logWr(methName+": closing output file: fdOut="+this.fdOut+"\n");
  fs.closeSync( this.fdOut );
  this.logWr(methName+": output file closed.\n");
  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");

  this.logWr( methName+":  -=- parmNamVals (Parameters): map.size="+
    parmNamVals.size+"\n");
  var parmFile= CDT_HOME+"/"+ parmFilePfx+ this.taskId+".txt";
  var parmFile_o= parmFile+".save";
  try {
    fs.renameSync( parmFile, parmFile_o );
  }
  catch( err ) {
    this.logWr(clName+": old Params file rename: error:["+err.message+"]\n");
   // throw err;
  };
  try {
    this.fdParm= fs.openSync( parmFile, 'a' );
  }
  catch( err ) {
    this.logWr(clName+": Params file open: error:["+err.message+"]\n");
    throw err;
  };
  this.logWr(methName+": Params file opened: fdParm="+this.fdParm+"\n");
  //.. writing parameters into parameter-output file
  try {
   // fs.appendFileSync( this.fdParm, "[\n", 'utf8' );
    var iw= 0;
    for( let pnm of parmNamVals.keys() ) {
      let pv= parmNamVals.get( pnm );
      let pnv= pnm+"="+pv;
      this.logWr( methName+": iw="+iw+" param.Name-Value:["+pnv+"]\n");
        //.. need delimiter after each item !
        fs.appendFileSync( this.fdParm, pnv+pDlm, 'utf8' );
      iw++;
    }; //... loop
   // fs.appendFileSync( this.fdParm, "]", 'utf8' );
  }
  catch( err ) {
    this.logWr(clName+": Params file append: error: code="+err.code );
    throw err;
  }
  this.logWr(methName+": closing Params file: fdParm="+this.fdParm+"\n");
  fs.closeSync( this.fdParm );
  this.logWr(methName+": Params file closed.\n");

  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");

  percent= 100;
  stmsg= '{\"percentage\":'+percent+'}';
  this.updateProcStatus( pstatfName, stmsg );

  //.. simulated updates
/*
  for( var i1=0; i1 < this.CCnt; i1++ ) {
    this.wait( 2 );
    percent += 2;
    if( percent > 100 ) { percent= 100; };
    stmsg= '{\"percentage\":'+percent+'}';
    this.updateProcStatus( pstatfName, stmsg );
  };

  this.wait( 1 );
*/
  this.logWr(methName+": finishing.\n");
  timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");
};

exports.checkAppliedForNamesOnly = function( line, colBg, colEn )
{
  var methName= "checkAppliedForNamesOnly";
  this.logWr( methName+": start: colBg="+colBg+" colEn="+colEn+"\n");
  if( traceLvl > 1 ) {
    if( line.length > 60 ) {
      this.logWr( methName+": line(p):\n["+line.substr(0,60)+"]\n");
    } else {
      this.logWr( methName+": line:\n["+line+"]\n");
    }
  };
  this.logWr( methName+": check for: KEY_START:["+KEY_START+"]\n");
  var lenKS= KEY_START.length;
  var indMax= colBg + lenKS
  var subline= line.substring( 0, indMax );
  var indKS= subline.lastIndexOf( KEY_START, subline.length ); //.. ${(
  if( indKS < 0 ) {
    if( traceLvl > 1 )
      this.logWr( methName+": No KEY_START at all - return true.\n");
    return true; //.. no KEY_START at all
  }
  else { //.. have KEY_START, check KEY_END
    this.logWr( methName+": check for: KEY_END:["+KEY_END+"]\n");
    indMax= colBg + KEY_END.length;
    subline= line.substring( indKS +lenKS, indMax );
    var indKE= subline.indexOf( KEY_END, 0 ); //.. )}
    if( indKE < 0 ) {
      if( traceLvl > 1 )
        this.logWr( methName+": Only KEY_START there - return false.\n");
      return false; //..only KEY_START there
    }
    else {
      if( traceLvl > 1 )
        this.logWr( methName+": Have both - return true.\n");
      return true; //.. have both: KEY_START and then KEY_END
    }
  }
}

exports.getRangesForVars = function( line, lnum, rnum, selRangesArr )
{
  var methName= "getRangesForVars";
  this.logWr( methName+": start: lnum="+lnum+"  rnum="+rnum+"\n");
  if( traceLvl > 0 ) {
    if( line.length > 60 ) {
      this.logWr( methName+": line(p):["+line.substr(0,60)+"]\n");
    } else {
      this.logWr( methName+": line:["+line+"]\n");
    }
  };
  var haveComment= '';
  if( line.trim().startsWith("//") ) haveComment= 'Y';
  //.. look for ${variables}
  var indV0= 0;
  var indV1= line.indexOf( VSTART, indV0 );
  while( indV1 > -1 ) {
      var indB= indV1;
      indV0= indB + 1;
      indV1= line.indexOf( VEND, indV0 );
      if( indV1 < 0 ) {
        errMsgBadParm=
          methName+": Parameter ending delimiter ("+VEND+
          ") not found in line #="+lnum+" after pos.#="+indV0+" !\n"
        this.logWr( "Error: "+errMsgBadParm);
        if( ! haveComment ) {
          return -1;
        } else { //.. haveComment - do not stop processing
          this.logWr( methName+": This line is commented out -ignore the error.");
          break;
        };
      };
      var indE= indV1 + lenVE-1;
      //.. check for VSTART inside the range (must find either old or new one)
      indB= line.lastIndexOf( VSTART, indE );
      this.logWr( methName+": found a ${param} at:"+indB+" - "+indE+"\n");
      //.. lineNm - line number in the input file
      //.. colBg - begin index of VSTART
      //.. colEn - after end index of VEND (both within the line)
      var range = { lineNm: lnum, colBg: indB, colEn: indE };
      selRangesArr.push( range );
      this.logWr( methName+": range #:"+rnum+
        " param.string:["+JSON.stringify(selRangesArr[rnum])+"]\n");
      rnum++;
      indV0= indV1 + lenVE;
      indV1= line.indexOf( VSTART, indV0 );
  };
  return rnum;
};

//.. assuming the word format is like: "(value)=(name)" or "name"
//   returning error message or empty string (which means no errors)
exports.parseParmValAndName = function( word, parmNamAndVal )
{
  var methName= "parseParmValAndName";
  this.logWr( methName+": start: input word:["+word+"]\n");
  var lenW= word.length;
  var errorMsg= '';
  if( traceLvl > 0 )
    this.logWr( methName+": word length="+lenW+"\n");
  if( lenW < 1 ) {
    errorMsg= methName+": the parameter string is empty !\n";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg );
    return errorMsg;
  };
  var lastCh= lenW - 1;
  var OBR= '(';
  var lenOBR= OBR.length;
  var CBR= ')';
  var lenCBR= CBR.length;
  var EQS= '=';
  var lenEQS= EQS.length;
  var name, val;
  var ic0= 0;
  var ic1= word.indexOf( OBR, ic0 );
  if( ic1 < 0 ) {
    if( traceLvl > 0 )
      this.logWr( methName+": no open round brackets -assuming the word has "+
        "param.name only.\n");
    parmNamAndVal.push( word );
    parmNamAndVal.push( '' );
    return ''; //.. empty errorMsg means OK
  };
  //.. got 1-st open round bracket
  if( traceLvl > 0 )
    this.logWr( methName+": found 1-st open round bracket at:"+ic1+"\n");
  if( ic1 > 0 ) {
    errorMsg= methName+": Unexpected chars before open round bracket at:"+ic1+"\n";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg );
    return errorMsg;
  };

  ic0= ic1 + lenOBR;
  if( ic0 >= lastCh ) {
    errorMsg=
      methName+": missing next expected round brackets after pos.#="+ic1+
        " -bad format\n";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg );
    return errorMsg;
  };
  var ic2= word.indexOf( CBR, ic0 );
  if( ic2 < 0 ) {
    errorMsg=
      methName+": no closing round bracket after 1-st open bracket -bad format\n";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg );
    return errorMsg;
  };
  //.. got 1-st closing round bracket (after Value)
  if( traceLvl > 0 )
    this.logWr( methName+": found 1-st closing round bracket at:"+ic2+"\n");
  val= word.substring( ic0, ic2 );
  if( traceLvl > 0 )
    this.logWr( methName+": got val:["+val+"]\n");
  ic0= ic2 + lenCBR;
  if( ic0 >= lastCh ) {
    errorMsg=
      methName+": missing next expected round brackets after pos.#="+ic2+
        " -bad format\n";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg );
    return errorMsg;
  };
  var ic3= -1;
  if( word.substr(ic0).startsWith(EQS) ) {
    //.. found EQS
    ic3= ic0;
  }
  else {
    errorMsg=
      methName+": no equal sign after 1-st closing round bracket at pos.#="+ic2+
      " -bad format";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg+"\n" );
    return errorMsg;
  };
  //.. got Equal sign after 1-st closing round bracket
  ic0= ic3 + lenEQS;
  if( ic0 >= lastCh ) {
    errorMsg= methName+": missing next expected round brackets after pos.#="+ic3+
      " -bad format";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg+"\n" );
    return errorMsg;
  };
  var ic4= -1;
  if( word.substr(ic0).startsWith(OBR) ) {
    //.. found
    ic4= ic0;
  }
  else {
    errorMsg=
      methName+": no 2-nd open round bracket after equal sign at pos.#="+ic3+
      " -bad format";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg+"\n" );
    return errorMsg;
  };
  //.. got 2-nd open round bracket
  ic0= ic4 + lenOBR;
  if( ic0 >= lastCh ) {
    errorMsg=
      methName+": missing next expected round bracket after pos.#="+ic4+
        " -bad format";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg+"\n" );
    return errorMsg;
  };
  var ic5= word.indexOf( CBR, ic0 );
  if( ic5 < 0 ) {
   errorMsg=
     methName+": no 2-nd closing round bracket after 2-nd open bracket at pos.#="+
       ic4+" -bad format";
    errMsgBadParm= errorMsg;
      this.logWr( "Error: "+errorMsg+"\n" );
    return errorMsg;
  };
  //.. got 2-nd closing round bracket
  // (also assuming the remaining chars are whitespaces)
  parmNamAndVal.push( word.substring(ic0, ic5) );
  parmNamAndVal.push( val );
  if( traceLvl > 1 )
    this.logWr( methName+": got param: name:["+parmNamAndVal[0]+"]\n value:["+
      parmNamAndVal[1]+"]\n");
  return ''; //.. empty error message means OK
};

exports.reportParamBadFmt = function (
  lineNm, pword, formatErr, perrorFName, pstatFName )
{
  var methName= "reportParamBadFmt";
  this.logWr( methName+": start: the param.name-value format is bad -Error!\n");
  this.logWr( methName+": signalling error via percent = -1 \n");
  var percent=-1;
  var stmsg= '{\"percentage\":'+percent+'}';
  this.updateProcStatus( pstatFName, stmsg );
  this.logWr( methName+": writing the error message into a file "+
    "for next request from the server...");
  procErrorMsg= "Error: Bad Format of the parameter string";
  if( pword != null && pword.length > 0 ) {
    procErrorMsg += ":["+pword+"]";
  };
  var lineNmE= lineNm + 1; //.. line numbering in screen editor starts from 1
  procErrorMsg += "\n  Error found at line #:"+lineNmE;
  procErrorMsg += "\n  Error Details:["+formatErr+"]";
  procErrorMsg += "\n  Please, correct the error and try again.";
  //.. using updateProcStatus to save the error message in a file
  this.updateProcStatus( perrorFName, procErrorMsg );
};

exports.logWr = function ( msg ) {
 // console.log(clName+": logWr: fdL="+this.fdL+" msg:["+msg+"]");
  try {
    fs.appendFileSync( this.fdL, msg, 'utf8' );
  }
  catch( err ) {
    console.log(clName+": log uppend: error:"+err.message );
    throw err;
  };
 // fs.appendFile( this.fdL, msg, 'utf8', (err) => {
 //   if( err ) {
 //     throw err;
 //   }
 // });
};

  //.. processing percentage or error message
exports.updateProcStatus = function ( pstfname, statusMsg ) {
  var methName= "updateProcStatus";
  this.logWr(methName+": start: pstfname:["+pstfname+"]\n");
  var pstfname_p= pstfname+".pre";
  this.logWr(methName+": new status: message["+statusMsg+"]\n");
  var timeStamp = new Date().toISOString();
  this.logWr( methName+": timeStamp:["+timeStamp+"]\n");
  //.. pre-file
  try {
    this.fdPSt= fs.openSync( pstfname_p, 'a' );
  }
  catch( err ) {
    this.logWr(clName+": status file open: error:["+err.message+"]\n");
    throw err;
  }
    this.logWr(methName+": writing status: fdPSt="+this.fdPSt+"\n");
    try {
      fs.appendFileSync( this.fdPSt, statusMsg, 'utf8' );
    }
    catch( err ) {
      this.logWr(clName+": status file append: error: code="+err.code );
      throw err;
    }
    this.logWr(methName+": closing status file: fdPSt="+this.fdPSt+"\n");
    fs.closeSync( this.fdPSt );
    this.logWr(methName+": status file closed - final renaming...\n");
    fs.renameSync( pstfname_p, pstfname );
    this.logWr(methName+": status file renamed - finished.\n");
};

exports.wait = function ( secs ) {
  var methName= "wait";
  this.logWr(methName+": start: secs="+secs+"\n");
  var inStr= String( secs );
 // this.logWr(methName+": inStr:["+inStr+"]\n");
  var s_args= new Array( 0 );
   s_args.push( inStr );
  var tmoutms= 500 +1000*secs;
  var mopts= { timeout: tmoutms };
 // this.logWr(methName+":  mopts:["+ JSON.stringify(mopts)+"]\n");
  var moutObj= Chproc.spawnSync( 'sleep', s_args, mopts);
  this.logWr(methName+": moutObj: status:["+moutObj.status+"](0=ok)\n");
  if( moutObj.error != null ) {
    console.log(methName+": moutObj: Error:["+JSON.stringify(moutObj.error)+"]\n");  }
};
