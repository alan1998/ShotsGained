import { Component } from '@angular/core';

import { SGCouresService, Course } from './sgcoures.service';
import * as firebase from 'firebase/app'
import {MapComponent} from './map/map.component';

/*
  
  Introduce navigations / edit mode so
    just 1 name visible 
    tool to allow centre/location to be set 
    add holes
    edit centre line of holes
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  srvRef: SGCouresService;
  

  constructor( srvCourses : SGCouresService){
    this.srvRef = srvCourses;  
  }
  ngOnInit(){
    this.srvRef.Refresh();
    

  }

  
      
  
}
