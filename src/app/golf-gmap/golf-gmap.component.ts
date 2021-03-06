import { Component, OnInit, EventEmitter, Output, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import {AgmCoreModule , AgmMap, GoogleMapsAPIWrapper, MapsAPILoader, AgmPolyline,   } from '@agm/core';
import { GoogleMap, Marker, MarkerOptions, MapOptions, InfoWindow, Polyline, MVCArray,
                  LatLngLiteral, LatLng , LatLngBoundsLiteral, MVCObject } from "@agm/core/services/google-maps-types";


import * as firebase from 'firebase/app';

import { PolylineManager } from '@agm/core/services/managers/polyline-manager';
//import { T } from '@angular/core/src/render3';
import { GeoCalcs } from '../util/calcs'
import { Observable } from 'openlayers';
import { reject } from 'q';
import { ShotData } from '../util/golf-types';
import { runInThisContext } from 'vm';

declare var google: any;

enum DrawMode{
  None,
  Tee,
  Flag,
  Shot,
};



@Component({
  selector: 'app-golf-gmap',
  templateUrl: './golf-gmap.component.html',
  styleUrls: ['./golf-gmap.component.css'],
  host : {class: 'fill-parent'}
})
export class GolfGmapComponent implements OnInit {
  lat: number = 51.678418;
  lng: number = -1.3;
  static readonly DrawMode = DrawMode;
  readonly DrawMode = GolfGmapComponent.DrawMode;
  state:DrawMode = DrawMode.None;
  bMapInit:boolean = false;
  //@ViewChild(AgmMap) mapView:any;
  @ViewChild("map",{static:false}) mapView:any;
  public wrap:GoogleMapsAPIWrapper;
  polyLineMgr:PolylineManager;
  centLine:Polyline;
  centMarkers:Array<any>;
  centLineListener;
  bDrawingCL = false;
  teeMk: any;
  @Output() eventCL = new EventEmitter<string>(true);
  @Output() shotLocEvt = new EventEmitter<LatLng>(true);
  @Output() shotLocDragEvt = new EventEmitter<void >(true);

  constructor(public mapsApiLoader: MapsAPILoader,
      private zone: NgZone,
      /*private wrap: GoogleMapsAPIWrapper*/) {
    this.wrap = new GoogleMapsAPIWrapper(this.mapsApiLoader,this.zone);
    this.polyLineMgr = new PolylineManager(this.wrap,this.zone);
    this.centMarkers = new Array<any>();
   }


  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  initOnLocation(lng: number, lat: number, bPhoto: boolean) {
    if (this.bMapInit ) {
      this.wrap.setCenter({lat: lat, lng: lng});
      this.lat = lat;
      this.lng = lng;
    } else {
      let type = 'roadmap';
      if ( bPhoto ) {
        type = 'satellite'; }
      this.lat = lat;
      this.lng = lng;
      this.wrap.createMap(this.mapView.nativeElement,<MapOptions>{
        streetViewControl: false,
        zoomControl: true,
        mapTypeControl: false,
        mapTypeId: type,
        fullscreenControl: false,
        center: {
          lat: this.lat,
          lng: this.lng
        },
        zoom: 14,
      }).then(m=> {
        let teePos:any;
        this.bMapInit=true;
        let e = this.wrap.subscribeToMapEvent("click");
        this.wrap.getNativeMap().then(m =>{
          m.addListener("click",(evt)=>{
            if(this.state == DrawMode.Tee){
              teePos = evt.latLng;
              this.teeMk = this.makeTeeMarker({lat:teePos.lat(),lng:teePos.lng()});
              this.teeMk.setMap(m);
              this.state = DrawMode.Flag;
            }
            else if(this.state == DrawMode.Flag){
              this.teeMk.setMap(null);
              this.teeMk = null;
              this.state = DrawMode.None;
              //Turn 2 points into poly line of center and show as edit
              let newCl = new Array<firebase.firestore.GeoPoint>();
              newCl.push(new firebase.firestore.GeoPoint(teePos.lat(),teePos.lng()));
              newCl.push(new firebase.firestore.GeoPoint(evt.latLng.lat(),evt.latLng.lng()));
              this.showCenterLine(newCl,true);
            }
            else if(this.state == DrawMode.Shot){
              //Emit event of lat long
              this.shotLocEvt.emit(evt.latLng);
            }
          })
        });
      });
    }
  }

  setZoom(zoom:number){
    this.wrap.setZoom(zoom);
  }

  setCenter(p:firebase.firestore.GeoPoint){
    this.wrap.setCenter({lat:p.latitude,lng:p.longitude});
  }

  setBounds(bnds:LatLngBoundsLiteral):void{
    this.wrap.fitBounds(bnds);
  }

  getCenter():Promise<firebase.firestore.GeoPoint>{
    return new Promise((resolve)=> {
      this.wrap.getCenter().then(p =>{
        let ret = new firebase.firestore.GeoPoint(p.lat(),p.lng());
        resolve(ret);
      })
    });
  }

  enableInteraction(en:boolean){
    if(en){
      //this.map.addInteraction(this.modify);
      if(this.centLine != null){
        this.centLine.setEditable(true);
      }
    }
    else{
      if(this.centLine != null){
        this.centLine.setEditable(false);
      }
    }    
  }

  startManEntry(b:boolean){
    // Manual entry of shots 
    if(b){
      this.state = this.DrawMode.Shot;
      this.wrap.setMapOptions({draggableCursor: 'crosshair'});
    }
    else{
      this.state = this.DrawMode.None;
      this.wrap.setMapOptions({draggableCursor: ''});
    }
  }
  
  doCenterLine(newLine:boolean){
    if(newLine){
      //Clear any existing and set mode
      if( this.centLine !=  null){
        this.doClearCenterLine();
      }
      this.state = DrawMode.Tee; 
    }
    else{
      //Doing an edit of existing line
    }
  }

  doClearCenterLine(){
    //Clear old center line
    if(this.centLine != null){
      google.maps.event.removeListener(this.centLineListener);
      this.centLine.setMap(null);
      this.centLine = null;
      this.doClearCenterMarkers();
    }
  }

  doClearCenterMarkers(){
    if(this.centMarkers != null){
      this.centMarkers.forEach(mk => {
        mk.setMap(null);
        mk = null;
      });
      this.centMarkers = new Array<any>();
    }
  }

  showCenterLine(cl:Array<firebase.firestore.GeoPoint>,bEditable:boolean){
    this.doClearCenterLine();
    let pts = new Array<LatLngLiteral>();
    if(cl != null){
      cl.forEach((p)=>{
        let pt = {lat:p.latitude,lng:p.longitude} ;
        pts.push(pt);
      });
      //Add markers for Tee and distances
      this.showLineLengths(pts);
      let opts = {
        path : pts,
        strokeColor: 'blue',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        zIndex : 2,
      }
      this.wrap.createPolyline(opts).then(l => {
        this.centLine = l;
        this.centLine.setEditable(bEditable);
        this.centLineListener = this.centLine.addListener("mouseup",evt =>{
          this.eventCL.emit("LineModified");
        });        
      });
      
    }
  }

  makeTeeMarker(pt: LatLngLiteral) {
    var mk = new google.maps.Marker({
      position: pt,
      title: 'Tee',
      opacity:0.6,
      zIndex:1,
      //label: {text:"T", color:'white' },
      icon : {
        url:"../../assets/Tee.ico",
        anchor:{x:12,y:12} ,
        labelOrigin:{x:15,y:24},
        scaledSize:{width:24,height:24}
      },
    });
    return mk;
  }

  makeFlagMarker(pt: LatLngLiteral) {
    const mk = new google.maps.Marker({
      position: pt,
      title: 'Flag',
      opacity: 0.6,
      zIndex: 1,
      // label: {text:"T", color:'white' },
      icon : {
        url: '../../assets/Flag.ico',
        anchor: {x: 8, y: 20} ,
        labelOrigin: {x: 15, y: 24},
        scaledSize: {width: 24, height: 24}
      },
    });
    return mk;
  }

  showLineLengths(pts: Array<LatLngLiteral>) {
    this.doClearCenterMarkers();
    if(this.teeMk != undefined){
      this.teeMk.setMap(null);
      this.teeMk = undefined;
    }
    this.wrap.getNativeMap().then( m => {
        this.teeMk = new google.maps.Marker({
        position: {lat:pts[0].lat+0.00003,lng:pts[0].lng+0.00003},
        title: 'Tee',
        opacity:0.6,
        //label: {text:"T", color:'white' },
        icon : {
          url:"../../assets/Tee.ico",
          anchor:{x:12,y:12} ,
          labelOrigin:{x:15,y:15},
          scaledSize:{width:24,height:24}
        },
      })
      this.teeMk.setMap(m);

      //Continue to add distances of segments
      let length:number = 0;
      for(let n=0; n < pts.length-1; n++){
        let t = GeoCalcs.dist(pts[n].lng,pts[n].lat ,pts[n+1].lng,pts[n+1].lat);
        t = GeoCalcs.m2yrd(t);
        length = length + t;
        let distLab = this.MakeTextLabel(t,(pts[n].lng+pts[n+1].lng)/2,(pts[n].lat+pts[n+1].lat)/2); 
        distLab.setMap(m);
        this.centMarkers.push(distLab);
      }
      let endLabel = this.MakeTextLabel(length,(pts[pts.length-1].lng),(pts[pts.length-1].lat));
      endLabel.setMap(m);
      this.centMarkers.push(endLabel);
    })
  }

  MakeTextLabel(dist:number,lng:number,lat:number){
    let mk = new google.maps.Marker({
      position: {lat:lat,lng:lng},
      title: 'Dist',
      opacity:0.6,
      label: {text:dist.toFixed(0), color:'white' },
      icon : {
        url:"../../assets/NoneExistant.ico",       
      },
    });
    return mk;  
  }

  getCenterLine():Array<LatLngLiteral>{
    let newPts = new Array<LatLngLiteral>();
    if(this.centLine != null){
      let path:MVCArray<LatLng> = this.centLine.getPath();
      if(path.getLength()>=1){
        path.forEach(p => {
          let pt = {lat:p.lat(),lng:p.lng()} ;
          newPts.push(pt);
        })
      } 
    }
    return newPts;
  }

  showShotPos(p:firebase.firestore.GeoPoint, colour: string): Promise<any> {
    return new Promise((resolve,reject) => {
      let pt = {lat:p.latitude,lng:p.longitude} ;
      this.wrap.getNativeMap().then( m => {
        let cir =  new google.maps.Circle({
          map: m,
          center: {lat:pt.lat, lng:pt.lng},
          strokeColor: colour,
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: colour,
          fillOpacity: 0.5,
          radius: 1.2,
          draggable: true,
          label: 'L'
        });

        resolve (cir);
      }).catch(e => {
        reject (new DOMException('Problem create shot circle'));
      });
    });
  }

  showShotTrace(s: firebase.firestore.GeoPoint,f: firebase.firestore.GeoPoint, colour: string): Promise<any> {
    return new Promise((resolve,reject) => {
      let ptS = {lat:s.latitude,lng:s.longitude} ;
      let ptF = {lat:f.latitude,lng:f.longitude} ;
      this.wrap.getNativeMap().then( m => {
        let ln =  new google.maps.Polyline({
          map: m,
          path: [{lat: ptS.lat, lng: ptS.lng},{lat: ptF.lat, lng: ptF.lng}],
          strokeColor: colour,
          strokeOpacity: 1.0,
          strokeWeight: 1
        });
        resolve( ln);
      }).catch(e => {
        reject( new DOMException('Problem create shot trace'));
      });
    });
  }

  // TODO pass the event onward to the round component (or other)
  // Also need remove listener and possible drag start so enclosing component can detect which dragend will correspond to?
  addOrRemoveShotPosListener(cir, s: ShotData, bAdd: boolean) {
    if (bAdd) {
      cir.addListener('dragend', ( evt) => {
        console.log(evt);
        s.start = new firebase.firestore.GeoPoint(evt.latLng.lat(), evt.latLng.lng());
        cir.setCenter(evt.latLng);
        this.shotLocDragEvt.emit();
      });
    } else {
      cir.removeListener();
    }
  }


}




