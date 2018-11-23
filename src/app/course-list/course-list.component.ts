import { Component, OnInit ,  ViewChild} from '@angular/core';
import {MapComponent} from '../map/map.component'
import { SGCouresService, Course } from '../sgcoures.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  host: {class: 'mid-container'}
})
export class CourseListComponent implements OnInit {
  @ViewChild(MapComponent) mapView:MapComponent;
  srvRef: SGCouresService;
  selId: string;
  selName: string;

  constructor(srvCourses : SGCouresService) {
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
      console.log("Course selected ");
      //console.log("Name = " + cc.name + " Location " + cc.location.latitude + " : " + cc.location.longitude);
      this.mapView.initOnLocation(cc.location.longitude,cc.location.latitude, false);
      
      console.log(c);
      }).catch(()=>{
        console.log("err selecting course")}
      );
  }

  nonSelected() : boolean {
    return this.selId == null;
  }


}
