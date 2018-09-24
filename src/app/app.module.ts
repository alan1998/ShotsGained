import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebaseConfig;

import { SGCouresService } from './sgcoures.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule
  ],
  providers: [SGCouresService],
  bootstrap: [AppComponent]
})
export class AppModule {
  
  ngOnInit(){
    
  }
 }
