import { Component } from '@angular/core';
import { AngularFireModule } from '@angular/fire/firebase.app.module';
import { AngularFirestoreModule, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';

export interface Course {
  name : string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  coursesCollRef: AngularFirestoreCollection<Course>;


  constructor( private aft: AngularFirestore){
      this.coursesCollRef = this.aft.collection<Course>('Courses');
      
  }
  ngOnInit(){
    
    //const collection: AngularFirestoreCollection<Item> = aft.collection('items')

    //collection.update(data)
    //collection.delete()
  }
}
