import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Verify } from './verify';

describe('Verify', () => {
  let component: Verify;
  let fixture: ComponentFixture<Verify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verify],
      providers: [
        provideHttpClient(),
        provideRouter([{ path: 'register', component: class {} }]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'email' ? 'test@example.com' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Verify);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
