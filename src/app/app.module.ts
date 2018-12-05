import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule, ClrFormsNextModule, ClrIconModule  } from "@clr/angular";

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebaseConfig;
export const olConfig = environment.olConfig;

import { SGCouresService } from './sgcoures.service';
import { CourseListComponent } from './course-list/course-list.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { AppRoutingModule } from './/app-routing.module';
import { GolfGmapComponent } from './golf-gmap/golf-gmap.component'


import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CourseListComponent,
    PageNotFoundComponent,
    CourseEditComponent,
    GolfGmapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    ClarityModule,
    ClrFormsNextModule,
    ClrIconModule, 
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: olConfig.apikeyG
    })
  ],
  providers: [SGCouresService,
    GoogleMapsAPIWrapper
    ],
  bootstrap: [AppComponent]
})
export class AppModule {
  
  //ngOnInit(){
    
  //}
 }
