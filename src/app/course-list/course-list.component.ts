import { Component, OnInit ,  ViewChild} from '@angular/core';
import {MapComponent} from '../map/map.component'
import { SGCouresService, Course } from '../sgcoures.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  @ViewChild(MapComponent) mapView:MapComponent;
  srvRef: SGCouresService;

  constructor(srvCourses : SGCouresService) {
    this.srvRef = srvCourses;
   }

  ngOnInit() {
  }

  courseSel(event){
    let v = event.currentTarget.id;
    let cc : Course;
    this.srvRef.GetCourse(v).then((c) => {
      cc = c;
      console.log("Course selected ");
      console.log("Name = " + cc.name + " Location " + cc.location.latitude + " : " + cc.location.longitude);
      this.mapView.initOnLocation(cc.location.longitude,cc.location.latitude);
      }).catch(()=>{
        console.log("err selecting course")}
      );
  }
}
