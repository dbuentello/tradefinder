var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { StockDatum } from './model/stock-datum';
export var AppComponent = (function () {
    function AppComponent(http) {
        this.http = http;
        this.title = 'Stocks';
        this.data = null;
        this.error = null;
        this.session_id = null;
        this.login_date = null;
        this.stockDatums = [];
        this.searchParams = {};
    }
    AppComponent.prototype.ngOnInit = function () {
        this.getData();
    };
    AppComponent.prototype.getData = function () {
        var _this = this;
        var params = new URLSearchParams();
        this.session_id && params.set('session_id', this.session_id);
        this.login_date && params.set('login_date', this.login_date);
        this.searchParams.symbols && params.set('symbols', this.searchParams.symbols);
        this.searchParams.historic && params.set('historic', this.searchParams.historic + "");
        this.searchParams.delete_existing && params.set('delete_existing', this.searchParams.delete_existing + "");
        this.http.get('http://localhost:3000/stocks.json', { search: params })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            // console.log('*** response:', res);
            if (res.meta) {
                _this.session_id = res.meta.session_id;
                _this.login_date = res.meta.login_date;
            }
            _this.stockDatums = [];
            res.data.stocks && res.data.stocks.forEach(function (datum) {
                var datumObj = new StockDatum();
                datumObj.accept(datum);
                _this.stockDatums.push(datum);
            });
            console.log('*** stock datums:', _this.stockDatums);
            _this.data = res;
        }, function (error) {
            console.log('*** error:', error);
            _this.error = error;
        });
    };
    AppComponent.prototype.search = function () {
        this.getData();
    };
    AppComponent = __decorate([
        Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.css']
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof Http !== 'undefined' && Http) === 'function' && _a) || Object])
    ], AppComponent);
    return AppComponent;
    var _a;
}());
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/app/js/tradefinder-app/src/app/app.component.js.map