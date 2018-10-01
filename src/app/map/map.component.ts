import { Component, OnInit } from '@angular/core';
//import {Map}  from 'ol/Map';
import * as ol from "../../../node_modules/ol";
import {olConfig} from "../app.module";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map;
  constructor() {
   
   
   }

  ngOnInit() {
  }

  initOnLocation(){
    let firstPlace = ol.proj.fromLonLat([-1.5,51.5]);
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
    }
  }
}
