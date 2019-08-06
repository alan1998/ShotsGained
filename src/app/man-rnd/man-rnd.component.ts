import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as firebase from 'firebase/app';

import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { SGCouresService, ICourse, Hole } from '../sgcoures.service';
import { SGRoundsService, Round  } from '../sg-rounds.service';
import { GeoCalcs, ShotsGained } from '../util/calcs'
import { TxtFilePos} from '../txt-file-pos'
import { GpsListComponent } from '../gps-list/gps-list.component';
import { ShotData } from '../util/golf-types';

/*

Update table and shot trace as shots added 

Tools for penalty/S&D and remove
Learn how to make dist update in table as shots dragged
Style the hole select a bit better - pipe to get the id, par, sg, length neat?
Take local copy of CL and adjust Tee position to first shot
Do same for hole out
Calc SG for each shot (default end point of shot to hole each time?)
*/

@Component({
  selector: 'app-man-rnd',
  templateUrl: './man-rnd.component.html',
  styleUrls: ['./man-rnd.component.css'],
  host: {class: 'man-rnd-container'}
})
export class ManRndComponent implements OnInit {
  @ViewChild(GolfGmapComponent, {static: false}) mapView: GolfGmapComponent;
  @ViewChild(GpsListComponent, { static: false}) gpsListCmp: GpsListComponent;
  selId: string;
  course: ICourse;
  holeList;
  selHole=0;
  when;
  gpsList: TxtFilePos;
  lastCir: any; // Todo replace with array for current hole
  holeShots: Array<ShotData> = new Array<ShotData>();
  holeShotMarks: Array<any>;
  holeShotTrace: Array<any>;
  holeCentreLine: Array<firebase.firestore.GeoPoint>;
  holeSGOrg: number;
  holeScoreSG: number = 0;
  shotSel: number = -1; //Selection in shot list for hole being edited
  sgCalcs: ShotsGained;

  lies: object [] = [
    {name: 'Tee', code: ShotsGained.tee},
    {name:'Fair', code: ShotsGained.fairway},
    {name:'Rough', code: ShotsGained.rough},
    {name:'Bunker',code: ShotsGained.hazard},
    {name:'Hazard',code: ShotsGained.hazard},
    {name:'Recovery',code: ShotsGained.recovery},
    {name:'Fringe',code: ShotsGained.fairway},
    {name:'Green', code: ShotsGained.green},
  ];

  constructor(    private route: ActivatedRoute,
    private router: Router,
    private srvDB: SGCouresService,
    private srvRnds: SGRoundsService) { 
      this.sgCalcs = new ShotsGained();
    }

  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');

    this.srvDB.GetCourse(this.selId).then((c) => {
        this.course = c;
        console.log("Course selected for round");
        console.log("Name = " + this.course.id + " Location " +this.course.location.latitude + " : " + this.course.location.longitude);
        this.mapView.initOnLocation(this.course.location.longitude, this.course.location.latitude, true);
        this.holeList = c.holes;
        this.mapView.setZoom(16);
        this.mapView.shotLocEvt.subscribe(this.onShotLocEvent);
        
        // this.mapView.shotLocDragEvt.subscribe((p)=>{

        //     this.updateShots();
        //     this.calcHoleSG();
        // });
      }).catch(() => {
        console.log('err selecting course to edit')}
      );
      const dt = new Date(Date.now());
      this.when = dt.toISOString().slice(0, 10);
      
      
  }

  ngAfterViewInit() {
    this.mapView.shotLocDragEvt.subscribe((evt) => {
      console.log(evt.lat(),evt.lng());
      this.updateShots();
      this.calcHoleSG();
      this.holeScoreSG = this.sgCalcs.calcShotSequence(this.holeShots,this.holeCentreLine);
      this.shotTrace();
      console.log(this.holeScoreSG);  
    })
  }

  onHoleChanged(event): void {
    this.selHole = event.target.selectedIndex;
    const cl = this.course.holes[this.selHole]['cl'];
    this.mapView.showCenterLine(cl, false);
    this.mapView.setBounds(GeoCalcs.getBounds(cl));
  }

  onAddHole(): void {
    this.mapView.showCenterLine(this.course.holes[this.selHole]['cl'], false);
    this.mapView.startManEntry(true);
    //if (this.holeShots == null) {
      this.holeShots = new Array< ShotData>();
      if(this.holeShotMarks != null) {
        this.holeShotMarks.forEach(circMk => {
          circMk.setMap( null);
        });
      }
      this.holeShotMarks = new Array<any>();
      this.holeCentreLine = new Array<firebase.firestore.GeoPoint>();
      this.course.holes[this.selHole]['cl'].forEach(p => {
        this.holeCentreLine.push(p);
      });
      let d = GeoCalcs.m2yrd(GeoCalcs.lineLengthGeo(this.holeCentreLine));
      this.holeSGOrg = this.sgCalcs.strokesHoleOut(d,ShotsGained.tee, false)
    //}
    this.calcHoleSG(); 
    this.holeScoreSG = 0;
  }

  onAddShot() : ShotData{
    // Add Shot at end of list
    const s1 = new ShotData();
    s1.num = this.holeShots.length+1;
    this.holeShots.push(s1);
    this.shotSel = -1;
    if(s1.num == 1) {
      this.mapView.doClearCenterLine();
      s1.start = this.course.holes[this.selHole]['cl'][0];
      this.holeCentreLine[0] = s1.start;
      this.calcHoleSG();
    }
    else {
      const off = 0.00005;
      s1.start = new firebase.firestore.GeoPoint(this.holeShots[s1.num-2].start.latitude+off,this.holeShots[s1.num-2].start.longitude+off);
    }
    this.fixMarks();
    this.mapView.showShotPos(s1.start,'yellow').then(mark => {
      this.mapView.addOrRemoveShotPosListener(mark, true);
      this.holeShotMarks.push(mark);
    });
    this.shotSel = s1.num;
    
    this.updateShots();
    return s1;
  }

  onShotRowSelected(n: number) {
    this.fixMarks();
    this.shotSel = n;
    const mk = this.holeShotMarks[n-1];
    mk['draggable'] = true;
    mk.setOptions({
      strokeColor: 'yellow',
      //fillColor: 'red'
    })
  }

  onFileSelected(event) {
    console.log(event.target.files);
    const fName = event.target.files[0];
    this.gpsList = new TxtFilePos();
    // const pts = await this.gpsList.Open(fName);
    this.gpsList.Open(fName).then( pts => {
      console.log(pts);
      this.gpsListCmp.setPoints(pts);
      this.gpsListCmp.eventSel.subscribe(this.onGpsPosSel);
    });

  }

  onLieChanged($event, n: any) {
    if( n>0 && n <= this.holeShots.length ){  
      this.holeShots[n-1].lie = parseFloat( $event.target.value);
      this.calcHoleSG();
      this.holeScoreSG = this.sgCalcs.calcShotSequence(this.holeShots,this.holeCentreLine);
    }  
  }

  onShotLocEvent = (evt: any): void => {
    console.log(evt.lat(), evt.lng());
    this.mapView.startManEntry(false);
  }

  onSaveCard(): void {
    // TODO gather info into a Round class instance
    // For now make it up
    const r: Round =  new Round();
    r.note = ' A note about things';
    r.where = 'TODO';
    const s: Date = new Date( this.when);
    r.when = s.toISOString();
    this.srvRnds.addNew(r);
  }

  /*
    TODO 
    Manage points - i.e. hang on to them some how so can
     - label shot number
     - colour code lie
     - update position from map movement/interaction
    
     Also need to mark used in list
     Fill card for hole as next shot added
     Flag positioned calc strokes gained etc
     Toolbar 
      - add shot manual
      - add from list
      - penalty 
      - flag
      - lie
  */
  onGpsPosSel = (p: firebase.firestore.GeoPoint): void => {
    if (this.lastCir != null) {
      this.lastCir.setMap(null); }
    this.mapView.showShotPos(p, '#ff0000').then( p => {
      this.lastCir = p;
       // TODO upadte stuff as event happens
      this.mapView.addOrRemoveShotPosListener(p, true);
    } );
  }

  // onShotLocDrag(newPos ) {
  //   console.log(newPos.lat());
  //   this.updateShots();
  //   this.calcHoleSG();
  // }

  fixMarks(){
    //Stop marks being draggable
    //Change colour to show not dragabble
    this.holeShotMarks.forEach(mk => {
      mk['draggable'] = false;
      mk.setOptions({
        strokeColor: 'red',
        //fillColor: 'red'
      })
    });
  }

  updateShots() {
    // Cycle through updating end of shot to be start of next
    //this.logShotPos();
    for( let n=0; n < this.holeShotMarks.length; n++){
      this.holeShots[n].start = new firebase.firestore.GeoPoint( this.holeShotMarks[n]['center'].lat(),this.holeShotMarks[n]['center'].lng());
    }
    for(let i=0; i < this.holeShots.length-1; i++ ){
      this.holeShots[i].setFinish( this.holeShots[i+1].start);
      //console.log("shot",i)
    }
    //Adjust hole start point to tee position
    this.holeCentreLine[0] = this.holeShots[0].start;
    //Adjust hole end point to last shot or other way round
    if(this.holeShots[this.holeShots.length-1].finish === undefined){
      console.log('set finish of shot ',this.holeShots.length);
      this.holeShots[this.holeShots.length-1].setFinish(this.holeCentreLine[this.holeCentreLine.length-1]);
    }
    // else{
    //   //Todo set center line end point to known hole position
    // }
    this.holeShots[this.holeShots.length-1].calcLength();
    //this.logShotPos();
  }
  
  calcHoleSG() {
    let d = GeoCalcs.m2yrd(GeoCalcs.lineLengthGeo(this.holeCentreLine));
    this.holeSGOrg = this.sgCalcs.strokesHoleOut(d,ShotsGained.tee, false)
  }

  shotTrace(){
    //If we have any traces clear them from map and daelete
    if(this.holeShotTrace !== undefined){
      this.holeShotTrace.forEach(tr => {
        tr.setMap(null);
      });
    }
    if(this.holeShots.length > 0){
      this.holeShotTrace = new Array<any>();
      this.holeShots.forEach( sh => {
        if(sh.start !== undefined && sh.finish !== undefined){
          this.mapView.showShotTrace(sh.start, sh.finish,'yellow').then(ln => {
            this.holeShotTrace.push(ln);
          });         
        }
      });
    }
  }

  logShotPos() {
    console.log('Hole shot starts, finishes');
    this.holeShots.forEach(s => {
      //console.log(s.start.latitude,s.start.longitude, s.finish.latitude, s.finish.longitude);
    })
  }
}
