import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFirestoreModule, 
  AngularFirestore, 
  AngularFirestoreCollection, 
  AngularFirestoreDocument
} from '@angular/fire/firestore';

export interface IRound {
  id? : string;
  where : string;
  //when : firebase.firestore.Timestamp;
  when : string;
  note : string;
}

export class Round implements IRound {
  where : string;
  when : string;//firebase.firestore.Timestamp;
  note : string;
  constructor(){
    this.where = "";
    this.when = "";//new firebase.firestore.Timestamp(1000,0);
    this.note = "";
  }
} 

@Injectable({
  providedIn: 'root'
})
export class SGRoundsService {
  coll_endpoint : string  ='Rounds';
  roundsColl: AngularFirestoreCollection<IRound>;

  constructor(private db: AngularFirestore) {
    this.roundsColl = db.collection<IRound>(this.coll_endpoint);
   }

  addNew(r:Round){
    // Should be checking uniqueness?
    let dbObj = Object.assign({},r)
    this.roundsColl.add(dbObj);   // Catch  & then
  }
}
