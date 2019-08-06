import * as firebase from 'firebase/app';
import { GeoCalcs } from './calcs';
import { ShotsGained } from '../util/calcs'

export class ShotData{
    num:number;
    lie:number;
    sg:number;
    dist:number; // Dist it went
    //Todo probably need dist start
    club:string;
    start: firebase.firestore.GeoPoint;
    finish: firebase.firestore.GeoPoint;
    constructor(){
      this.lie = ShotsGained.tee;
    }

    setFinish(p:firebase.firestore.GeoPoint){
      this.finish = p;
      this.calcLength();
      //console.log(this.dist*1.1, " m");
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
