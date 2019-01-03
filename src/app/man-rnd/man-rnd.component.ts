import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { SGCouresService, ICourse, Hole } from '../sgcoures.service';

/*Style the hole select a bit better - pipe to get the id, par, sg, length neat?
Need selection event, also good to get array index from control
When selected find bounds of center line and fit view to it
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

  constructor(    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService) { }

  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');

    this.srvDB.GetCourse(this.selId).then((c) => {
        this.course = c;     
        this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude,true);
        this.holeList = c.holes;
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
      this.mapView.setZoom(16);
      
  }
  onHoleChanged(event):void{
    this.selHole = event.target.selectedIndex-1;
  }

  onAddHole():void{
    this.mapView.showCenterLine(this.course.holes[this.selHole]["cl"],false);
  }
}
