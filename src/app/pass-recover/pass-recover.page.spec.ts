import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassRecoverPage } from './pass-recover.page';

describe('PassRecoverPage', () => {
  let component: PassRecoverPage;
  let fixture: ComponentFixture<PassRecoverPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PassRecoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
