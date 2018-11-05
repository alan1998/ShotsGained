import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import Map from "../../../node_modules/ol/Map"
import olFeature  from "../../../node_modules/ol/feature";
import olView from "../../../node_modules/ol/view"
import olBingSource from "../../../node_modules/ol/source/BingMaps"
import olXYZ from '../../../node_modules/ol/source/XYZ';
import olTileLayer from '../../../node_modules/ol/layer/Tile';
import olControl from '../../../node_modules/ol/control/control';
import olVector from '../../../node_modules/ol/source/vector';
import olVecLayer from '../../../node_modules/ol/layer/vector';
import olStyle from '../../../node_modules/ol/style/style';
import olTextStyle from '../../../node_modules/ol/style/text';
import olFillStyle from '../../../node_modules/ol/style/fill';
import olStrokeStyle from '../../../node_modules/ol/style/stroke';
import olImageStyle from '../../../node_modules/ol/style/image';

import {Draw, Modify} from '../../../node_modules/ol/interaction';
import {LineString, Point as olPoint } from "../../../node_modules/ol/geom";
import { fromLonLat, toLonLat } from '../../../node_modules/ol/proj';
//import { Coordinate } from "../../../node_modules/ol/coordinate";
import { GeoCalcs } from '../util/calcs'

import { environment } from '../../environments/environment';
//import {olConfig} from "../app.module";

/* Next todo
  Switch sources from a control?
*/

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map : Map;
  sourceXYZ: olXYZ;
  source : olBingSource;
  layer: olTileLayer;
  view: olView;
  controls : olControl;
  vectorSrcCL : olVector;
  vecLayer : olVecLayer;
  drawAction : Draw;
  modify : Modify;
  distStyle : olTextStyle;
    
  constructor() {
    
  }

  @Output("cl-event")
  eventCL = new EventEmitter<string>(true);
 
  ngOnInit() {
  }

  initOnLocation(lon:number, lat:number, bPhoto:boolean){
    let firstPlace = fromLonLat([lon,lat]);
    if(this.map==null){
      this.view = new olView({ center: firstPlace, zoom: 15 });
      this.sourceXYZ = new olXYZ({
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'
      });
      this.source = new olBingSource({
        key : environment.olConfig.apikey,
        imagerySet: 'Aerial',
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        maxZoom: 19 
      });
      if(bPhoto){
        this.layer = new olTileLayer({
          source: this.source
        });
      }
      else{
        this.layer = new olTileLayer({
          source: this.sourceXYZ
        });
      }
      //Create a text style for distances`
      this.distStyle = new olTextStyle({
        text:"help",
        textAlign:'left',
        textBaseline: 'bottom',
        fill: new olFillStyle({color: 'Black'}),
        stroke: new olStrokeStyle({color: 'rgba(255, 255, 255, 0.5)', width: 2}),
        font:'normal 14px Arial '
      });

      //this.controls = new  olControl();
      this.vectorSrcCL = new olVector({wrapX: false});
      this.vecLayer = new olVecLayer({source:this.vectorSrcCL});

      this.map = new Map({target: 'map',
        layers: [this.layer, this.vecLayer],
        view: this.view,
        controls: []
      });

      // Don't need draw interaction yet but good place to construct it
      this.drawAction = new Draw({
        source : this.vectorSrcCL,
        type : 'LineString'
      });
      
      this.modify =  new Modify({
        source : this.vectorSrcCL
      });
      this.modify.on('modifyend', (evt)=>{
        this.eventCL.emit("LineModified");
      });
      
    }
    else{
      this.view.setCenter(firstPlace);
    }
  }

  getCenterLoc(){
    let loc = this.view.getCenter();
    loc = toLonLat(loc);
    console.log(loc);
    return loc;
  }
  enableInteraction(en:boolean){
    if(en){
      this.map.addInteraction(this.modify);
    }
    else{
      let r = this.map.removeInteraction(this.modify);
      if(r==undefined){
        console.log("Remove not found");
      }
    }    
  }

  doCenterLine(newLine:boolean){
    if(newLine){
      //Clear any existing and set mode
      if( this.vectorSrcCL !=  null){
        this.vectorSrcCL.clear({fast:true});}
      this.map.addInteraction(this.drawAction);
    
      this.drawAction.on('drawend',(evt) => {
        let r = this.map.removeInteraction(this.drawAction);
        if(r==undefined){
          console.log("Remove not found in doCenterLine");
        }
        this.eventCL.emit("LineAdded");
        console.log("Draw end");
      } );  
    }
    else{
      //Doing an edit of existing line
    }
  }

  doClearCenterLine(){
    if( this.vectorSrcCL !=  null)
      this.vectorSrcCL.clear({fast:true});
  }

  showCenterLine(cl:Array<firebase.firestore.GeoPoint>){
    this.doClearCenterLine();
    if(cl != null){
      let coords = new  Array<any>();
      cl.forEach((p)=>{
        let pt = fromLonLat([p.longitude, p.latitude]);
        coords.push(pt);
      });
      let ls = new LineString(coords);
      let f = new olFeature({
        geometry : ls
      });
      this.vectorSrcCL.addFeature(f);

      // Show length of line
      let d = GeoCalcs.m2yrd(GeoCalcs.lineLength(coords)); 
      let olP = new olPoint(fromLonLat([cl[cl.length-1].longitude, cl[cl.length-1].latitude]));
      let fdist = new olFeature({
        geometry: olP,
        labelPoint: olP,
        name: "dist"
      });
      
      fdist.setId(cl.length);
      let s = new olStyle(this.distStyle);
      let s2 = new olImageStyle({circle :{radius:6,
          fill: {color: 'rgba(0, 255, 0, 0.5)'},
          stroke: {color: 'Green', width: 1}}
          }
      );
      let ss = new Array<olStyle>();
      ss.push(this.distStyle);
      ss.push(s2);
      //fdist.setStyle(ss);
      let o = fdist.getStyle();
      this.vectorSrcCL.addFeature(fdist);
    }
  }

  setCenter(p:firebase.firestore.GeoPoint){
    let pt = fromLonLat([p.longitude, p.latitude]);
    this.view.setCenter(pt);
  }

  getCenterLine():Array<any>{
    // Return array of points
    //How to get feature by id and set the id as 'cl' to begin with?
    let newPts = new Array<any>();
    if(this.vectorSrcCL.getFeatures() != null){
      let fts = this.vectorSrcCL.getFeatures();
      if(fts.length==1){
        let geo = fts[0].getGeometry();
        if(geo.getType()=='LineString'){
          let pts = geo.getCoordinates(); 
          pts.forEach(element => {
            newPts.push(toLonLat(element));
          });
        }
      }  
    }
    return newPts;
  }
}
