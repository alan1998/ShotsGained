import { Component, OnInit,AfterViewInit, ViewChild, NgZone } from '@angular/core';
import {AgmCoreModule , AgmMap, GoogleMapsAPIWrapper, MapsAPILoader,  } from '@agm/core';
import { GoogleMap, Marker, MarkerOptions, MapOptions, InfoWindow, Polyline, LatLngLiteral} from "@agm/core/services/google-maps-types";
import * as firebase from 'firebase/app';
import { LatLng } from '@agm/core/services/google-maps-types';
import { PolylineManager } from '@agm/core/services/managers/polyline-manager';

@Component({
  selector: 'app-golf-gmap',
  templateUrl: './golf-gmap.component.html',
  styleUrls: ['./golf-gmap.component.css'],
  host : {class: 'fill-parent'}
})
export class GolfGmapComponent implements OnInit {
  lat: number = 51.678418;
  lng: number = -1.3;
  bMapInit:boolean = false;
  //@ViewChild(AgmMap) mapView:any;
  @ViewChild("map") mapView:any;
  public wrap:GoogleMapsAPIWrapper;
  centLine:Polyline = null;
  

  constructor(public mapsApiLoader: MapsAPILoader,
      private zone: NgZone,
      /*private wrap: GoogleMapsAPIWrapper*/) {
    this.wrap = new GoogleMapsAPIWrapper(this.mapsApiLoader,this.zone);
   }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    // this.wrap.createMap(this.mapViewThe.nativeElement,<MapOptions>{
    //   streetViewControl: false,
    //   zoomControl: true,
    //   mapTypeControl: true,
    //   mapTypeId: 'roadmap',
    //   mapTypeControlOptions: {
    //     mapTypeIds: ['hybrid', 'roadmap', 'satellite'],
    //     position: 1
    //   },
    //   center: {
    //     lat: this.lat,
    //     lng: this.lng
    //   },
    //   zoom: 12
    // });
  }

  initOnLocation(lng:number, lat:number, bPhoto:boolean){
    if(this.bMapInit){
      this.wrap.setCenter({lat:lat,lng:lng});
      this.lat = lat;
      this.lng = lng;
    }
    else{
      let type = 'roadmap';
      if(bPhoto)
        type = 'satellite';
      this.lat = lat;
      this.lng = lng;
      this.wrap.createMap(this.mapView.nativeElement,<MapOptions>{
        streetViewControl: false,
        zoomControl: true,
        mapTypeControl: false,
        mapTypeId: type,
        fullscreenControl:false,      
        center: {
          lat: this.lat,
          lng: this.lng
        },
        zoom: 14
      });
      this.bMapInit=true;
      
    }
  }

  setZoom(zoom:number){
    this.wrap.setZoom(zoom);
  }

  setCenter(p:firebase.firestore.GeoPoint){
    this.wrap.setCenter({lat:p.latitude,lng:p.longitude});
  }

  getCenter():Promise<firebase.firestore.GeoPoint>{
    return new Promise((resolve)=> {
      this.wrap.getCenter().then(p =>{
        let ret = new firebase.firestore.GeoPoint(p.lat(),p.lng());
        resolve(ret);
      })
    });
  }

  /*
  Add show center line method
  How does api hold polylines?
  */
  doClearCenterLine(){
    //Clear old center line
    if(this.centLine != null){
      //Do whatever
      this.centLine.setMap(null);
      this.centLine = null;
    }
  }

  showCenterLine(cl:Array<firebase.firestore.GeoPoint>){
    this.doClearCenterLine();
    let pts = new Array<LatLngLiteral>();
    cl.forEach((p)=>{
      let pt = {lat:p.latitude,lng:p.longitude} ;//fromLonLat([p.longitude, p.latitude]);
      pts.push(pt);
    });
    this.centLine.setPath(pts);
    this.centLine.setOptions({
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.centLine.setMap(this.mapView.nativeElement);
  }
}


