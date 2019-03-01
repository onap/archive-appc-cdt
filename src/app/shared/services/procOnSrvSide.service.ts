//.. processing document on the server side
import { Injectable } from '@angular/core';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';

import { UtilityService } from '../../shared/services/utilityService/utility.service';

//const httpOptionsT = {
 // headers: new HttpHeaders({ 'Content-Type': 'text/plain' })
//};

@Injectable(
// { providedIn: 'root' }
)
export class ProcOnSrvSideSvc
{
  clName: string = "ProcOnSrvSideSvc";
  public theUrl: string = "/api/proc_cont";
  public resUrlPfx: string = "/api/get_result";
  public parmsUrlPfx: string = "/api/get_params";
  public taskId: string = '';
  public stringBuf: string;
  public responBuf: string;
  public procResult: string;
  public parmsBuf: string;
  public responObj: any;
 // private respObs: Observable<string>;
  private respObs: Observable<Response>;
  private respObsObj: Observable<Object>;
  public ppartLen: number = 102400; //.. 102912 is too large payload
 // public ppartLen: number = 10240;
  public ppartCnt: number = 0;
  public p_offset: number = 0;
  public interval: any;
  cycleCnt: number;
  cycleMAX: number = 40;
  editorHolder: any;
  templSyncer: any;
  fHeaders: Headers;
  rOptions: RequestOptions;
  noptions = {
    timeOut: 4000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 250
  };
  prevTstampInt: number = 0;
  currTstampInt: number = 0;
  notifDelayMsec: number = 1200;

  constructor(
   // private http: HttpClient,
    private http: Http,
    private utilSvc: UtilityService,
    private nService: NotificationsService )
  {
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": new: start");
    this.fHeaders= new Headers({'Content-Type': 'text/plain'});
    this.rOptions= new RequestOptions({'responseType':0});
  }

  sendToSrv( content: string, editorHolder: any, templSyncer: any ) {
    var methName= "sendToSrv";
    this.stringBuf= content;
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": "+methName+": start: content length="+
        this.stringBuf.length );
    this.editorHolder= editorHolder;
    this.templSyncer= templSyncer;
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": "+methName+": emptying editor...");
    this.editorHolder.editor.session.setValue("temp empty");
    if( this.utilSvc.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": theUrl:["+this.theUrl+"]");
    this.nService.info( "Start processing",
      "sending: content length="+this.stringBuf.length, this.noptions );
    this.taskId= '';
    let contLen= this.stringBuf.length;
    if( this.utilSvc.getTracelvl() > 0 ) 
      console.log(this.clName+": "+methName+": content length="+contLen+
        " ppartLen="+this.ppartLen );
    this.ppartCnt= 1+ Math.floor(contLen / this.ppartLen);
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": "+methName+": ppartCnt="+ this.ppartCnt );
    if( this.ppartCnt > 1 ) {
      if( this.utilSvc.getTracelvl() > 0 )
        console.log(this.clName+": "+methName+": will send multiple parts...");
      this.nService.info( "Start processing", "will send multiple parts...");
      this.prevTstampInt= Date.now();
      this.p_offset= 0;
      let ppart= this.stringBuf.substr( this.p_offset, this.ppartLen );
      if( this.utilSvc.getTracelvl() > 0 )
        console.log(this.clName+": "+methName+": First part:["+ppart+"]");
      //.. first
      this.sendPart( this.theUrl, ppart, 1 );
    }
    else { //.. ppartCnt == 1
      if( this.utilSvc.getTracelvl() > 0 )
        console.log(this.clName+": "+methName+": will send all-in-1");
      this.nService.info( "Start processing",
        "will send all-in-1 part", this.noptions);
      this.prevTstampInt= Date.now();
      //.. single
      var sUrl= this.theUrl+"?part=1of1";
      this.sendPart( sUrl, this.stringBuf, 1 );
    };
  }

  sendPart( postUrl: string, contPart: string, partNum: number ) {
    var methName= "sendPart";
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": "+methName+": start: Url:["+postUrl+"]");
    this.currTstampInt= Date.now();
      let ntDiff= this.currTstampInt - this.prevTstampInt;
      if( this.utilSvc.getTracelvl() > 1 )
        console.log( this.clName+": "+methName+
          ":  prevTstampInt="+this.prevTstampInt+
          " currTstampInt="+this.currTstampInt+" the diff="+ntDiff );
    if( ntDiff > this.notifDelayMsec ) {
      if( this.utilSvc.getTracelvl() > 1 )
        console.log(this.clName+": "+methName+": notif.delay's long enough.");
      this.prevTstampInt= this.currTstampInt;
      this.nService.info( "Transferring file",
        " part Number="+partNum, this.noptions );
    };
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(this.clName+": "+methName+": part length="+ contPart.length );
    this.respObs=
      this.http.post( postUrl, contPart, this.rOptions );
     // this.http.post<string>( postUrl, contPart, httpOptionsT );
   // this.respObs.subscribe( (respo: string) => {
    this.respObs.subscribe( (respo: Response) => {
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": got response:["+respo+"]");
      if( this.utilSvc.getTracelvl() > 1 )
        console.log( this.clName+": "+methName+": json:["+
          JSON.stringify(respo)+"]");
      this.responBuf= respo.text();
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": responBuf:["+this.responBuf+"]");
      if( this.taskId.length < 1 ) {
        if( this.utilSvc.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+
            ": taskId is empty -get it from response");
        let respObj= JSON.parse(this.responBuf);
        if( this.utilSvc.getTracelvl() > 0 )
          console.log( this.clName+": "+methName+": respObj.taskId:["+
            respObj.taskId+"]");
        if( respObj.taskId == null || respObj.taskId.length == 0 ) {
          let errMsg= this.clName+": "+methName+
            ": Error: failed to get taskId from the server response !";
          console.log( errMsg );
          this.nService.error( "Transferring file", errMsg, this.noptions );
          return;
        }
        else { //.. extracted respObj.taskId
          this.taskId= respObj.taskId;
          if( this.utilSvc.getTracelvl() > 0 )
            console.log( this.clName+": "+methName+": obtained new taskId:["+
              this.taskId+"]");
          this.nService.info( "Transferring file",
            "current taskId:["+this.taskId+"]", this.noptions);
        };
      };
      let tpercent= (100.0*partNum/this.ppartCnt).toFixed();
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+
          ": part#="+partNum+" transfer percent="+tpercent );
      this.currTstampInt= Date.now();
      let ntDiff= this.currTstampInt - this.prevTstampInt;
      if( this.utilSvc.getTracelvl() > 1 )
        console.log( this.clName+": "+methName+
          ":  prevTstampInt="+this.prevTstampInt+
          " currTstampInt="+this.currTstampInt+" the diff="+ntDiff );
      if( ntDiff > this.notifDelayMsec ) {
        if( this.utilSvc.getTracelvl() > 1 )
          console.log(this.clName+": "+methName+": notif.delay long enough.");
        this.prevTstampInt= this.currTstampInt;
        this.nService.info( "Transferring file",
          " progress: "+tpercent+" %", this.noptions );
       //" part Number="+partNum+" vs part Count="+this.ppartCnt, this.noptions );
      };
      if( partNum < this.ppartCnt ) {
       // this.nService.info( methName,"need to send more parts...");
        let partN= partNum + 1;
        this.p_offset= this.p_offset + this.ppartLen;
        var ppart= '';
        if( partN < this.ppartCnt ) {
          if( this.utilSvc.getTracelvl() > 0 )
            console.log(this.clName+": "+methName+
              ":  next part is not the last: partN="+partN );
          ppart= this.stringBuf.substr( this.p_offset, this.ppartLen );
        }
        else {
          if( this.utilSvc.getTracelvl() > 0 )
            console.log(this.clName+": "+methName+ ": next part is the last.");
          ppart= this.stringBuf.substr( this.p_offset );
        };
        if( this.utilSvc.getTracelvl() > 0 )
          console.log(this.clName+": "+methName+": next part:["+ppart+"]");
        let nUrl=
          this.theUrl+"?taskId="+this.taskId+"&part="+partN+"of"+this.ppartCnt;
        if( this.utilSvc.getTracelvl() > 0 )
          console.log(this.clName+": "+methName+": next Url:["+nUrl+"]");
        this.sendPart( nUrl, ppart, partN );
      }
      else { //.. partNum == this.ppartCnt
        this.nService.info( "Transferring file",
          "all "+this.ppartCnt+ " parts are sent - check processing...",
          this.noptions);
        var progrUrl= "/api/get_progress?taskId="+this.taskId;
        if( this.utilSvc.getTracelvl() > 0 )
          console.log(this.clName+": "+methName+": progrUrl:["+progrUrl+"]");
        this.showProcProgr( progrUrl );
      };
    },
    error => {
      console.log( this.clName+": "+methName+
        ": got Error:["+JSON.stringify(error)+']');
      this.responBuf= JSON.stringify(error);
      this.nService.error( "Transferring file",
        " Error:["+this.responBuf+"]", this.noptions);
    });
  }

  showProcProgr( proUrl: string ) {
    var methName= "showProcProgr";
    if( this.utilSvc.getTracelvl() > 0 )
      console.log(methName+": start: proUrl:["+proUrl+"]");
    this.cycleCnt= 0;
    this.interval = setInterval( () => {
      if( this.utilSvc.getTracelvl() > 1 )
        console.log(methName+": call getProcProgr");
      this.getProcProgr( proUrl );
    }, 2500 );
  }

  getProcProgr( proUrl: string ) {
    var methName= "getProcProgr";
    if( this.utilSvc.getTracelvl() > 0 )
      console.log( methName+": getProcProgr: start: proUrl:["+proUrl+"]");
    this.cycleCnt++;
    if( this.utilSvc.getTracelvl() > 0 )
      console.log( methName+": cycleCnt="+this.cycleCnt );
    this.nService.info( "Processing",
      "Requesting server status...", this.noptions);
   // this.respObsObj=
   //   this.http.get( proUrl );
    this.respObs=
      this.http.get( proUrl );
   // this.respObs.subscribe( (respo: string) => {
    //this.respObsObj.subscribe( (respo)  => {
    this.respObs.subscribe( (respo: Response) => {
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( methName+": response:["+JSON.stringify(respo)+"]");
      this.responBuf= respo.text();
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( methName+": responBuf:["+this.responBuf+"]");
      let respObj= JSON.parse(this.responBuf);
     // this.responObj= respo; //.. Object
      if( respObj.percentage != undefined &&
          respObj.percentage != null )
      {
        if( this.utilSvc.getTracelvl() > 0 )
          console.log(methName+": got percentage:["+respObj.percentage+"]");
        if( respObj.percentage >= 100.0 ) {
          if( this.utilSvc.getTracelvl() > 0 )
            console.log(methName+": percentage == 100 !");
          this.nService.info( "Processing completed",
            "The server finished: 100% !", this.noptions);
          clearInterval( this.interval );
          if( this.utilSvc.getTracelvl() > 0 )
            console.log(methName+": getting the processing result...");
          this.getProcResult();
        }
      };
      if( this.utilSvc.getTracelvl() > 0 )
        console.log(methName+": cycleCnt="+this.cycleCnt+
          " vs MAX="+this.cycleMAX );
      if( this.cycleCnt > this.cycleMAX ) {
        this.nService.error( "Processing",
          "Too many status requests - stop !",this.noptions );
        clearInterval( this.interval );
      }
    },
    error => {
      console.log( this.clName+": "+methName+":  got Error:["+
        JSON.stringify(error)+']');
      this.responObj= error; //.. as Object
      this.nService.error( "Processing"," Error:["+
         JSON.stringify(error)+']', this.noptions );
      clearInterval( this.interval );
    });
  }

  getProcResult() {
    var methName= "getProcResult";
    let resUrl= this.resUrlPfx+"?taskId="+this.taskId;
    if( this.utilSvc.getTracelvl() > 0 )
      console.log( this.clName+": "+methName+": start: resUrl:["+resUrl+"]");
    this.respObs=
      this.http.get( resUrl, this.rOptions );
     // this.http.get( resUrl, {responseType: 'text'} );
   // this.respObs.subscribe( (respo: string) => {
    this.respObs.subscribe( (respo: Response) => {
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": got response:["+respo+"]");
      if( this.utilSvc.getTracelvl() > 1 )
        console.log( this.clName+": "+methName+": json:["+
          JSON.stringify(respo)+"]");
      this.responBuf= respo.text();
      if( this.utilSvc.getTracelvl() > 1 )
        console.log( this.clName+": "+methName+": responBuf:["+this.responBuf+"]");
      if( this.utilSvc.getTracelvl() == 0 ) {
        let respoBg= this.responBuf.substr(0, 300);
        console.log(this.clName+": "+methName+": response Begin:["+respoBg+"...]");
      };
      this.procResult= this.responBuf;
      this.nService.info( "Processing completed",
        "the result length="+this.procResult.length, this.noptions );
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+
          ": setting response to the editor...");
      this.editorHolder.editor.session.setValue( this.procResult );
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": calling syncTemplate ...");
      this.templSyncer.syncTemplate('1');
      if( this.utilSvc.getTracelvl() > 0 )
        console.log( this.clName+": "+methName+": finished.");
    },
    error => {
      console.log( this.clName+": "+methName+": subscribe Error:["+
        JSON.stringify(error)+']');
      this.procResult= JSON.stringify(error);
      this.nService.error( "Getting Processing result",
        " Error:["+JSON.stringify(error)+']', this.noptions);
    });
  }
}
