import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { SGCouresService, Course } from '../sgcoures.service';

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit {

  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private srvDB : SGCouresService
  ) { }

  ngOnInit() {
    var id = this.route.snapshot.paramMap.get('id');
    console.log(id);
  }

}
