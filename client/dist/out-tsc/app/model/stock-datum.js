export var StockDatum = (function () {
    function StockDatum() {
    }
    StockDatum.prototype.accept = function (data) {
        this.id = data.id;
        this.symbol = data.symbol;
        this.description = data.description;
        this.last = data.last && parseFloat(data.last);
        this.close = data.close && parseFloat(data.close);
        this.open = data.open && parseFloat(data.open);
        this.high = data.high && parseFloat(data.high);
        this.low = data.low && parseFloat(data.low);
        this.bid = data.bid && parseFloat(data.bid);
        this.ask = data.ask && parseFloat(data.ask);
        this.volume = data.volume && parseFloat(data.volume);
        this.last = data.last && parseFloat(data.last);
        this.percentChange = data.percentChange && parseFloat(data.percentChange);
        this.ivr = data.ivr && parseFloat(data.ivr);
        this.iv = data.last_iv && parseFloat(data.last_iv);
        this.ivHigh = data.max_iv && parseFloat(data.max_iv);
        this.ivLow = data.min_iv && parseFloat(data.min_iv);
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        var match = StockDatum.date_re.exec(data.date);
        this.date = match.length > 1 ? match[1] : data.date;
    };
    StockDatum.prototype.setIV = function (data) {
        this.ivr = data.ivr && parseFloat(data.ivr);
        this.iv = data.last_iv && parseFloat(data.last_iv);
        this.ivHigh = data.max_iv && parseFloat(data.max_iv);
        this.ivLow = data.min_iv && parseFloat(data.min_iv);
        var match = StockDatum.date_re.exec(data.last_iv_date);
        this.ivDate = match && match.length > 1 ? match[1] : data.last_iv_date;
        match = StockDatum.date_re.exec(data.max_iv_date);
        this.ivHighDate = match && match.length > 1 ? match[1] : data.max_iv_date;
        match = StockDatum.date_re.exec(data.min_iv_date);
        this.ivLowDate = match && match.length > 1 ? match[1] : data.min_iv_date;
    };
    StockDatum.date_re = new RegExp("^(.*)T.*$");
    return StockDatum;
}());
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/client/src/app/model/stock-datum.js.map