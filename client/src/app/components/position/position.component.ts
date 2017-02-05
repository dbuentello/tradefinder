import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as _ from "underscore"
import {OptionPosition} from '../../model/option-position'
import {OptionDataService} from '../../service/option-data.service';
import {PositionInputStateService} from '../../service/position-input-state.service';

@Component({
  selector: 'position',
  templateUrl: 'position.component.html',
  styleUrls: ['position.component.css']
})
export class PositionComponent implements OnInit {

  @Input()
  position: OptionPosition;

  constructor(private optionService: OptionDataService,
              private inputService: PositionInputStateService) {
  }

  ngOnInit() {
  }

  delete() {
    this.optionService.deletePosition(this.position);
  }

  edit() {
    // this.optionService.updatePosition(this.position);
    this.inputService.position = this.position;
    this.inputService.showInput = true;
  }

}
