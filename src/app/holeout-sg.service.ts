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

@Injectable({
  providedIn: 'root'
})
export class HoleoutSgService {
  coll_endpoint : string  ='SGTables';
  constructor(private db: AngularFirestore) {
    //this.coursesColl = db.collection<ICourse>(this.coll_endpoint);  
  }

  getStrokesTee(bScratch:boolean):Promise<any[]>{
    let sTable:string;
    if(bScratch){ sTable= "ScrT";}
    else { sTable = "ProT";}

    return new Promise((resolve,reject)=>{
      let t = new Array<any>();
      let itemDoc: AngularFirestoreDocument<any[]>;
      itemDoc = this.db.doc<any[]>(this.coll_endpoint + "/" + sTable);
      const data = itemDoc.valueChanges();
      data.subscribe((a)=>{
        console.log(a);
        t = a;
        
        resolve(t)
        },
        ()=>{console.log("Subscribe error");
        reject("Reject error")})
      }
    )
    
  }
}
