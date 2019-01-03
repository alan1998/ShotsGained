import * as firebase from 'firebase/app';
import { LatLngLiteral, LatLngBoundsLiteral } from "@agm/core/services/google-maps-types";

declare function require(url:string);

export class DistSG{
    d:number;
    s:number;
  
    constructor(dist:number,sg:number){
      this.d = dist;
      this.s = sg; 
    }
  }
  
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

    // Calculate line length
    // Should type the array - it is expected to be 2d lat, lon
    static lineLength(pts:Array<any>):number{
        let distRet = 0;
        for(let n =0; n < pts.length-1; n++ ){
            distRet += GeoCalcs.dist(pts[n].lng(),pts[n].lat(),pts[n+1].lng(),pts[n+1].lat());
        }
        return distRet;
    }

    static lineLengthGoogle(pts:Array<LatLngLiteral>){
        let distRet = 0;
        for(let n =0; n < pts.length-1; n++ ){
            distRet += GeoCalcs.dist(pts[n].lng,pts[n].lat,pts[n+1].lng,pts[n+1].lat);
        }
        return distRet;
    }

    static lineLengthGeo(pts:Array<firebase.firestore.GeoPoint>):number{
        let distRet = 0;
        for(let n =0; n < pts.length-1; n++ ){
            distRet += GeoCalcs.dist(pts[n].longitude,pts[n].latitude,pts[n+1].longitude,pts[n+1].latitude);
        }
        return distRet;
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
    static getBounds(pts:Array<firebase.firestore.GeoPoint>):LatLngBoundsLiteral{
        // Get most SW NE for an array (center line) of points
        // Return format needed for maps g maps API
        let latNE:number = -100;
        let lngNE:number = -500;
        let latSW:number = 100;
        let lngSW:number = 0;
        pts.forEach((p)=>{
            if(p.latitude > latNE)
                latNE = p.latitude;
            if(p.latitude < latSW)
                latSW = p.latitude;
            if(p.longitude > lngNE)
                lngNE = p.longitude;
            if(p.longitude < lngSW)
                lngSW = p.longitude;
        });
        let r:LatLngBoundsLiteral = {east:lngNE,west:lngSW,north:latNE,south:latSW}; 
        return r;
    }
}

export class ShotsGained{
    static readonly  tee : number = 0;
    static readonly  fairway : number = 1;
    static readonly  rough : number = 2;
    static readonly  hazard : number = 3;
    static readonly  green : number = 4;
    static scrTee : Array<DistSG>;
    static proTee : Array<DistSG>;
    constructor(){   
    }

    fillTables(a:Array<object>){
    console.log("Fill");
    console.log(a);
    
    if(a.length >= 10){
        if(a[0] != null){
            ShotsGained.proTee = new Array<DistSG>();
            for(const [dist,val] of Object.entries(a[0])){
                console.log(dist,val);
                ShotsGained.proTee.push(new DistSG(parseFloat(dist),val));
            }
        }
        if(a[1] != null){
            ShotsGained.scrTee = new Array<DistSG>();
            for(const [dist,val] of Object.entries(a[1])){
                console.log(dist,val);
                ShotsGained.scrTee.push(new DistSG(parseFloat(dist),val));
            }  
        }
    }
   }

    strokesHoleOut(dist:number, lie:number, bPro :boolean ):number {
        let ret:number = 1;
        if(ShotsGained.scrTee == null){
            let v = require('../../assets/csvjson.json');
            console.log(v);
            this.fillTables(v);
        }
        switch(lie){
            case ShotsGained.tee:
            if( bPro)
                ret = this.interpolateDistStokes(dist,ShotsGained.proTee);
            else
                ret = this.interpolateDistStokes(dist,ShotsGained.scrTee);              
                break;
            default:
                console.log("Impossible lie");
                break;
        };
        return (ret);
    }

    interpolateDistStokes(dist:number, table:Array<DistSG>):number{
        //Linear interpolation in strokes gained table
        let ret = 1;
        if(table != null){
            ret = table[table.length-1].s;
            for(let n=0; n < table.length-1; n++){
                if(table[n].d <= dist && table[n+1].d>dist){
                    let fd = (dist-table[n].d)/(table[n+1].d-table[n].d);
                    let dy = table[n+1].s - table[n].s;
                    ret = table[n].s + fd*dy;
                    break;
                }
            }
        }
        return ret;
    }

}