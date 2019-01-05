import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as firebase from 'firebase/app';

import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { SGCouresService, ICourse, Hole } from '../sgcoures.service';
import { SGRoundsService, Round  } from "../sg-rounds.service";
import { GeoCalcs, ShotsGained } from '../util/calcs'


/*Style the hole select a bit better - pipe to get the id, par, sg, length neat?

*/

@Component({
  selector: 'app-man-rnd',
  templateUrl: './man-rnd.component.html',
  styleUrls: ['./man-rnd.component.css'],
  host: {class: 'man-rnd-container'}
})
export class ManRndComponent implements OnInit {
  @ViewChild(GolfGmapComponent) mapView:GolfGmapComponent
  selId: string;
  course : ICourse;
  holeList;
  selHole;
  when;

  constructor(    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService,
    private srvRnds : SGRoundsService) { }

  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');

    this.srvDB.GetCourse(this.selId).then((c) => {
        this.course = c;     
        this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude,true);
        this.holeList = c.holes;
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
      let dt = new Date(Date.now());
      this.when = dt.toISOString().slice(0,10);
      this.mapView.setZoom(16);
      this.mapView.eventShotLoc.subscribe(this.onShotLocEvent);
      
  }
  onHoleChanged(event):void{
    this.selHole = event.target.selectedIndex;
    let cl = this.course.holes[this.selHole]["cl"];
    this.mapView.showCenterLine(cl, false);
    this.mapView.setBounds(GeoCalcs.getBounds(cl));
  }

  onAddHole():void{
    this.mapView.showCenterLine(this.course.holes[this.selHole]["cl"],false);
    this.mapView.startManEntry(true);
    
  }

  onShotLocEvent = (evt:any):void=>{
    console.log(evt.lat(), evt.lng());
    this.mapView.startManEntry(false);
  }

  onSaveCard():void{
    //TODO gather info into a Round class instance
    // For now make it up
    let r:Round =  new Round();
    r.note = " A note about things";
    r.where = "TODO";
    let s:Date = new Date( this.when);
    r.when = s.toISOString();
    this.srvRnds.addNew(r);
  }
}
