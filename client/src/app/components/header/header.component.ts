import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

import {CurrentPageService} from '../../service/current-page.service';
import {StatusService} from '../../service/status.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private pageService: CurrentPageService,
              private statusService: StatusService) { }

  @Output()
  menuClick: EventEmitter<string> = new EventEmitter();

  @Input()
  selectedItem: string;

  @Input()
  status: string;

  ngOnInit() {
  }

  public menuClicked(item: string) {
    this.pageService.currentPage = item;
  }

  private getCurrentDate(): string {
    return (new Date()).toDateString();
  }

}
