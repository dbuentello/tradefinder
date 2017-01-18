import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { StockDatum } from './model/stock-datum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'Stocks';
  data = null;
  error = null;

  session_id: string = null;
  login_date: string = null;

  stockDatums: StockDatum[] = [];
  searchParams: {
    symbols?: string,
    historic?: boolean,
    delete_existing?: boolean
  } = {};

  constructor(private http: Http) {

  }

  ngOnInit() {
    this.getData();
  }

  private getData() {
    let params: URLSearchParams = new URLSearchParams();
    this.session_id && params.set('session_id', this.session_id);
    this.login_date && params.set('login_date', this.login_date);
    this.searchParams.symbols && params.set('symbols', this.searchParams.symbols);
    this.searchParams.historic && params.set('historic', this.searchParams.historic + "");
    this.searchParams.delete_existing && params.set('delete_existing', this.searchParams.delete_existing + "");

    this.http.get('http://localhost:3000/stocks.json', { search: params })
      .map((res: Response) => res.json())
      .subscribe(
        (res) => {
          // console.log('*** response:', res);

          if(res.meta) {
            this.session_id = res.meta.session_id;
            this.login_date = res.meta.login_date;
          }

          this.stockDatums = [];
          res.data.stocks && res.data.stocks.forEach(datum => {
            let datumObj: StockDatum = new StockDatum();
            datumObj.accept(datum);
            this.stockDatums.push(datum)
          });

          console.log('*** stock datums:', this.stockDatums);

          this.data = res
        },
        (error) => {
          console.log('*** error:', error);
          this.error = error
        });
  }

  public search() {
    this.getData();
  }

}
