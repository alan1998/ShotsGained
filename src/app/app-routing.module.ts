import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes} from '@angular/router';

import { CourseListComponent } from './course-list/course-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { ManRndComponent } from 'src/app/man-rnd/man-rnd.component';
import { LoginComponent } from 'src/app/login/login.component';


const routes: Routes = [
  {path: 'edit/:id', component : CourseEditComponent},
  {path: 'man-rnd/:id', component : ManRndComponent},
  {path: 'list', component : CourseListComponent},
  {path: '', component : LoginComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {enableTracing: true}),
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
