import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule,  ClrIconModule  } from '@clr/angular';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule} from '@angular/fire/auth';

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebaseConfig;
export const olConfig = environment.olConfig;

import { SGCouresService } from './sgcoures.service';
import { SGRoundsService  } from './sg-rounds.service';
import { CourseListComponent } from './course-list/course-list.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { AppRoutingModule } from './/app-routing.module';
import { GolfGmapComponent } from './golf-gmap/golf-gmap.component';
import { CoreModule } from './core/core.module'
import { AuthService } from './core/auth.service'


import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
import { ManRndComponent } from './man-rnd/man-rnd.component';
import { HoleSummary1 } from './util/calcs';
import { ScoreCardComponent } from './score-card/score-card.component';
import { GpsListComponent } from './gps-list/gps-list.component';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CourseListComponent,
    PageNotFoundComponent,
    CourseEditComponent,
    GolfGmapComponent,
    ManRndComponent,
    HoleSummary1,
    ScoreCardComponent,
    GpsListComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ClarityModule,
    ClrIconModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: olConfig.apikeyG
    }),
    CoreModule
  ],
  providers: [SGCouresService,
    SGRoundsService,
    GoogleMapsAPIWrapper,
    AuthService
    ],
  bootstrap: [AppComponent]
})
export class AppModule {

  // ngOnInit(){

  // }
 }
