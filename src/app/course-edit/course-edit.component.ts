import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { SGCouresService, ICourse, Hole } from '../sgcoures.service';
import { MapComponent } from '../map/map.component'


@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit {
  course : ICourse;
  selId : string;
  @ViewChild(MapComponent) mapView:MapComponent;
  h;
  selHole;

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService
    
  ) { }

  /*
    Next: ngFor to file table from hole array of course (cope with no data)  
        Form for adding hole ( ignore center line for now)

    Design hole structure/db persistance
    Add hole button and hard code to add a hole
    Make save of hole work
    
    Hole:
    id(number),SI,Par, SG_Scr
    Sequence from the array
  */
  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');
    console.log(this.selId);
        
    this.srvDB.GetCourse(this.selId).then((c) => {
      this.course = c;
      console.log("Course selected for edit");
      console.log("Name = " + this.course.id + " Location " +this.course.location.latitude + " : " + this.course.location.longitude);
      
      this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude);
      if(this.course.holes== null)
        this.course.holes =  new Array<Object>();
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
  }
  
  onSave(){
    //Could this be new or update?
    // Test from this.course.selid?
    console.log("In save");
    console.log(this.course);
    console.log(this.selId);
    this.srvDB.Update(this.selId,this.course);
  }

  onClickUpdateLocation(){
    let loc = this.mapView.getCenterLoc();
    this.course.location = new firebase.firestore.GeoPoint(loc[1],loc[0]);
  }

  onAddHole(){
    // TODO enable/show form enable button for centre line etc
    this.selHole = -1;
    let h = new Hole();
    h.id = "3a";
    h.par = 5;
    h.si = 2;
    h.sg_scr = 4.7;
    if(this.course.holes== null)
      this.course.holes =  new Array<Object>();
    this.course.holes.push(Object.assign({},h));
  }
}
