import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {OptionPosition} from "../../model/option-position";
import {PositionInputStateService} from "../../service/position-input-state.service";
import {OptionDataService} from "../../service/option-data.service";

@Component({
  selector: 'position-input',
  templateUrl: 'position-input.component.html',
  styleUrls: ['position-input.component.css']
})
export class PositionInputComponent implements OnInit {

  @Output()
  canceled: EventEmitter<boolean> = new EventEmitter();

  @Output()
  saved: EventEmitter<OptionPosition> = new EventEmitter();

  constructor(private inputService: PositionInputStateService,
              private optionService: OptionDataService) { }

  ngOnInit() {
  }

  cancelClicked() {
    this.canceled.emit(true);
    this.inputService.showInput = false;
  }

  saveClicked() {
    this.saved.emit(this.inputService.position);
    this.optionService.addPosition(this.inputService.position);
  }

  actionChange(action) {
    this.inputService.position.entryAction = action;
  }

  typeChange(type) {
    this.inputService.position.type = type;
  }

}
