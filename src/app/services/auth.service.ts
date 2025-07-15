import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private isLoggedIn = false;
   private authStateSubject = new BehaviorSubject<boolean>(false);
   public authState$ = this.authStateSubject.asObservable();

   constructor(private router: Router) {
      this.initializeAuth();
   }

   private async initializeAuth() {
      // Verificar se o usuário já está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      this.isLoggedIn = !!session;
      this.authStateSubject.next(this.isLoggedIn);

      // Escutar mudanças no estado de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
         const wasLoggedIn = this.isLoggedIn;
         this.isLoggedIn = !!session;
         this.authStateSubject.next(this.isLoggedIn);

         // Só redirecionar se houve mudança real no estado de autenticação
         if (event === 'SIGNED_OUT' || (!wasLoggedIn && session)) {
            if (session) {
               // Usuário acabou de fazer login - navegar para home
               this.router.navigate(['/']);
            } else {
               // Usuário acabou de fazer logout - navegar para login
               this.router.navigate(['/login']);
            }
         }
      });

      // Navegação inicial apenas se estiver na página de login e já estiver autenticado
      // ou se não estiver autenticado e não estiver na página de login/signup
      const currentUrl = this.router.url;
      if (this.isLoggedIn && (currentUrl === '/login' || currentUrl === '/signup')) {
         this.router.navigate(['/']);
      } else if (!this.isLoggedIn && currentUrl !== '/login' && currentUrl !== '/signup') {
         this.router.navigate(['/login']);
      }
   }

   isAuthenticated(): boolean {
      return this.isLoggedIn;
   }

   async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
   }

   async getCurrentUserId(): Promise<string | null> {
      const user = await this.getCurrentUser();
      return user?.id || null;
   }

   // Método para verificar se deve redirecionar (útil para guards)
   shouldRedirectToLogin(): boolean {
      return !this.isLoggedIn;
   }

   // Método para fazer logout com redirecionamento controlado
   async logout() {
      await supabase.auth.signOut();
      // O redirecionamento será feito automaticamente pelo onAuthStateChange
   }
}
