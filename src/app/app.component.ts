import { Component } from '@angular/core';
import { HomeComponent } from "./components/home/home.component";
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-root',
  imports: [LoginComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ProjetoDesenvolvimento2';
  loginStatus = true; // antes da implementação do banco com login
}
