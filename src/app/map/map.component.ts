import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import olMap from "../../../node_modules/ol/Map"
import olView from "../../../node_modules/ol/view"
import olBingSource from "../../../node_modules/ol/source/BingMaps"
import olXYZ from '../../../node_modules/ol/source/XYZ';
import olTileLayer from '../../../node_modules/ol/layer/Tile';
import olControl from '../../../node_modules/ol/control/control';
import olVector from '../../../node_modules/ol/source/vector';
import olVecLayer from '../../../node_modules/ol/layer/vector';
import {Draw, Modify} from '../../../node_modules/ol/interaction';

import { fromLonLat, toLonLat } from '../../../node_modules/ol/proj';

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
  map;
  sourceXYZ: olXYZ;
  source : olBingSource;
  layer: olTileLayer;
  view: olView;
  controls : olControl;
  vectorSrcCL : olVector;
  vecLayer : olVecLayer;
  drawAction : Draw;
  modify : Modify;
    
  constructor() {
    
  }

  @Output("cl-event")
  eventCL = new EventEmitter<string>();
  


  ngOnInit() {
  }

  

  initOnLocation(lon:number, lat:number){
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
      this.layer = new olTileLayer({
        source: this.source
      });
      //this.controls = new  olControl();
      this.vectorSrcCL = new olVector({wrapX: false});
      this.vecLayer = new olVecLayer({source:this.vectorSrcCL});

      this.map = new olMap({target: 'map',
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

  doCentreLine(newLine:boolean){
    if(newLine){
      //Clear any existing and set mode
      if( this.vectorSrcCL !=  null)
        this.vectorSrcCL.clear({fast:true});
      this.map.addInteraction(this.drawAction);
      this.map.addInteraction(this.modify);
      this.drawAction.on('drawend',(evt) => {
        this.map.removeInteraction(this.drawAction);
        this.eventCL.emit("LineAdded");
        console.log("Draw end");
      } );  
    }
    else{
      //Doing an edit of existing line
    }
  }

  getCenterLine(){
    // Return array of points
    if(this.vectorSrcCL.getFeatures() != null){
      let pts = this.vectorSrcCL.getFeatures();
      console.log(pts.length)  
    }
  }
}
