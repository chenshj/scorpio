import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-header',
  template: '<ng-content></ng-content>'
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
