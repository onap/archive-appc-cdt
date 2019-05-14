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
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');

const options = {
        key: fs.readFileSync(process.env.HTTPS_KEY_FILE),
        cert: fs.readFileSync(process.env.HTTPS_CERT_FILE)
};

var bodyParser = require('body-parser');
var textParser = bodyParser.text({ type: 'text/*' });

const fs = require('fs');

const path = require('path');

const PORT = process.env.PORT || 8080;
const CDT_HOME= process.env.CDT_HOME;
const LOG_DIR=  process.env.LOG_DIR;
const MaxLogSize= process.env.MaxLogSize || 3000000;
//const DIST_FOLDER = path.join(process.cwd(), 'dist');
//const DIST_FOLDER = path.join( CDT_HOME, 'dist');
const LogF = path.join( LOG_DIR, 'ndserver.log' );

var chproc = require("child_process");

//var serverDataSvc = require('./dist/server-data-svc');
var serverDataSvc = require('./server-data-svc');
var logger = require('./srvlogger');

app.get('/getUserRole*', (req, res) => {
  console.log(`get: Start: /getUserRole/* route...`);
  logger.addLog("get: Start: /getUserRole/* route...\n",LogF);
  if( CDT_HOME != null ) {
    logger.addLog("get: CDT_HOME:["+CDT_HOME+"]\n",LogF);
  };
  var respData= serverDataSvc.getUserRoles( req.url );
  logger.addLog("get: /getUserRole/*: typeof response:["+
    (typeof respData)+"]\n",LogF);

  logger.addLog("get: /getUserRole/*: stringify respData:["+
    JSON.stringify(respData).substr(0,300)+"...]\n",LogF);
  if( respData.length != null && respData.length != undefined ) {
    logger.addLog("get: /getUserRole/*: respData.length="+
      respData.length+"\n",LogF);
  } else {
    logger.addLog("get: /getUserRole/*: respData.length not defined !\n",LogF);
  };
  res.status(200).send( respData );
    let timeStamp = new Date().toISOString();
    logger.addLog("get: done: timeStamp:["+timeStamp+"]\n",LogF);
});

app.get('/api/*', (req, res) => {
  console.log(`get: Start: /api/* route...`);
  logger.addLog("get: Start: /api/* route...\n",LogF);
  if( req.url == null ) {
    console.log("get: /api/*: req.url is null !");
    logger.addLog("get: /api/*: req.url is null !\n",LogF);
  }
  else {
   // console.log("get: /api/*: req.url:["+ req.url+"]");
    logger.addLog("get: /api/*: req.url:["+ req.url+"]\n",LogF);
  };
  if( req.hostname == null ) {
    console.log("get: /api/*: req.hostname is null !");
    logger.addLog("get: /api/*: req.hostname is null !\n",LogF);
  }
  else {
   // console.log("get: /api/*: req.hostname:["+ req.hostname+"]");
    logger.addLog("get: /api/*: req.hostname:["+ req.hostname+"]\n",LogF);
  };
  if( req.params != null ) {
   // console.log("get: /api/*: Have req.params ...");
    logger.addLog("get: /api/*: Have req.params ...\n",LogF);
    if( req.params.length != null ) {
     // console.log("get: /api/*: req.params.length="+req.params.length );
      logger.addLog("get: /api/*: req.params.length="+req.params.length+"\n",LogF);
    }
  };
  if( req.socket != null ) {
   // console.log("get: /api/*: Have req.socket ...");
    logger.addLog("get: /api/*: Have req.socket ...\n",LogF);
    if( req.socket.remoteAddress != null ) {
     // console.log("get: /api/*: remoteAddress:["+ req.socket.remoteAddress+"]");
      logger.addLog(
        "get: /api/*: remoteAddress:["+ req.socket.remoteAddress+"]\n",LogF);
    }
    else {
      console.log("get: /api/*: req.socket.remoteAddress is null !");
      logger.addLog("get: /api/*: req.socket.remoteAddress is null !\n",LogF);
    }
  };
  if( CDT_HOME != null ) {
    logger.addLog("get: CDT_HOME:["+CDT_HOME+"]\n",LogF);
  };
  var respData= serverDataSvc.getData( req.url );
  logger.addLog("get: /api/*: typeof response:["+(typeof respData)+"]\n",LogF);
  if( typeof respData == "string" ) {
    logger.addLog("get: /api/*: respData:length="+respData.length+"\n",LogF);
  };
  logger.addLog("get: /api/*: stringify respData:["+
    JSON.stringify(respData).substr(0,300)+"...]\n",LogF);
  if( respData.length != null && respData.length != undefined ) {
    logger.addLog("get: /api/*: respData.length="+respData.length+"\n",LogF);
  } else {
    logger.addLog("get: /api/*: respData.length not defined !\n",LogF);
  };
  res.status(200).send( respData );
    let timeStamp = new Date().toISOString();
    logger.addLog("get: /api/* done: timeStamp:["+timeStamp+"]\n\n",LogF);
});

app.post('/api/*', textParser, (req, res) => {
  console.log(`post: Start: /api/* route...`);
  logger.addLog("post: Start: /api/* route...\n",LogF);
    let timeStamp = new Date().toISOString();
    logger.addLog("post: /api/*: timeStamp:["+timeStamp+"]\n\n",LogF);
  if( req.url == null ) {
    console.log("post: /api/*: req.url is null !");
    logger.addLog("post: /api/*: req.url is null !\n",LogF);
  }
  else {
    console.log("post: /api/*: req.url:["+ req.url+"]");
    logger.addLog("post: /api/*: req.url:["+ req.url+"]\n",LogF);
  };
  if( req.body == null ) {
    console.log("post: /api/*: req.body is null !");
  }
  else {
    console.log("post: /api/*: req.body.length="+req.body.length );
  };
  if( req.headers != null ) {
    console.log("post: /api/*: req.headers.length="+ req.headers.length );
  };
  var remAddr= '';
  if( req.socket != null ) {
    console.log("post: /api/*: Have req.socket ...");
    logger.addLog("post: /api/*: Have req.socket ...\n",LogF);
    if( req.socket.remoteAddress != null ) {
      logger.addLog(
        "post: /api/*: remoteAddress:["+ req.socket.remoteAddress+"]\n",LogF);
      remAddr= req.socket.remoteAddress;
    }
    else {
      console.log("post: /api/*: req.socket.remoteAddress is null !");
      logger.addLog("post: /api/*: req.socket.remoteAddress is null !\n",LogF);
    }
  };
  logger.addLog(
    "post: /api/*: req.params:["+JSON.stringify(req.params)+"]\n",LogF);
  //.. checking url
  var rexpLR= new RegExp(/\/api\/post_logrec/);
  var matchLR= rexpLR.exec( req.url );
  var rspData= 'r_undef';
  if( matchLR ) {
    //.. posting server-side log record
    logger.addLog("post: /api/*: start postLog: remAddr:["+remAddr+"]\n",LogF);
    rspData= serverDataSvc.postSrvLogRec( req.url, req.body, remAddr );
    logger.addLog("post: /api/*: to send: response:["+rspData+"]\n",LogF);
  }
  else { //.. process data request
    logger.addLog("post: /api/*: start procReq: remAddr:["+remAddr+"]\n",LogF);
    rspData= serverDataSvc.procReq( req.url, req.body, remAddr );
    logger.addLog("post: /api/*: to send: response:["+rspData+"]\n",LogF);
    var rspObj= JSON.parse(rspData);
  if( rspObj.respStr != null && rspObj.respStr != undefined ) {
    var respStrLen= rspObj.respStr.length;
    logger.addLog("post: /api/*: respStr length="+respStrLen+"\n",LogF);
    if( respStrLen < 60 ) {
      logger.addLog("post: /api/*: rspObj.respStr:["+rspObj.respStr+"]\n",LogF);
    } else {
      logger.addLog("post: /api/*: rspObj.respStr(part):["+
        rspObj.respStr.substr(0,60)+"]\n",LogF);
    }
  }
  }
  res.status(200).send( rspData );
    timeStamp = new Date().toISOString();
    logger.addLog("post: done: timeStamp:["+timeStamp+"]\n\n",LogF);
});

//.. express.static to serve static files from /browser
//app.get('*.*', express.static(DIST_FOLDER) );
app.get('*.*', express.static(CDT_HOME) );

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  console.log(`get: Start: regular route...`);
  logger.addLog("get: * Start: regular route...\n",LogF);
  if( req.url == null ) {
    console.log("get: req.url is null !");
    logger.addLog("get: * regular route req.url is null !\n",LogF);
  }
  else {
    console.log("get: req.url:["+ req.url+"]");
    logger.addLog("get: * regular route: req.url:["+ req.url+"]\n",LogF);
  };
  if( CDT_HOME != null ) {
    logger.addLog("get: * CDT_HOME:["+CDT_HOME+"]\n",LogF);
  };
  if( req.socket != null ) {
    logger.addLog("get: * Have req.socket ...\n",LogF);
    if( req.socket.remoteAddress != null ) {
      logger.addLog(
        "get: *: remoteAddress:["+ req.socket.remoteAddress+"]\n",LogF);
    }
    else {
      logger.addLog("get: *: req.socket.remoteAddress is null !\n",LogF);
    }
  };
  var respData= serverDataSvc.getData( req.url );
  logger.addLog("get: *: typeof response:["+(typeof respData)+"]\n",LogF);
  if( typeof respData == "string" ) {
    logger.addLog("get: *: respData:length="+respData.length+"\n",LogF);
  };
 // logger.addLog("get: *: respData:["+JSON.stringify(respData)+"]\n",LogF);
  res.status(200).send( respData );
    let timeStamp = new Date().toISOString();
    logger.addLog("get: * done: timeStamp:["+timeStamp+"]\n\n",LogF);
});

// Start up the Node server
https.createServer(options,app).listen(PORT, () => {
  console.log(`Node server: CDT_HOME:[${CDT_HOME}]`);
  console.log(`Node server:  LOG_DIR:[${LOG_DIR}]`);
  console.log(`Node server:  opening Log in the file:[${LogF}]`);
  console.log(`Node server listening on http://localhost:${PORT}`);
 // console.log(" DIST_FOLDER:["+DIST_FOLDER+"]");
  logger.setMaxLogSize( MaxLogSize );
  logger.addLog("\n Node server: start: CDT_HOME:["+CDT_HOME+"]\n",LogF);
  serverDataSvc.setHomeDir( CDT_HOME, LOG_DIR );
});

