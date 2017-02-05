import {Injectable} from "@angular/core";
import * as _ from 'underscore';
import {OptionPosition} from "../model/option-position";


@Injectable()
export class PositionInputStateService {

  showInput: boolean = false;
  private _position: OptionPosition = null;

  set position(pos: OptionPosition) {
    this._position = _.clone(pos);
  }

  get position() {
    return this._position;
  }

}
