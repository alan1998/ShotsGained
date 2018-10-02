import { Component, ViewChild } from '@angular/core';

import { SGCouresService, Course } from './sgcoures.service';
import * as firebase from 'firebase/app'
import {MapComponent} from './map/map.component';

/*
  Stop database changes giving list multiple times over
  Fix size of map
  Introduce navigations / edit mode so
    just 1 name visible 
    tool to allow centre/location to be set 
    add holes
    edit centre line of holes
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  srvRef: SGCouresService;
  @ViewChild(MapComponent) mapView:MapComponent;

  constructor( srvCourses : SGCouresService){
    this.srvRef = srvCourses;  
  }
  ngOnInit(){
    this.srvRef.Refresh();
    let c:Course;
    c = new Course;
    c.name = "Another";
    c.location = new firebase.firestore.GeoPoint( 50.0, -1.5);

    
    // c.Boundary.push(new firebase.firestore.GeoPoint(51.5, -1));
    //this.srvRef.AddNew(c);
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
