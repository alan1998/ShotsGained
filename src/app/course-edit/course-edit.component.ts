import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { SGCouresService, ICourse, Hole } from '../sgcoures.service';
import { MapComponent } from '../map/map.component'
import { GolfGmapComponent } from '../golf-gmap/golf-gmap.component'
import { GeoCalcs, ShotsGained } from '../util/calcs'


enum PageState{
  view,
  addingHole,
  editHole
};

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css'],
  host: {class: 'mid-container'}
})
export class CourseEditComponent implements OnInit {
  course : ICourse;
  selId : string;
  //@ViewChild(MapComponent) mapView:MapComponent;
  @ViewChild(GolfGmapComponent,{static:false}) mapView:GolfGmapComponent;
  SIs:Array<string>;
  h:Hole;
  vectorSrcCL;
  selHole:number = -1;
  newHoleForm =  new FormGroup({
    newHoleId: new FormControl('',Validators.required),
    newHolePar: new FormControl('',Validators.required),
    newHoleSI: new FormControl('')
  });
  newHoleSG:number;
  newHoleCL:firebase.firestore.GeoPoint[];
  dirty:boolean = false;
  isDeleteConfirmVisible = false;
  showNewHoleNotValid = false;
  sgCalcs: ShotsGained;
  
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

    this.sgCalcs = new ShotsGained();
   }

  /*
    Next:   

    -Map component - 
    Get enablement and verification right -update hole and SG values after line shuffle
    Get map size better
    Repeat of courses on main list
    Show totals for card & normalised to 18
    Make Name field and location a form so can detect edit and dirty so save enabled
    Do form new hole layout with labels
    
		Get showCenterLine to show segment yards
    Prevent navigate off form if dirty without prompt
    

    Add SG (shell of methods ) tables and interpolation to util/ calcs and store not distance
  */
  ngOnInit() {
    this.selId = this.route.snapshot.paramMap.get('id');
    console.log(this.selId);
        
    this.srvDB.GetCourse(this.selId).then((c) => {
      this.course = c;
      console.log("Course selected for edit");
      console.log("Name = " + this.course.id + " Location " +this.course.location.latitude + " : " + this.course.location.longitude);
      
      this.mapView.initOnLocation(this.course.location.longitude,this.course.location.latitude,true);
      if(this.course.holes== null)
        this.course.holes =  new Array<Object>();
      }).catch(()=>{
        console.log("err selecting course to edit")}
      );
      this.mapView.setZoom(16);
  }
 
  onSave(){
    //Could this be new or update?
    // Test from this.course.selid?
    console.log("In save");
    console.log(this.course);
    console.log(this.selId);
    this.srvDB.Update(this.selId,this.course);
    this.dirty = false;
  }

  onSelHole(n:number){
    if(this.state === PageState.view){
      this.selHole = n;
      if(this.course.holes != null){
        let p = GeoCalcs.centerPt(this.course.holes[n]["cl"]);
        this.mapView.setCenter(p);
        this.mapView.showCenterLine(this.course.holes[n]["cl"],false);
      }
    }
  }

  onShiftUp(){
    //Shift selected hole 
    if(this.selHole >= 1  && this.selHole < this.course.holes.length){
      let t = this.course.holes[this.selHole-1];
      this.course.holes[this.selHole-1] = this.course.holes[this.selHole];
      this.course.holes[this.selHole] = t;
      this.selHole -= 1;
      this.onSelHole(this.selHole);
      this.dirty = true;
    }
  }

  onShiftDown(){
    //Shift selected hole down
    if(this.selHole >= 0  && this.selHole <= this.course.holes.length-2){
      let t = this.course.holes[this.selHole+1];
      this.course.holes[this.selHole+1] = this.course.holes[this.selHole];
      this.course.holes[this.selHole] = t;
      this.selHole += 1;
      this.onSelHole(this.selHole);
      this.dirty = true;
    }

  }

  onDeleteHole(){
    if(this.selHole >= 0  && this.selHole < this.course.holes.length){
      //Confirm dialog - has happened
      this.course.holes.splice(this.selHole,1);
      this.dirty = true;
      this.isDeleteConfirmVisible = false;
      this.mapView.showCenterLine(null,false);
    }
  }

  onClickUpdateLocation(){
    this.mapView.getCenter().then(p=> {
      this.course.location = p;
      this.dirty = true;
    });
  }

  onEditHole(){
    if(this.state === PageState.view && this.selHole >= 0){
      this.state = PageState.editHole; 
      this.mapView.enableInteraction(true);
      this.newHoleForm.setValue({'newHoleId' : this.course.holes[this.selHole]["id"],
          'newHolePar': this.course.holes[this.selHole]["par"],
          'newHoleSI': this.course.holes[this.selHole]["si"]
      });
      this.newHoleSG =  this.course.holes[this.selHole]["sg_scr"];
      this.newHoleCL = this.course.holes[this.selHole]["cl"];
    }
  }

  onAddHole(){
    // TODO enable/show form enable button for centre line etc
    if(this.state === PageState.view){
      this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
      //Todo also clear on map
      this.state = PageState.addingHole;
    }
  }
  onNewHoleCancel(){
    this.state = PageState.view;
    this.mapView.enableInteraction(false);
    this.onSelHole(this.selHole);
    this.newHoleForm.reset();
    this.newHoleSG = null;
  }

  onNewHoleSubmit(){
    //Todo validate?
    let bOk:boolean = true;
    let h = new Hole();
    h.id = this.newHoleForm.value["newHoleId"];
    h.id = h.id.replace(/\s*$/,"");
    h.id = h.id.replace(/^\s*/,"");
    h.par = this.newHoleForm.value["newHolePar"];
    let si = this.newHoleForm.value["newHoleSI"];
    h.si = parseInt(si==null? null:si.toString());
    h.sg_scr = this.newHoleSG;
    h.cl = this.newHoleCL;

    if((h.id==null || h.id=="") ||
      (h.par==null) ||
      (h.cl==null || h.cl.length < 2)){
      bOk = false;
    }
    if(bOk){
      
      //Todo use the get accessors here
      if(this.course.holes== null){
        this.course.holes =  new Array<Object>();
      }
      if(this.state == PageState.addingHole){
        this.course.holes.push(Object.assign({},h));
      }
      else{
        //Editing existing
        this.course.holes[this.selHole] = Object.assign({},h);
      }  
      //Clear form
      this.newHoleForm.reset();
      this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
      this.mapView.doClearCenterLine();
      this.mapView.enableInteraction(false);
      this.newHoleSG = -1;
      this.dirty =true;
      this.state = PageState.view;
      this.selHole = -1;
    }
    else{
      console.log("Show hole not valid");
      this.showNewHoleNotValid = true;
    }
  }

  onDoCenterLine(){
    // New or edit ?
    
    //Is possible this time?
    if(this.state != PageState.view){      
      this.mapView.doCenterLine(true);
    }
  }

  onCLEvent($event){
    if($event == "LineModified" || $event=="LineAdded"){
      let pts = this.mapView.getCenterLine();
      let dSum = 0;
      this.newHoleCL = new Array<firebase.firestore.GeoPoint>();
      pts.forEach((p)=>{
        this.newHoleCL.push(new firebase.firestore.GeoPoint(p.lat,p.lng));
      });
      let d = GeoCalcs.m2yrd(GeoCalcs.lineLengthGoogle(pts));
      this.newHoleSG = this.sgCalcs.strokesHoleOut(d,ShotsGained.tee, false)
      this.mapView.showLineLengths(pts);
    }
  }
}
