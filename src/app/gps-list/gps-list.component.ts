import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GpsLogPoint } from '../util/calcs';

// Component to display list and hold list of positions
// Raise event when selected so can be displayed on map
// Maybe update from map interaction

@Component({
  selector: 'app-gps-list',
  templateUrl: './gps-list.component.html',
  styleUrls: ['./gps-list.component.css']
})
export class GpsListComponent implements OnInit {
  pts: GpsLogPoint [];
  @Output() eventSel = new EventEmitter<firebase.firestore.GeoPoint>(true);

  constructor() { }

  ngOnInit() {
  }

  setPoints(p: GpsLogPoint[]): void {
    this.pts = p;
  }

  onSelect(n): void {
    this.eventSel.emit(this.pts[n].pos);
  }
}
