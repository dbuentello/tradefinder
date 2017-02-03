import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { StockDatumComponent } from './components/stock-datum/stock-datum.component';
import { StockOptionDatumComponent } from './components/stock-option-datum/stock-option-datum.component';
import { SpreadComponent } from './components/spread/spread.component';
import { CondorComponent } from './components/condor/condor.component';


@NgModule({
  declarations: [
    AppComponent,
    StockDatumComponent,
    StockOptionDatumComponent,
    SpreadComponent,
    CondorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
