import { Component, OnInit ,  ViewChild} from '@angular/core';
import {MapComponent} from '../map/map.component'
import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { SGCouresService, Course } from '../sgcoures.service';

/* 
  TODO
  Add route to new page/component for round entry
  Basic layout of holes on left map at right
  Get menu items on top menu for edit course and round entry rather than button on component 
*/

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  host: {class: 'mid-container'}
})
export class CourseListComponent implements OnInit {
  @ViewChild(GolfGmapComponent, {static: false}) mapView: GolfGmapComponent;
  srvRef: SGCouresService;
  selId: string;
  selName: string;

  constructor(srvCourses: SGCouresService) {
    this.srvRef = srvCourses;
   }

  ngOnInit() {
  }

  courseSel(event){
    let v = event.currentTarget.id;
    this.selId = v;
    let cc : Course;
    this.srvRef.GetCourse(v).then((c) => {
      cc = c;
      this.selName = c.name;
      this.mapView.initOnLocation(cc.location.longitude,cc.location.latitude, false);
      
      }).catch(()=>{
        console.log("err selecting course")}
    );
  }

  nonSelected() : boolean {
    return this.selId == null;
  }


}
