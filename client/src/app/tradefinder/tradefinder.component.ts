import { Component, OnInit, AfterViewInit } from '@angular/core';
import {Router} from "@angular/router";
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';

import { OptionDataService } from '../service/option-data.service';
import { StockDatum } from '../model/stock-datum';
import { StockOptionDatum } from '../model/stock-option-datum';
import { Spread } from '../model/spread';
import { Condor } from '../model/condor';
import {TradeFilter} from "./trade-filter";
import {PositionInputStateService} from "../service/position-input-state.service";
import {StatusService} from "../service/status.service";
import {CurrentPageService} from "../service/current-page.service";

@Component({
  selector: 'tradefinder',
  templateUrl: 'tradefinder.component.html',
  styleUrls: [
    'tradefinder.component.css',
  ]
})

export class TradefinderComponent implements OnInit {

  data = null;
  showFilter: boolean = false;
  showGraph: boolean = false;

  activeSymbol: string = null;
  selectedCondor: Condor = null;
  selectedPut: Spread = null;
  selectedCall: Spread = null;

  constructor(private optionService: OptionDataService,
              private positionService: PositionInputStateService,
              private statusService: StatusService,
              private pageService: CurrentPageService,
              private router: Router) {
  }

  public ngOnInit():void {
    this.optionService.status.subscribe((msg: string) => {
      this.statusService.status = msg;
    });
  }

  private getSymbols(): string[] {
    if(this.optionService.filter.symbolInput && this.optionService.filter.symbolInput.length) {
      let syms = this.optionService.filter.symbolInput.endsWith(',') ? this.optionService.filter.symbolInput.substr(0, this.optionService.filter.symbolInput.length-1) : this.optionService.filter.symbolInput;
      return syms.split(',').map(s => s.trim()).map(s => s.toUpperCase());
    }

    return this.optionService.symbols;
  }

  private searchSymbols() {
    let completeCb = (filteredSyms: string[]) => {
      this.activeSymbol = filteredSyms && filteredSyms[0];
    };

    this.optionService.getSymbols(this.getSymbols(), this.optionService.filter, completeCb);
  }

  public getStockDatums(): StockDatum[] {
    return this.optionService.stockDatums ? _.values(this.optionService.stockDatums) : [];
  }

  public getStockDatum(symbol: string): StockDatum {
    return this.optionService.stockDatums[symbol];
  }

  public getStockOptionDatums(): StockOptionDatum[] {
    let datums: StockOptionDatum[] = [];
    if(this.optionService.stockOptionDatums) {
      _.values(this.optionService.stockOptionDatums).forEach((item: StockOptionDatum[]) => {
        datums = datums.concat(item);
      })
    }
    return datums;
  }

  private condorSelected(condor: Condor) {
    if(condor) {
      this.selectedCondor = condor;
      this.selectedCall = condor.callSpread;
      this.selectedPut = condor.putSpread;
    } else {
      this.selectedCondor = null;
      this.selectedCall = null;
      this.selectedPut = null;
    }
  }

  private putSelected(spread: Spread) {
    this.selectedCondor = null;
    this.selectedPut = spread;
  }

  private callSelected(spread: Spread) {
    this.selectedCondor = null;
    this.selectedCall = spread;
  }

  private getEarningsUrl(symbol: string): string {
    if(!symbol || !symbol.length) {
      return '';
    }
    return "https://biz.yahoo.com/research/earncal/" + symbol.charAt(0) + "/" + symbol + ".html";
  }

  private selectTab(symbol: string){
    this.activeSymbol = symbol;
    this.selectedCondor = null;
    this.selectedPut = null;
    this.selectedCall = null;
  }

  private getGraphUrl(symbol: string, scale: string) {
    return "https://app.quotemedia.com/quotetools/getChart?webmasterId=89845&toolWidth=317&symbol=" + symbol + "&chscale=" + scale + "&chtype=AreaChart&chfrmon=off&chfrm=cccccc&chbdron=on&chbdr=cccccc&chbg=ffffff&chbgch=FFFFFF&chln=38741A&chfill=ECF4EF&chfill2=ECF4EF&chgrdon=on&chgrd=7D7D7D&chton=on&chtcol=000000&chxyc=7D7D7D&chpcon=on&chpccol=ee0000&chmrg=2&chhig=146&chwid=294"
  }

  private filterChanged() {
    let start: number = (new Date()).getTime();
    this.optionService.calculateCreditSpreads();
    this.optionService.calculateCondors();
    this.statusService.status = "Completed filtering (" + (((new Date()).getTime() - start)/1000) + " secs)";
  }

  private showFilterClicked() {
    this.showFilter = !this.showFilter;
  }

  private addCondorPosition(condor: Condor) {
    this.positionService.addCondorPosition(condor);
    this.positionService.showInput = true;
    this.pageService.currentPage = 'positions';
  }

  private addSpreadPosition(spread: Spread) {
    this.positionService.addSpreadPosition(spread);
    this.positionService.showInput = true;
    this.pageService.currentPage = 'positions';
  }

}
