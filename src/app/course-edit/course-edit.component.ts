import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms'
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
  selHole:number = -1;
  newHoleForm =  new FormGroup({
    newHoleId: new FormControl('',Validators.required),
    newHolePar: new FormControl('',Validators.required),
    newHoleSI: new FormControl('')
  },{validators:this.valNewHole});
  newHoleSG:number;
  newHoleCL:firebase.firestore.GeoPoint[];
  dirty:boolean = false;
  
  //get newHoleId() {return this.newHoleForm.get("newHoleId");}
  //get newHolePar() {return this.newHoleForm.get("newHolePar");}
  //get newHoleSI() {return this.newHoleForm.get("newHoleSI");}

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
    this.newHoleSG = -1;
   }

  /*
    Next:   
        Button edit hole
        Buttons to shift order up down 
        Get enablement and verification right
		Make button bar part of form so submit functions? Some validation of form and so enable DELETE hole button, add new hole etc
		Function for enablement of buttons - i.e. state variable for page mode
		->Add add button to button bar make function change state etc
        Store in firebase geocoord type array and add to the hole
        Finish other bits of hole form
        Store hole and add to list
		Persist to firebase
        
        Get button states etc correct so new,edit, delete work (and with database)
    Design hole structure/db persistance
    
    Deal with missing SI better on screen
    
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

  valNewHole(g: FormGroup){
    //More specific message about centre line
    //Style around fields 
    console.log('validate new hole');
    // if(this.newHoleForm["newHoleId"] != undefined){
    //   if(this.newHoleForm["newHoleId"].value == ""){
    //     return {'incomplete' : true};
    //   }
    //   if(this.newHoleForm["newHolePar"].value == null){
    //     return {'incomplete' : true};
    //   }
    //   if(this.newHoleCL==null){
    //     if(this.newHoleCL.length < 2){
    //       return{'no_centerline': true};
    //       }
    //     }
    // }
    return {'no_error':true};
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
    if(this.course.holes != null){
      this.mapView.showCenterLine(this.course.holes[n]["cl"]);
      console.log(this.course.holes[n]["par"]);
      this.newHoleForm.setValue({'newHoleId' : this.course.holes[n]["id"],
          'newHolePar': 5 /*this.course.holes[n]["id"]*/,
          'newHoleSI': this.course.holes[n]["si"]
          });
      this.newHoleSG =  this.course.holes[n]["sg_scr"];
    }
    
  }

  onShiftUp(){
    //Shift selected hole 
  }

  onShiftDown(){
    //Shift selected hole down
  }

  onDeleteHole(){
    if(this.selHole >= 0  && this.selHole < this.course.holes.length){
      //Confirm dialog?
      this.course.holes.splice(this.selHole,1);
      this.dirty = true;
    }
  }

  onClickUpdateLocation(){
    let loc = this.mapView.getCenterLoc();
    this.course.location = new firebase.firestore.GeoPoint(loc[1],loc[0]);
  }

  onAddHole(){
    // TODO enable/show form enable button for centre line etc
    if(this.state === PageState.view){
      this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
      //Todo also clear on map
      this.state = PageState.addingHole;
    }
  }

  onNewHoleSubmit(){
    //Todo validate?
    this.state = PageState.view;
    let h = new Hole();
    //Todo use the get accessors here
    h.id = this.newHoleForm.value["newHoleId"];
    h.par = this.newHoleForm.value["newHolePar"];
    h.si = parseInt(this.newHoleForm.value["newHoleSI"].toString());
    h.sg_scr = this.newHoleSG;
    h.cl = this.newHoleCL;
    if(this.course.holes== null)
      this.course.holes =  new Array<Object>();
    this.course.holes.push(Object.assign({},h));
    //todo get the CL array added
    //Clear form
    this.newHoleForm.reset();
    this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
    this.mapView.doClearCenterLine();
    this.newHoleSG = -1;
  }

  onDoCenterLine(){
    // New or edit ?
    this.mapView.doCenterLine(true);
    //Is possible this time?
    if(this.state == PageState.view){
      this.state = PageState.editCL;
      this.doButtonEnable;
      this.mapView.doCenterLine(true);
    }
  }

  onCLEvent($event){
    console.log("CL Event received");
    console.log($event);
    if($event == "LineModified" || $event=="LineAdded"){
      let pts = this.mapView.getCenterLine();
      let dSum = 0;
      this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
      pts.forEach((p)=>{
        this.newHoleCL.push(new firebase.firestore.GeoPoint(p[1],p[0]));
      });
      for(let n =0; n < pts.length-1; n++ ){
        dSum += GeoCalcs.dist(pts[n][0],pts[n][1],pts[n+1][0],pts[n+1][1]);
      }
      this.newHoleSG = GeoCalcs.m2yrd(dSum);
      this.state = PageState.addingHole;
    }
  }
}
