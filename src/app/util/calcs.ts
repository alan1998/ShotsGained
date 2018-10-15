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
}