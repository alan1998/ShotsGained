import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManRndComponent } from './man-rnd.component';

describe('ManRndComponent', () => {
  let component: ManRndComponent;
  let fixture: ComponentFixture<ManRndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManRndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManRndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
