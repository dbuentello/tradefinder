import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';

import {CurrentPageService} from './service/current-page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
  ]
})

export class AppComponent implements OnInit {

  currentPage: string = 'tradefinder';

  constructor(private pageService: CurrentPageService) {
  }

  public ngOnInit():void {
  }

  public menuClicked(item: string) {
    this.currentPage = item;
  }

}
