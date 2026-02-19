import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { CommandeService } from '../../services/commande/commande';
import { Commande } from '../../models/commande.model';

@Component({
  selector: 'app-commande-search',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './commande-search.html',
  styleUrls: ['../admin-home/variables.css', '../admin-home/admin-home.css', './commande-search.css']
})
export class CommandeSearch implements OnInit {

  commandes: Commande[] = [];
  loading = false;

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.search();
  }

  search() {
    this.loading = true;

    this.commandeService.search({}).subscribe({
      next: res => {
        this.commandes = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
