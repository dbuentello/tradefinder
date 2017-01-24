export var StockDatum = (function () {
    function StockDatum() {
    }
    StockDatum.prototype.accept = function (data) {
        this.id = data.id;
        this.symbol = data.symbol;
        this.date = data.date;
        this.description = data.description;
        this.last = data.last;
        this.close = data.close;
        this.open = data.open;
        this.high = data.high;
        this.low = data.low;
        this.bid = data.ask;
        this.volume = data.volume;
        this.last = data.last;
        this.percentChange = data.percentChange;
        this.ivr = data.ivr;
        this.iv = data.iv;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    };
    return StockDatum;
}());
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/client/src/app/model/stock-datum.js.map