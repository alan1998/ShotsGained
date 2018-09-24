import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule, 
          AngularFirestore, 
          AngularFirestoreCollection, 
          AngularFirestoreDocument
        } from '@angular/fire/firestore';
//import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

export interface ICourse {
  Name : string;
  Boundary : any[];
}

export class Course implements ICourse {
  Name : string;
  Boundary : any[];
} 

@Injectable({
  providedIn: 'root'
})
export class SGCouresService {
  coll_endpoint : string  ='Courses';
  coursesColl: AngularFirestoreCollection<ICourse>;
  public items : Observable<ICourse[]>;
  itemObjs : Observable<any[]>;
  nas : string[] = [] ;

  constructor(private db: AngularFirestore){
    this.coursesColl = db.collection<ICourse>(this.coll_endpoint);
    this.items = this.coursesColl.valueChanges();
    console.log("Ctor service");
    
   }

   Init ()
   {
     this.items.subscribe((c:ICourse[]) =>  {
       console.log("Here");
       console.log(c.length)
       c.forEach((v:ICourse)=> {
        console.log(v.Name);
        console.log(v.Boundary.length);
        v.Boundary.forEach((pt)=>{
          console.log(pt["_lat"]);
        })
     });
    });
  }

  AddNew(c:ICourse){
    this.coursesColl.add(c);   // Catch  & then
  }



  ngOnInit(){   //this.items = this.db.collection<Course>(this.coll_endpoint).valueChanges();     
     
     let c : AngularFirestoreDocument<ICourse> = this.db.doc<ICourse>('Courses/Course1');
      
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
