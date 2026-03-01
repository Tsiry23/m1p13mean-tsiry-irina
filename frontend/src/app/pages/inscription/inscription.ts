import { Component,ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.css', '../login/login.css'],
})
export class InscriptionComponent {
  nom: string = '';
  prenom: string = '';
  email: string = '';
  mdp: string = '';

  showPassword = false;
  loading = false;

  errorMessage: string = '';
  successMessage: string = '';

   apiUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async inscrire() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    try {
      const response = await firstValueFrom(
        this.http.post(this.apiUrl + '/utilisateur/inscription', {
          nom: this.nom.trim(),
          prenom: this.prenom.trim(),
          email: this.email.trim(),
          mdp: this.mdp,
        })
      );

      // @ts-ignore
      if (response?.success) {
        this.successMessage = 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.';
        this.cdr.detectChanges();
        // Option : redirection après 2-3 secondes
        setTimeout(() => this.router.navigate(['/login']), 2500);
      } else {
        // @ts-ignore
        this.errorMessage = response?.message || 'Erreur lors de l’inscription';
      }
    } catch (err: any) {
      this.errorMessage =
        err?.error?.message || 'Erreur serveur. Veuillez réessayer plus tard.';
        this.cdr.detectChanges();
    } finally {
      this.loading = false;
        this.cdr.detectChanges();

    }
  }
}