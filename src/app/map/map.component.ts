import { Component, OnInit } from '@angular/core';

import olMap from "../../../node_modules/ol/Map"
import olView from "../../../node_modules/ol/view"
import olBingSource from "../../../node_modules/ol/source/BingMaps"
import olXYZ from '../../../node_modules/ol/source/XYZ';
import olTileLayer from '../../../node_modules/ol/layer/Tile';
import { fromLonLat } from '../../../node_modules/ol/proj';

import {olConfig} from "../app.module";

/* Next todo

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
        key : olConfig.apikey,
        imagerySet: 'Aerial',
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        maxZoom: 19 
      });
      this.layer = new olTileLayer({
        source: this.source
      });

      this.map = new olMap({target: 'map',
        layers: [this.layer],
        view: this.view
      });
    }
    else{
      this.view.setCenter(firstPlace);
    }
    //let s = new olBingSource()
    //let v = new ol.Map({ view: new ol.View({ center: [0, 0], zoom: 1 }), layers: [ new layer.Tile({ source: new ol.source.OSM() }) ], target: 'map' });
    /*
    if(this.map == null){
      this.map = new ol.map({
        layers:[
          new ol.layer.Tile({
            source : new ol.source.BingMaps({
              key : olConfig,
              imagerySet: 'Aerial',
              // use maxZoom 19 to see stretched tiles instead of the BingMaps
              // "no photos at this zoom level" tiles
              maxZoom: 19 
            })
          })
        ],
        target: 'map',
        controls: ol.control.defaults({
          attributionOptions: ({
            collapsible:false
          })
        }),
        view: new ol.View({
          center: firstPlace,
          zoom:15
        })
      })
    }*/
  }
}
