import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListType } from '../lib';

@Component({
  selector: 'kht-manuscripts',
  templateUrl: './manuscripts.component.html',
  styleUrls: ['./manuscripts.component.scss']
})
export class ManuscriptsComponent {
  readonly manuscripts = [{
    title: "Some manuscript name",
    author: "Arthur the Author",
    manuscripts: 6,
    annotatedLines: "332/4532"
  }, {
    title: "Another manuscript name",
    author: "Another Author",
    manuscripts: 3,
    annotatedLines: "233/2354"
  }]


  constructor(private router: Router) { }

  markManuscript(manuscript: ListType<ManuscriptsComponent['manuscripts']>) {
    this.router.navigate(['/mark-manuscript']);
  }

}
