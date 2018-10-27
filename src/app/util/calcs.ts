import * as firebase from 'firebase/app';
import { HoleoutSgService } from 'src/app/holeout-sg.service';

export class GeoCalcs {
    //DIstance between points in lat long as meters
    static dist(lon1:number,lat1:number,lon2:number,lat2:number):number{
        var R = 6371; // Radius of the earth in km
        var dLat = GeoCalcs.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = GeoCalcs.deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(GeoCalcs.deg2rad(lat1)) * Math.cos(GeoCalcs.deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d*1000; 
    }
    static deg2rad(deg:number):number {
        return deg * (Math.PI/180)
    }
    static m2yrd(D_in_M:number):number{
        return D_in_M * 1.09361;
    }
    static centerPt(pts:Array<firebase.firestore.GeoPoint>):firebase.firestore.GeoPoint{
        let ret = new firebase.firestore.GeoPoint(51.5,-1);
        let lat =0;
        let lon =0;
        pts.forEach((p) => {
            lat += p.latitude;
            lon += p.longitude;
        });
        if(pts.length > 0){
            lat /= pts.length;
            lon /= pts.length;
            ret = new firebase.firestore.GeoPoint(lat,lon);
        } 
        return ret;
    }
}

export class ShotsGained{
   static readonly  tee : number = 0;
   static readonly  fairway : number = 1;
   static readonly  rough : number = 2;
   static readonly  hazard : number = 3;
   static readonly  green : number = 4;
   static srvSG:HoleoutSgService;
   
   constructor(private srv : HoleoutSgService){
    //want this as a sttic
    if(ShotsGained.srvSG == null){
        ShotsGained.srvSG = srv;
    }
   }

   static strokesHoleOut(dist:number, lie:number ):number {
        let ret:number = 2;
        switch(lie){
            case ShotsGained.tee:
                let a = ShotsGained.srvSG.getStrokesTee(true);
            break;
            default:
                console.log("Impossible lie");
                break;
        }   
        return ret;
   }
}