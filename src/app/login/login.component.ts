import { Component, OnInit} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

//import {RouterModule } from '../app.component'
/*
  Next style / position login prompt a bit
  Navigate to course list on sucessful login
  Put router guards in place
*/

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  host: {class: 'mid-container'}
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth, public router: Router) { }

  ngOnInit() {
    console.log('Init Login');
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then((v) => {
      console.log(v);
      this.router.navigate(['/list',0]);
      
    }).catch((r) => {
      console.log(r);
    });
    
    
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
