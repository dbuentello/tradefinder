import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { TradefinderComponent } from './tradefinder/tradefinder.component';
import { MonitorComponent } from './monitor/monitor.component';
import { PositionsComponent } from './components/position/positions.component';
import { PositionComponent } from './components/position/position.component';
import { StockDatumComponent } from './components/stock-datum/stock-datum.component';
import { StockOptionDatumComponent } from './components/stock-option-datum/stock-option-datum.component';
import { SpreadComponent } from './components/spread/spread.component';
import { CondorComponent } from './components/condor/condor.component';
import { SymbolPositionComponent } from './components/position/symbol-position.component';
import { PositionInputComponent } from './components/position/position-input.component';

import {OptionDataService} from "./service/option-data.service";
import {PositionInputStateService} from "./service/position-input-state.service";

const appRoutes: Routes = [
  { path: '',    component: TradefinderComponent },
  { path: 'tradefinder',    component: TradefinderComponent },
  { path: 'monitor',      component: MonitorComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    StockDatumComponent,
    StockOptionDatumComponent,
    SpreadComponent,
    CondorComponent,
    TradefinderComponent,
    MonitorComponent,
    PositionsComponent,
    PositionComponent,
    SymbolPositionComponent,
    PositionInputComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    OptionDataService,
    PositionInputStateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
