import { Component } from '@angular/core';

import { SGCouresService, Course } from './sgcoures.service';
import * as firebase from 'firebase/app'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  srvRef: SGCouresService;
  /* Later change ctor to database
  and get objects
  how does ctor get called ?
  see info on setup proj for database
  and is it evene applySourceSpanToExpressionIfNeeded. Get interface update etc
  how to do array on interface to match firestore array type */
  constructor( srvCourses : SGCouresService){
    this.srvRef = srvCourses;  
  }
  ngOnInit(){
    this.srvRef.Init();
    let c:Course;
    c = new Course;
    c.Name = "Fred";
    c.Boundary.push(new firebase.firestore.GeoPoint(51.5, -1));
    this.srvRef.AddNew(c);
  }
}
