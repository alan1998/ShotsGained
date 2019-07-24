import * as firebase from 'firebase/app';

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
  }
