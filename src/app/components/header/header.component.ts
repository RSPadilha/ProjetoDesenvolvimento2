import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private authService: AuthService) { }

  async logout() {
    try {
      await this.authService.logout();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro inesperado ao fazer logout:', error);
    }
  }
}
