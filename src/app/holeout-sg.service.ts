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

export class DistSG{
  d:number;
  s:number;

  constructor(dist:number,sg:number){
    this.d = dist;
    this.s = sg; 
  }
}

@Injectable({
  providedIn: 'root'
})
export class HoleoutSgService {
  coll_endpoint : string  ='SGTables';
  dataColl: AngularFirestoreCollection<object>;

  constructor(private db: AngularFirestore) {
    this.dataColl = db.collection<object>(this.coll_endpoint);  
  }

  //Need an observable rather than static array? and promises
  getStrokesTee(bScratch:boolean):Promise<DistSG[]>{
    let sTable:string;
    if(bScratch){ sTable= "ScrT";}
    else { sTable = "ProT";}

    return new Promise((resolve,reject)=>{
      let t = new Array<DistSG>();
      let itemDoc: AngularFirestoreDocument<any[]>;
      itemDoc = this.db.doc<any[]>(this.coll_endpoint + "/" + sTable);
      const data = itemDoc.valueChanges();
      data.subscribe((a)=>{
        for(var d in a){
          //console.log(d,a[d]);
          t.push(new DistSG(parseFloat(d),a[d]));
        }
        resolve(t)
        },
        ()=>{console.log("Subscribe error");
        reject("Reject error")})
      }
    )
    
  }
}
