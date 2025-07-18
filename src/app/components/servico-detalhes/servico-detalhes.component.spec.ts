import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicoDetalhesComponent } from './servico-detalhes.component';

describe('ServicoDetalhesComponent', () => {
   let component: ServicoDetalhesComponent;
   let fixture: ComponentFixture<ServicoDetalhesComponent>;

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         imports: [ServicoDetalhesComponent]
      })
         .compileComponents();

      fixture = TestBed.createComponent(ServicoDetalhesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
