import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {OptionPosition} from "../../model/option-position";
import {PositionInputStateService} from "../../service/position-input-state.service";
import {OptionDataService} from "../../service/option-data.service";
import * as _ from "underscore";

@Component({
  selector: 'position-input',
  templateUrl: 'position-input.component.html',
  styleUrls: ['position-input.component.css']
})
export class PositionInputComponent implements OnInit, OnDestroy {

  @Output()
  canceled: EventEmitter<boolean> = new EventEmitter();

  @Output()
  saved: EventEmitter<OptionPosition[]> = new EventEmitter();

  showClose: { [positionId: number]: boolean} = {};

  constructor(private inputService: PositionInputStateService,
              private optionService: OptionDataService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.inputService.positions = [];
  }

  cancelClicked() {
    this.canceled.emit(true);
    this.inputService.positions = [];
    this.inputService.showInput = false;
  }

  saveClicked() {
    if(this.inputService.positions) {
      this.saved.emit(this.inputService.positions);
      this.inputService.positions.forEach((position: OptionPosition) => this.optionService.addPosition(position));
    }
    this.inputService.showInput = false;
  }

  closeClicked(position: OptionPosition) {
    this.showClose[position.id] = true;
    position.closingPrice = position.isShort() ? this.optionService.getStockOptionDatum(position).ask : this.optionService.getStockOptionDatum(position).bid;
    position.closingAction = position.isShort() ? 'BTC' : 'STC';

    let date = new Date();
    position.closingDate = '' + date.getFullYear() + (date.getMonth() + 1) + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  }

  actionChange(action, position: OptionPosition) {
    position && (position.entryAction = action);
  }

  closingActionChange(action, position: OptionPosition) {
    position && (position.closingAction = action);
  }

  typeChange(type, position: OptionPosition) {
    position && (position.type = type);
  }

  getSortedPositions(): OptionPosition[] {
    return _.sortBy(this.inputService.positions, (op: OptionPosition) => op.strike);
  }

}
