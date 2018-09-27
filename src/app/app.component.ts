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
    this.srvRef.Refresh();
    let c:Course;
    c = new Course;
    c.name = "Another";
    c.location = new firebase.firestore.GeoPoint( 50.0, -1.5);

    
    // c.Boundary.push(new firebase.firestore.GeoPoint(51.5, -1));
    this.srvRef.AddNew(c);
  }
}
