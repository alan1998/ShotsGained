import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  ngOnInit(){
    //const collection: AngularFirestoreCollection<Item> = aft.collection('items')

    //collection.update(data)
    //collection.delete()
  }
}
