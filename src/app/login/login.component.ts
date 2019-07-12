import { Component, OnInit} from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import { auth } from 'firebase/app';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../core/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  host: {class: 'mid-container'}
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AuthService, public router: Router) { }

  ngOnInit() {
    console.log('Init Login');
    console.log(this.afAuth.user );
  }

  login() {
    this.afAuth.googleLogin().then((u)=> {
      console.log("Login then");
      console.log(this.afAuth.user['uid']);
      //this.router.navigate(['/list'])
    });
    // this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then((v) => {
    //   console.log(v);
    //   this.router.navigate(['/list']);
      
    // }).catch((r) => {
    //   console.log(r);
    // });
    
    
  }
  logout() {
    //this.afAuth.auth.signOut();
    this.afAuth.signOut();
  }
}
