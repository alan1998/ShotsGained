import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { SGCouresService, ICourse, Hole } from '../sgcoures.service';

/*Next fill list box with list of holes on the course
  Put a "+ Add Enter" button next to it
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

  constructor(    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService) { }

  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');

    this.srvDB.GetCourse(this.selId).then((c) => {
      this.course = c;      
      this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude,true);
      if(this.course.holes== null)
        this.course.holes =  new Array<Object>();
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
      this.mapView.setZoom(16);
  }

}
