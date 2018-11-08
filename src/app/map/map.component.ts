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
import olStyleCircle from '../../../node_modules/ol/style/Circle';
import {Draw, Modify} from '../../../node_modules/ol/interaction';
import {LineString, Point as olPoint } from "../../../node_modules/ol/geom";
import { fromLonLat, toLonLat } from '../../../node_modules/ol/proj';
//import { Coordinate } from "../../../node_modules/ol/coordinate";
import { GeoCalcs } from '../util/calcs'
import * as firebase from 'firebase/app';
import { environment } from '../../environments/environment';
import { createText } from '@angular/core/src/view/text';
//import {olConfig} from "../app.module";

/* Next todo
  Generalise take a poly line feature and show distances segments and final distance
  Use from showCenterLine and 
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
        this.showLineLengths();
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
      let featCL = new olFeature({
        geometry : ls,
        name : 'centerLine'
      });
      featCL.setId('centerLine');
      //Style line
      let s = new olStyle();
      s.setStroke( new olStrokeStyle({
        color: 'blue',
        width: 2
        })
      );
      let styles = new Array<olStyle>();
      styles.push(s);
      featCL.setStyle(styles);
      this.vectorSrcCL.addFeature(featCL);
      this.showLineLengths();
      // Show tee
      let fTee = this.createTextFeature(cl[0],'T',"tee");
      this.vectorSrcCL.addFeature(fTee);
    }
  }

  showLineLengths(){
    //Check have center line geometry/vector and then
    // calculate overall length and label up points
    if(this.vectorSrcCL != null){
      let fs = this.vectorSrcCL.getFeatures();
      let dist = 0;
      let segs:Array<number>=new Array<number>();
      //First pass through features to get center line and calculate lengths
      let pts = null;
      fs.forEach(f => {
        if( f.id_ == "centerLine"){
          pts = f.getGeometry().getCoordinates();
           
          for(let np=0; np < pts.length-1; np++){
            let p1LL = toLonLat(pts[np]);
            let p2LL = toLonLat(pts[np+1]);
            let t = GeoCalcs.dist(p1LL[0],p1LL[1],p2LL[0],p2LL[1]);
            t = GeoCalcs.m2yrd(t);
            segs.push(t);
            dist += t;
          }
        }
      });
      // 2nd pass to get end and segment text features
      if(pts != null){
        let bFoundDist:boolean = false;
        let segLabels:number = 0;
        for(let n=0; n< fs.length; n++) {
          if( fs[n].id_ == "dist"){
            bFoundDist = true;
            let textStyle = this.createTextStyle(dist.toFixed(0));
            let style = new olStyle();
            style.setText(textStyle);
            let styles = new Array<olStyle>();
            styles.push(style);
            fs[n].setStyle(styles);            
          }
          else if( Number(fs[n].id_) > 0){
            let segN = Number(fs[n].id_);
            let textStyle = this.createTextStyle(segs[segN-1].toFixed(0));
            let style = new olStyle();
            style.setText(textStyle);
            let styles = new Array<olStyle>();
            styles.push(style);
            fs[n].setStyle(styles);
            let LL1 = pts[segN-1];
            let LL2 = pts[segN];
            let pGeom =  new olPoint([(LL1[0]+LL2[0])/2, (LL2[1]+LL1[1])/2]);
            fs[n].setGeometry(pGeom);
            segLabels++;            
          }
        };
        if(!bFoundDist){
          let LL = toLonLat(pts[pts.length-1]);
          let fb:firebase.firestore.GeoPoint = new firebase.firestore.GeoPoint(LL[1], LL[0]);
          let nf = this.createTextFeature(fb,dist.toFixed(0),"dist");
          this.vectorSrcCL.addFeature(nf);
        }
        if(segLabels != segs.length){
          for(let n=segLabels; n < segs.length; n++){
            let LL1 = toLonLat(pts[n]);
            let LL2 = toLonLat(pts[n+1]);
            let fb:firebase.firestore.GeoPoint = new firebase.firestore.GeoPoint((LL1[1]+LL2[1])/2, (LL2[0]+LL1[0])/2);
            let nf = this.createTextFeature(fb,segs[n].toFixed(0),(n+1).toFixed(0));
            this.vectorSrcCL.addFeature(nf);
            console.log(n,segs[n]);
          }
        }  
      }
    }
  }

  createTextFeature(p:firebase.firestore.GeoPoint, txt:string, name:string):olFeature{
    let pt = new olPoint(fromLonLat([p.longitude, p.latitude]));
    //Feature
    let feat = new olFeature({
      geometry: pt,
      labelPoint: pt,
      name: name
    });
    feat.setId(name);
    //Style to go with it
    let textStyle = this.createTextStyle(txt);
    let style = new olStyle();
    style.setText(textStyle);// Set the text style on the style not the text!
    let styles = new Array<olStyle>();
    styles.push(style);
    feat.setStyle(styles);
    return feat;
  }

  createTextStyle(txt:string):olTextStyle{
    return( new olTextStyle({
      text:txt,
      textAlign:'left',
      textBaseline: 'bottom',
      fill: new olFillStyle({color: 'Black'}),
      stroke: new olStrokeStyle({color: 'rgba(255, 255, 255, 0.5)', width: 2}),
      font:'normal 14px Arial '
    }));
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
      if(fts.length>=1){
        for(let n=0; n < fts.length; n++){
          let geo = fts[n].getGeometry();
          if(geo.getType()=='LineString'){
            let pts = geo.getCoordinates(); 
            pts.forEach(element => {
              newPts.push(toLonLat(element));
            });
          }
        }
      }  
    }
    return newPts;
  }
}
