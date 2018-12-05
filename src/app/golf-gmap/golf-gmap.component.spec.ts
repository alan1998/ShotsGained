import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GolfGmapComponent } from './golf-gmap.component';

describe('GolfGmapComponent', () => {
  let component: GolfGmapComponent;
  let fixture: ComponentFixture<GolfGmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GolfGmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GolfGmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
