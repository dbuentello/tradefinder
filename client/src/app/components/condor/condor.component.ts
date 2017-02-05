import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import * as _ from "underscore"
import { Condor } from '../../model/condor'

@Component({
  selector: 'condor',
  templateUrl: 'condor.component.html',
  styleUrls: ['condor.component.css']
})
export class CondorComponent implements OnInit {

  private _condors: Condor[];
  @Input() set condors(condors) {
    this._condors = condors;
    this._condors && (this._condors = _.sortBy(this._condors, (item: Condor) => item.roc).reverse());
  }

  get condors(): Condor[] {
    return this._condors;
  }

  @Input()
  maxCondors: number = 15;

  @Output() selectedItem : EventEmitter<Condor> = new EventEmitter();

  @Input() selectedCondor: Condor = null;

  constructor() {
  }

  ngOnInit() {
  }

  clicked(condor: Condor) {
    if(this.selectedCondor && this.selectedCondor == condor) {
      this.selectedCondor = null;
      this.selectedItem.emit(null);
    } else {
      this.selectedCondor = condor;
      this.selectedItem.emit(condor);
    }
  }

}
