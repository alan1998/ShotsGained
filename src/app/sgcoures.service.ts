import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule, 
          AngularFirestore, 
          AngularFirestoreCollection, 
          AngularFirestoreDocument
        } from '@angular/fire/firestore';
//import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase/app'
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { map } from 'rxjs/operators';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface ICourse {
  name : string;
  boundary : firebase.firestore.GeoPoint[];
  location:firebase.firestore.GeoPoint;
}

export interface ICourseId extends ICourse {
  id : string;
}

export class Course implements ICourse {
  name : string;
  boundary : firebase.firestore.GeoPoint[];
  location:firebase.firestore.GeoPoint;
  constructor(){
    this.boundary = new Array<firebase.firestore.GeoPoint>();
    this.location = new firebase.firestore.GeoPoint(51.5,-1.2);
  }
} 

export class CourseMinInf {
  name:string;
  id:string;
  location:firebase.firestore.GeoPoint;
  constructor(){
    this.location = new firebase.firestore.GeoPoint(51.5,-1.2);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SGCouresService {
  coll_endpoint : string  ='Courses';
  coursesColl: AngularFirestoreCollection<ICourse>;
  public items : Observable<ICourse[]>;
  itemObjs : Observable<any[]>;
  names : string[] = [] ;
  CoursesObs: Observable<ICourseId[]>;
  Courses: CourseMinInf[];
  retrivedCourse$ = new BehaviorSubject<any>({});

  constructor(private db: AngularFirestore){
    this.coursesColl = db.collection<ICourse>(this.coll_endpoint);
    this.items = this.coursesColl.valueChanges();
    console.log("Ctor service");

    this.CoursesObs = this.coursesColl.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ICourse;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  Refresh(){
    this.Courses = new Array<CourseMinInf>();
    this.CoursesObs.subscribe((c:ICourseId[]) => {
      c.forEach((cI:ICourseId)=>{
        console.log(cI.id);
        console.log(cI.name);
        let cInf:CourseMinInf = new CourseMinInf();;
        cInf.id = cI.id;
        cInf.name = cI.name;
        this.Courses.push(cInf);
        })
      }
    ); 
  }

  Init (){
    this.items.subscribe((c:ICourse[]) =>  {
      console.log("Here");
      console.log(c.length)
      c.forEach((v:ICourse)=> {
        console.log(v.name);
        console.log(v.boundary.length);
        v.boundary.forEach((pt)=>{
          console.log(pt["_lat"]);
        })
     });
    });
  }

  GetCourse( id:string){
    
    let itemDoc: AngularFirestoreDocument<ICourse>;
    //item = this.db.collection<ICourse>(this.coll_endpoint, ref => (ref.where ('id','==',id)));
    itemDoc = this.db.doc<ICourse>(this.coll_endpoint + "/" + id);

    const data = itemDoc.valueChanges();
    data.map( data => this.retrivedCourse$.next(data)).subscribe((query) =>{});
    console.log("out " );
  }

  AddNew(c:Course){
    // Should be checking uniqueness?
    let dbObj = Object.assign({},c)
    this.coursesColl.add(dbObj);   // Catch  & then
  }

  ngOnInit(){   //this.items = this.db.collection<Course>(this.coll_endpoint).valueChanges();     
     
    let c : AngularFirestoreDocument<ICourse> = this.db.doc<ICourse>('Courses/Course1');
      
    this.items.forEach(c => {
      var pts = c[0].name ;
      //var obj = c[0].Boundary;
      console.log(pts);
      this.names.push(pts);
    })
    //this.itemObjs = this.db.
    //console.log(c.snapshotChanges.);
  }
}
