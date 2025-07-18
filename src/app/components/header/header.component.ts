import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Verificar o status inicial de autenticação
    this.checkAuthStatus();

    // Escutar mudanças no status de autenticação
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        console.log('Header - Status de autenticação:', isAuthenticated);
        this.isLoggedIn = isAuthenticated;
      }
    );
  } ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private async checkAuthStatus() {
    try {
      this.isLoggedIn = this.authService.isAuthenticated();
      console.log('Header - Status inicial de autenticação:', this.isLoggedIn);
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      this.isLoggedIn = false;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro inesperado ao fazer logout:', error);
    }
  }
}
