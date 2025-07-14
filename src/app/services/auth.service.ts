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
         this.isLoggedIn = !!session;
         this.authStateSubject.next(this.isLoggedIn);

         if (session) {
            // Usuário logado - navegar para home
            this.router.navigate(['/']);
         } else {
            // Usuário deslogado - navegar para login
            this.router.navigate(['/login']);
         }
      });

      // Navegação inicial baseada no estado de autenticação
      if (this.isLoggedIn) {
         this.router.navigate(['/']);
      } else {
         this.router.navigate(['/login']);
      }
   }

   isAuthenticated(): boolean {
      return this.isLoggedIn;
   }

   async logout() {
      await supabase.auth.signOut();
   }
}
