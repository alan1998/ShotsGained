import { Component } from '@angular/core';

import { SGCouresService, Course } from './sgcoures.service';
import * as firebase from 'firebase/app';
import {MapComponent} from './map/map.component';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
/*
 
  
    Edit page-
    save, delete - sub menu bar ? 
    
    

    
    List page - reposition edit button and add delete with confirmation etc
    duplicat list fix
    Add navigation to round entry
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  srvRef: SGCouresService;

  constructor(public afAuth: AngularFireAuth, srvCourses: SGCouresService) {
    this.srvRef = srvCourses;

  }
  ngOnInit() {
  }
  
}
