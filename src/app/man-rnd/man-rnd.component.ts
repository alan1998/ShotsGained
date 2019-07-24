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
Next on + of hole list start array of hole shot data
Drop list of lies, clubs
Add position to shot data and default first to tee
Style the hole select a bit better - pipe to get the id, par, sg, length neat?

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
  holeShots: Array<ShotData>;
  holeShotMarks: Array<any>;
  shotSel: number = -1; //Selection in shot list for hole being edited

  lies: object [] = [
    {name: 'Tee', ab: 'Te'},
    {name:'Fair', ab: 'Fa'},
    {name:'Rough', ab: 'Ro'},
    {name:'Bunker',ab: 'Ro'},
    {name:'Hazard',ab: 'Ha'},
    {name:'Fringe',ab: 'Fr'},
    {name:'Green', ab: 'Gr'},
  ];

  constructor(    private route: ActivatedRoute,
    private router: Router,
    private srvDB: SGCouresService,
    private srvRnds: SGRoundsService) { }

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
        this.mapView.shotLocDragEvt.subscribe(this.onShotLocDrag);
      }).catch(() => {
        console.log('err selecting course to edit')}
      );
      const dt = new Date(Date.now());
      this.when = dt.toISOString().slice(0, 10);
      
      
  }

  ngAfterViewInit() {
    this.mapView.shotLocDragEvt.subscribe((evt) => {
      // Todo what show moved and how to update data etc
      // Use selected shot and by default that willbe the last
      console.log("Event in man round",evt,this.shotSel);
      this.holeShots[this.shotSel-1].start = new firebase.firestore.GeoPoint(evt.lat(),evt.lng());
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
    //}
   
    
  }

  onAddShot() : ShotData{
    const s1 = new ShotData();
    s1.num = this.holeShots.length+1;
    this.holeShots.push(s1);
    this.shotSel = -1;
    if(s1.num == 1) {
      this.mapView.doClearCenterLine();
      s1.start = this.course.holes[this.selHole]['cl'][0];
      s1.lie = this.lies[0]['ab'];
    }
    else {
      const off = 0.00005;
      s1.start = new firebase.firestore.GeoPoint(this.holeShots[s1.num-2].start.latitude+off,this.holeShots[s1.num-2].start.longitude+off);
    }
    this.mapView.showShotPos(s1.start,'yellow').then(mark => {
      this.mapView.addOrRemoveShotPosListener(mark, true);
      this.holeShotMarks.push(mark);
    });
    this.shotSel = s1.num;
    return s1;
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
    if( n>=0 && n < this.holeShots.length ){
      this.holeShots[n].lie = this.lies[$event.target.value]['ab'];
      console.log(n,$event.target.value, this.holeShots[n]);
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
  onShotLocDrag(newPos ) {
    console.log(newPos.lat());
  }

}
