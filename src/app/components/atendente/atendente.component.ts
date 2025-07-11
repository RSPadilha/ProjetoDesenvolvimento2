import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-atendente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atendente.component.html',
  styleUrls: ['./atendente.component.css']
})
export class AtendenteComponent implements OnInit {
  clientes: any[] = [];
  editandoId: number | null = null;
  clienteEdit: any = {};
  criandoNovo: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.buscarClientes();
  }

  buscarClientes() {
    this.http.get<any[]>('https://pfs-api.onrender.com/clientes/').subscribe(data => {
      this.clientes = data;
    });
  }

  deletarCliente(id: number) {
    this.http.delete(`https://pfs-api.onrender.com/clientes/${id}`).subscribe(() => {
      this.clientes = this.clientes.filter(c => c.id !== id);
    });
  }


  editarCliente(cliente: any) {
    this.editandoId = cliente.id;
    this.criandoNovo = false;
    this.clienteEdit = { ...cliente, endereco: { ...cliente.endereco } };
  }

  novoCliente() {
    this.criandoNovo = true;
    this.editandoId = null;
    this.clienteEdit = {
      nome: '',
      telefone: '',
      email: '',
      senha: '',
      endereco: {
        cep: '',
        estado: '',
        cidade: '',
        rua: '',
        bairro: '',
        numero: '',
        complemento: ''
      }
    };
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.criandoNovo = false;
    this.clienteEdit = {};
  }

  salvarEdicao() {
    // Mantém para edição de cliente existente
    if (!this.criandoNovo) {
      this.http.put(`https://pfs-api.onrender.com/clientes/${this.editandoId}`, this.clienteEdit).subscribe(() => {
        this.buscarClientes();
        this.cancelarEdicao();
      });
    }
  }

  salvarNovoCliente(form: any) {
    if (form.valid) {
      this.http.post('https://pfs-api.onrender.com/clientes/', this.clienteEdit).subscribe(() => {
        this.buscarClientes();
        this.cancelarEdicao();
      });
    } else {
      // Marca todos os campos como tocados para exibir os erros
      Object.values(form.controls).forEach((control: any) => control.markAsTouched());
    }
  }
}
