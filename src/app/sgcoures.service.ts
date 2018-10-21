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
  id? : string;
  name : string;
  boundary : firebase.firestore.GeoPoint[];
  location:firebase.firestore.GeoPoint;
  holes : object[];
}

export class Hole {
  id:string;
  par:number;
  si:number;
  sg_scr:number;
  cl: firebase.firestore.GeoPoint[];
}

export class Course implements ICourse {
  name : string;
  boundary : firebase.firestore.GeoPoint[];
  location:firebase.firestore.GeoPoint;
  holes:object[];
  constructor(){
    this.name = "";
    this.boundary = new Array<firebase.firestore.GeoPoint>();
    this.location = new firebase.firestore.GeoPoint(51.5,-1.2);
    this.holes = new Array<object>();
  }
} 


@Injectable({
  providedIn: 'root'
})
export class SGCouresService {
  coll_endpoint : string  ='Courses';
  coursesColl: AngularFirestoreCollection<ICourse>;
  //public items : Observable<ICourse[]>;
  //itemObjs : Observable<any[]>;
  //names : string[] = [] ;
  Courses$: Observable<ICourse[]>;
  
  //retrivedCourse : Course = new Course();

  constructor(private db: AngularFirestore){
    this.coursesColl = db.collection<ICourse>(this.coll_endpoint);
    //this.items = this.coursesColl.valueChanges();
    console.log("Ctor service");

    this.Courses$ = this.coursesColl.snapshotChanges().map( actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as ICourse;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }

  GetCourse(id:string):Promise<ICourse>{
    return new Promise((resolve,reject)=>{
      let c:ICourse = new Course();
      let itemDoc: AngularFirestoreDocument<ICourse>;
      itemDoc = this.db.doc<ICourse>(this.coll_endpoint + "/" + id);
      const data = itemDoc.valueChanges();
      data.subscribe((a)=>{
        c.id = a["id"];
        c.name = a["name"];
        c.location = a["location"];
        c.boundary = a["boundary"];
        c.holes = a["holes"];
        
        resolve(c)
        },
        ()=>{console.log("Subscribe error");
        reject("Reject error")})
      }
    )
  }

  Update(id:string, crs:ICourse){
    //let itemDoc: AngularFirestoreDocument<ICourse>;
    //itemDoc = this.db.doc<ICourse>(this.coll_endpoint + "/" + id);
    crs.id = id;
    let dbObj = Object.assign({},crs)
    this.coursesColl.doc(id).update(dbObj);
  }

  Delete(id:string){
    this.coursesColl.doc(id).delete();
  }

  AddNew(c:Course){
    // Should be checking uniqueness?
    let dbObj = Object.assign({},c)
    this.coursesColl.add(dbObj);   // Catch  & then
  }
 
}
