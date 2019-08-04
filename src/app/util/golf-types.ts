import * as firebase from 'firebase/app';
import { GeoCalcs } from './calcs';

export class ShotData{
    num:number;
    lie:string;
    sg:number;
    dist:number;
    club:string;
    start: firebase.firestore.GeoPoint;
    finish: firebase.firestore.GeoPoint;
    constructor(){

    }

    setFinish(p:firebase.firestore.GeoPoint){
      this.finish = p;
      this.calcLength();
    }

    setSG(sg:number){
      this.sg = sg;
    }

    calcLength() {
      if( this.start != null && this.finish != null){
        this.dist = GeoCalcs.dist(this.start.longitude,this.start.latitude,this.finish.longitude,this.finish.latitude);
      }
    }
  }
