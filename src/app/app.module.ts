import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from '@angular/forms';
import { ClarityModule } from "@clr/angular";
import { routing} from "./app.routing";

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
export const firebaseConfig = environment.firebaseConfig;
export const olConfig = environment.olConfig;

import { SGCouresService } from './sgcoures.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    ClarityModule,
    FormsModule,
    routing
  ],
  providers: [SGCouresService],
  bootstrap: [AppComponent]
})
export class AppModule {
  
  ngOnInit(){
    
  }
 }
