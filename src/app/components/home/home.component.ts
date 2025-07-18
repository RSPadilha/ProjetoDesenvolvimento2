import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ServicosService, Servico } from '../../services/servicos.service';
import { Subscription } from 'rxjs';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSubscription?: Subscription;
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private servicosService: ServicosService
  ) { }

  ngOnInit() {
    // Verificar o status inicial de autenticação
    this.isLoggedIn = this.authService.isAuthenticated();

    // Escutar mudanças no status de autenticação
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      }
    );

    // Carregar serviços do banco de dados
    this.loadServicos();
  }

  // Carrega todos os serviços do banco de dados ordenados por ID
  async loadServicos() {
    try {
      this.loading = true;
      this.error = null;

      const servicos = await this.servicosService.getServicos();
      console.log('Serviços carregados:', servicos);

      // Converter serviços para formato Product para compatibilidade com o template
      this.products = servicos.map((servico, index) => ({
        id: servico.id || 0,
        name: servico.nome,
        description: servico.descricao,
        price: servico.precoBase,
        image: servico.image_url || `No image`
      }));

      console.log('Products convertidos:', this.products);

    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      this.error = 'Erro ao carregar serviços. Verifique sua conexão e tente novamente.';
      this.products = [];
    } finally {
      this.loading = false;
    }
  }


  /**
   * TrackBy function para otimizar performance do *ngFor
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  navigateToProduct(productId: number): void {
    // Navegar para a página de detalhes do serviço
    this.router.navigate(['/servico', productId]);
  }
}
