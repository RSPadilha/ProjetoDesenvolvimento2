import { Component } from '@angular/core';

@Component({
  selector: 'app-cliente',
  imports: [],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {
  clients: any;
  queryClient(event: any){
    fetch('http://localhost:3000/client')
      .then(res => res.json())
      .then(res => this.clients = res)
  }
}
