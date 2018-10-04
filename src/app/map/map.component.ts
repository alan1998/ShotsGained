import { Component, OnInit } from '@angular/core';

import olMap from "../../../node_modules/ol/Map"
import olView from "../../../node_modules/ol/view"
import olBingSource from "../../../node_modules/ol/source/BingMaps"
import olXYZ from '../../../node_modules/ol/source/XYZ';
import olTileLayer from '../../../node_modules/ol/layer/Tile';
import olControl from '../../../node_modules/ol/control/control';
import { fromLonLat } from '../../../node_modules/ol/proj';

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

  constructor() {
   
   
   }

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
      
      this.map = new olMap({target: 'map',
        layers: [this.layer],
        view: this.view,
        controls: []
      });
    }
    else{
      this.view.setCenter(firstPlace);
    }
  }
}
