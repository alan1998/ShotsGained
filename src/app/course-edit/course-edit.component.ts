import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms'
import { switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { SGCouresService, ICourse, Hole } from '../sgcoures.service';
import { MapComponent } from '../map/map.component'
import { GeoCalcs } from '../util/calcs'

enum PageState{
  view,
  editCL,
  addingHole
};

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit {
  course : ICourse;
  selId : string;
  @ViewChild(MapComponent) mapView:MapComponent;
  SIs:Array<string>;
  h;
  vectorSrcCL;
  selHole;
  newHoleForm =  new FormGroup({
    newHoleId: new FormControl(''),
    newHolePar: new FormControl(''),
    newHoleSI: new FormControl('')
  });
  newHoleSG:number;

  static readonly PageState = PageState;
  readonly PageState = CourseEditComponent.PageState;
  state:PageState = PageState.view;
 
  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService
    
  ) {
    this.SIs = new Array<string>(18);
    for(let i=1; i <19; i++){
      this.SIs[i-1] = i.toString();
    }
    this.newHoleSG = 4;
   }

  /*
    Next:   
        Form for adding hole 
        Get center line back as lat,lon array
		Function for enablement of buttons - i.e. state variable for page mode
		->Add add button to button bar make function change state etc
		Some validation of form and so enable DELETE hole button, add new hole etc
        Store in firebase geocoord type array and add to the hole
        Finish other bits of hole form
        Store hole and add to list
		Persist to firebase
        When item in list selected - show CL on map?
        Get button states etc correct so new,edit, delete work (and with database)
    Design hole structure/db persistance
    Add hole button and hard code to add a hole
    Make save of hole work
    
    Hole:
    id(number),SI,Par, SG_Scr
    Sequence from the array
  */
  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');
    console.log(this.selId);
        
    this.srvDB.GetCourse(this.selId).then((c) => {
      this.course = c;
      console.log("Course selected for edit");
      console.log("Name = " + this.course.id + " Location " +this.course.location.latitude + " : " + this.course.location.longitude);
      
      this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude);
      if(this.course.holes== null)
        this.course.holes =  new Array<Object>();
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
  }
  
  doButtonEnable(){
    //Handle in CSS?
  }

  onSave(){
    //Could this be new or update?
    // Test from this.course.selid?
    console.log("In save");
    console.log(this.course);
    console.log(this.selId);
    this.srvDB.Update(this.selId,this.course);
  }

  onSelHole(n:number){
    this.selHole = n;
    console.log(this.course.holes[n]["par"]);
    this.newHoleForm.setValue({'newHoleId' : this.course.holes[n]["id"],
        'newHolePar': 5 /*this.course.holes[n]["id"]*/,
        'newHoleSI': this.course.holes[n]["si"]
        });
    this.newHoleSG =  this.course.holes[n]["sg_scr"];
    
  }

  onClickUpdateLocation(){
    let loc = this.mapView.getCenterLoc();
    this.course.location = new firebase.firestore.GeoPoint(loc[1],loc[0]);
  }

  onAddHole(){
    // TODO enable/show form enable button for centre line etc
    if(this.state === PageState.view){
      this.state = PageState.addingHole;
    }
  }

  onNewHoleSubmit(){
    console.log(this.newHoleForm.value);
    console.log(this.newHoleForm.value["newHoleId"]);
    //Todo validate?
    this.state = PageState.view;
    // this.selHole = -1;
    let h = new Hole();
    // let x = this.newHoleForm;
    h.id = this.newHoleForm.value["newHoleId"];
    h.par = parseInt("4");//this.newHoleForm.value["par"]);
    h.si = parseInt(this.newHoleForm.value["si"].toString());
    h.sg_scr = this.newHoleSG;
    if(this.course.holes== null)
      this.course.holes =  new Array<Object>();
    this.course.holes.push(Object.assign({},h));
    //todo get the CL array added
    //Clear form
    //this.newHoleId.setValue( "");
  }

  onDoCenterLine(){
    // New or edit ?
    this.mapView.doCentreLine(true);
    //Is possible this time?
    if(this.state == PageState.view){
      this.state = PageState.editCL;
      this.doButtonEnable;
      this.mapView.doCentreLine(true);
    }
  }

  onCLEvent($event){
    console.log("CL Event received");
    console.log($event);
    if($event == "LineModified" || $event=="LineAdded"){
      let pts = this.mapView.getCenterLine();
      let dSum = 0;
      for(let n =0; n < pts.length-1; n++ ){
        dSum += GeoCalcs.dist(pts[n][0],pts[n][1],pts[n+1][0],pts[n+1][1]);
      }
      this.newHoleSG = GeoCalcs.m2yrd(dSum);
      this.state = PageState.addingHole;
    }
  }
}
