import { Component, Input, OnInit } from '@angular/core';

import { StockOptionDatum } from '../../model/stock-option-datum'

@Component({
  selector: 'stock-option-datum',
  templateUrl: 'stock-option-datum.component.html',
  styleUrls: ['stock-option-datum.component.css']
})
export class StockOptionDatumComponent implements OnInit {

  @Input()
  stockOptionDatum: StockOptionDatum;

  constructor() {
  }


  ngOnInit() {
  }


}
