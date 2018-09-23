import { Component } from '@angular/core';
import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule, 
          AngularFirestore, 
          AngularFirestoreCollection, 
          AngularFirestoreDocument
        } from '@angular/fire/firestore';
//import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';

export interface Course {
  Name : string;
  Boundary : any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  coll_endpoint : string  ='Courses';
  coursesColl: AngularFirestoreCollection<Course>;
  items : Observable<Course[]>;
  itemObjs : Observable<any[]>;
  nas : string[] = [] ;
  /* Later change ctor to database
  and get objects
  how does ctor get called ?
  see info on setup proj for database
  and is it evene applySourceSpanToExpressionIfNeeded. Get interface update etc
  how to do array on interface to match firestore array type */
  constructor( private db: AngularFirestore){
    this.coursesColl = db.collection<Course>(this.coll_endpoint);
  }
  ngOnInit(){
    //this.items = this.db.collection<Course>(this.coll_endpoint).valueChanges();     
    this.items = this.coursesColl.valueChanges();
    let c : AngularFirestoreDocument<Course> = this.db.doc<Course>('Courses/Course1');
     
    this.items.forEach(c => {
      var pts = c[0].Name ;
      //var obj = c[0].Boundary;
      console.log(pts);
      this.nas.push(pts);
    })
    //this.itemObjs = this.db.
    //console.log(c.snapshotChanges.);
    }
}
