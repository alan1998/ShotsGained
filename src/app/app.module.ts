import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from '@angular/forms';
import { ClarityModule } from "@clr/angular";

import {RouterModule, Routes} from "@angular/router"
//import { routing} from "./app.routing";

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
import { CourseEditComponent } from './course-edit/course-edit.component'

const routes:Routes = [
  {path: "course/edit", component : CourseEditComponent},
  {path: "", component : CourseListComponent},
  {path:'**',component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    CourseListComponent,
    PageNotFoundComponent,
    CourseEditComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    ClarityModule,
    FormsModule,
    RouterModule.forRoot(routes, {enableTracing:true})
  ],
  providers: [SGCouresService],
  bootstrap: [AppComponent]
})
export class AppModule {
  
  //ngOnInit(){
    
  //}
 }
