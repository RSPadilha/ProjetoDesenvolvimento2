import { Component } from '@angular/core';

@Component({
  selector: 'app-cliente',
  imports: [],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {
  clients: any;
  pedidos: any[] = [];

  queryClient(event: any) {
    fetch('http://pfs-api.onrender.com/client')
      .then(res => res.json())
      .then(res => this.clients = res) // Transformar no modo angular mas tbm mover para o service com auth
  }
  novoPedido(event: any) {

  }

  async buscarPedidos(userId: number) {
    try {
      const response = await fetch(`http://pfs-api.onrender.com/orders?idClient=${userId}`);
      const orders = await response.json();
      // Busca atendentes e serviços para mapear nomes
      const [attendantsRes, servicesRes] = await Promise.all([
        fetch('http://pfs-api.onrender.com/attendant'),
        fetch('http://pfs-api.onrender.com/services')
      ]);
      const attendants = await attendantsRes.json();
      const services = await servicesRes.json();

      this.pedidos = orders.map((order: any) => {
        const atendente = attendants.find((a: any) => a.id == order.idAttendant)?.name || '-';
        const tipoServico = services.find((s: any) => s.id == order.idService)?.category || '-';
        const endereco = order.adress ? `${order.adress.street}, ${order.adress.number}` : '-';
        return {
          atendente,
          tipoServico,
          descricao: order.description,
          endereco,
          dataInicio: order['start-date'],
          dataFinalizado: order['end-date'],
          status: order.status,
          valor: order.value
        };
      });
    } catch (e) {
      this.pedidos = [];
    }
  }

  async ngOnInit() { //ng... versão antiga do angular
    await this.buscarPedidos(1); // Temporario com id 1 até implementar o login(authguard)
  }
}
