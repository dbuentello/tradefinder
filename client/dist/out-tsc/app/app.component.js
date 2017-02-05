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
import { StockOptionDatum } from './model/stock-option-datum';
export var AppComponent = (function () {
    function AppComponent(http) {
        this.http = http;
        this.title = 'Stocks';
        this.status = '';
        this.data = null;
        this.error = null;
        this.session_id = null;
        this.login_date = null;
        this.minDaysExp = 30;
        this.maxDaysExp = 60;
        this.stockDatums = [];
        this.stockOptionDatums = [];
        this.searchParams = {};
        this.symbols = [
            'AAPL',
            'AMGN',
            'AMZN',
            'APC',
            'BA',
            'BABA',
            'BIDU',
        ];
        this.rows = [
            {
                "name": "Ethel Price",
                "gender": "female",
                "company": "Johnson, Johnson and Partners, LLC CMP DDC",
                "age": '22'
            },
            {
                "name": "Claudine Neal",
                "gender": "male",
                "company": "Sealoud",
                "age": '55'
            },
            {
                "name": "Beryl Rice",
                "gender": "female",
                "company": "Velity",
                "age": '67'
            },
        ];
    }
    AppComponent.prototype.ngOnInit = function () {
        this.stockDatums = [];
        this.status = 'Loading stock data...';
        this.getLatestStockData(true);
    };
    AppComponent.prototype.getSessionParams = function () {
        var params = new URLSearchParams();
        this.session_id && params.set('session_id', this.session_id);
        this.login_date && params.set('login_date', this.login_date);
        return params;
    };
    AppComponent.prototype.getStockData = function (params, loadOptions) {
        var _this = this;
        if (loadOptions === void 0) { loadOptions = false; }
        this.http.get('http://localhost:3000/stocks.json', { search: params })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            // console.log('*** response:', res);
            if (res.meta) {
                _this.session_id = res.meta.session_id;
                _this.login_date = res.meta.login_date;
            }
            res.data.stocks && res.data.stocks.forEach(function (datum) {
                var datumObj = new StockDatum();
                datumObj.accept(datum);
                _this.stockDatums.push(datum);
            });
            console.log('*** stock datums:', _this.stockDatums);
            if (loadOptions) {
                _this.status = 'Loading stock option data...';
                _this.getStockOptionData(true);
            }
        }, function (error) {
            console.log('*** error:', error);
            _this.error = error;
        });
    };
    AppComponent.prototype.getLatestStockData = function (allSymbols) {
        if (allSymbols === void 0) { allSymbols = false; }
        var params = this.getSessionParams();
        params.set('latest', 'true');
        params.set('symbols', allSymbols || !this.searchParams.symbols ? this.symbols.join(',') : this.searchParams.symbols);
        this.getStockData(params, true);
    };
    AppComponent.prototype.getHistoryStockData = function () {
        var params = this.getSessionParams();
        this.searchParams.symbols && params.set('symbols', this.searchParams.symbols);
        this.searchParams.historic && params.set('historic', this.searchParams.historic + "");
        this.searchParams.delete_existing && params.set('delete_existing', this.searchParams.delete_existing + "");
        this.getStockData(params);
    };
    AppComponent.prototype.getStockOptionData = function (allSymbols) {
        var _this = this;
        if (allSymbols === void 0) { allSymbols = false; }
        var params = this.getSessionParams();
        params.set('symbols', allSymbols || !this.searchParams.symbols ? this.symbols.join(',') : this.searchParams.symbols);
        params.set('minDaysExp', this.minDaysExp + '');
        params.set('maxDaysExp', this.maxDaysExp + '');
        this.http.get('http://localhost:3000/stock_options.json', { search: params })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            // console.log('*** response:', res);
            if (res.meta) {
                _this.session_id = res.meta.session_id;
                _this.login_date = res.meta.login_date;
            }
            res.data.stock_options && res.data.stock_options.forEach(function (datum) {
                var datumObj = new StockOptionDatum();
                datumObj.accept(datum);
                _this.filterOption(datumObj) && _this.stockOptionDatums.push(datum);
            });
            console.log('*** stock option datums:', _this.stockOptionDatums);
            _this.status = 'Loading stock option data complete!';
        }, function (error) {
            console.log('*** error:', error);
            _this.error = error;
        });
    };
    AppComponent.prototype.filterOption = function (option) {
        if (option.daysToExpiration < this.minDaysExp)
            return false;
        else if (option.daysToExpiration > this.maxDaysExp)
            return false;
        return true;
    };
    AppComponent.prototype.search = function () {
        this.getHistoryStockData();
    };
    AppComponent.prototype.loadVolatility = function () {
        var _this = this;
        var params = new URLSearchParams();
        this.session_id && params.set('session_id', this.session_id);
        this.login_date && params.set('login_date', this.login_date);
        params.set('symbols', this.symbols.join(','));
        params.set('minDaysExp', '30');
        params.set('maxDaysExp', '60');
        this.status = 'Loading volatility...';
        this.http.get('http://localhost:3000/volatilities.json', { search: params })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            // console.log('*** response:', res);
            if (res.meta) {
                _this.session_id = res.meta.session_id;
                _this.login_date = res.meta.login_date;
            }
            _this.status = 'Volatility loading complete.';
        }, function (error) {
            console.log('*** error:', error);
            _this.error = error;
        });
    };
    AppComponent = __decorate([
        Component({
            selector: 'app-root',
            templateUrl: './positions.component.html',
            styleUrls: [
                './monitor.component.css',
            ]
        }), 
        __metadata('design:paramtypes', [Http])
    ], AppComponent);
    return AppComponent;
}());
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/client/src/app/app.component.js.map
