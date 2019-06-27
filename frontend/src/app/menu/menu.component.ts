import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kht-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  burgerActive = false;

  constructor() { }

  ngOnInit() {
  }

}
