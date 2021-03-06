import * as firebase from 'firebase/app';
import { GeoCalcs } from './calcs';
import { ShotsGained } from '../util/calcs'

export class ShotData{
    num: number;
    lie: number;
    sg: number;
    dist: number; // Dist it went
    club = '1W';
    start: firebase.firestore.GeoPoint;
    finish: firebase.firestore.GeoPoint;
    penalty = false;
    outB = false;
    constructor() {
      this.lie = ShotsGained.tee;
    }

    setFinish(p: firebase.firestore.GeoPoint){
      this.finish = p;
      this.calcLength();
      // console.log(this.dist*1.1, " m");
    }
    clubDisp() {
      if (this.penalty) {
        return 'Drop';
      } else if (this.outB) {
        return 'OB';
      } else {
        return this.club;
      }
    }

    // Distance for display
    distDisp(): string {
      let d = GeoCalcs.m2yrd(this.dist);
      let ret = '';
      if ( this.lie === ShotsGained.green ) {
        d *= 3;
        ret = d.toFixed(0) + ' ft';
      } else {
        ret = d.toFixed(1);
      }
      return ret;
    }

    setSG(sg: number){
      this.sg = sg;
    }

    calcLength() {
      if( this.start != null && this.finish != null){
        this.dist = GeoCalcs.dist(this.start.longitude,this.start.latitude,this.finish.longitude,this.finish.latitude);
      }
    }
  }
