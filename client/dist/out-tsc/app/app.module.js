var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
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
import { OptionDataService } from "./service/option-data.service";
import { PositionInputStateService } from "./service/position-input-state.service";
import { PositionSummaryComponent } from './components/position/position-summary.component';
var appRoutes = [
    { path: '', component: TradefinderComponent },
    { path: 'tradefinder', component: TradefinderComponent },
    { path: 'monitor', component: MonitorComponent },
];
export var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
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
                PositionSummaryComponent,
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
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/client/src/app/app.module.js.map