import { async, TestBed } from '@angular/core/testing';
import { StockDatumComponent } from './stock-datum.component';
describe('StockDatumComponent', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [StockDatumComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(StockDatumComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=/Users/markshaw/Coding/tradefinder/client/src/app/components/stock-datum/stock-datum.component.spec.js.map