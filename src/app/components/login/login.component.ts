import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { supabase } from '../../services/supabase';


@Component({
   selector: 'app-login',
   imports: [FormsModule, RouterLink],
   templateUrl: './login.component.html',
   styleUrl: './login.component.css'
})

export class LoginComponent {
   email: string = '';
   password: string = '';

   constructor(private router: Router) { }

   async login() {
      const { data, error } = await supabase.auth.signInWithPassword({
         email: this.email,
         password: this.password
      });

      if (error) {
         console.error('Erro ao logar:', error.message);
         return;
      }
      console.log('Login realizado com sucesso:', data);

      // Navegar para a rota raiz após login bem-sucedido
      this.router.navigate(['/']);
   }
}