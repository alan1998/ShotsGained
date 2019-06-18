import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GpsLogPoint } from '../util/calcs';

// Component to display list and hold list of positions
// Raise event when selected so can be displayed on map
// Maybe update from map interaction
/*
  TODO style like hole list on course edit i.e. highlight selection
  Disable after used
*/

@Component({
  selector: 'app-gps-list',
  templateUrl: './gps-list.component.html',
  styleUrls: ['./gps-list.component.css']
})
export class GpsListComponent implements OnInit {
  pts: GpsLogPoint [];
  selShot: number;

  @Output() eventSel = new EventEmitter<firebase.firestore.GeoPoint>(true);

  constructor() { }

  ngOnInit() {
  }

  setPoints(p: GpsLogPoint[]): void {
    this.pts = p;
  }

  onSelect(n): void {
    console.log(this.pts[n]);
    this.selShot=n;
    this.eventSel.emit(this.pts[n].pos);
  }
}
