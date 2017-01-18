/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StockDatumComponent } from './stock-datum.component';

describe('StockDatumComponent', () => {
  let component: StockDatumComponent;
  let fixture: ComponentFixture<StockDatumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockDatumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockDatumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
