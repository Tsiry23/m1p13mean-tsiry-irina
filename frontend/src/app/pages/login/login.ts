import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['../admin-home/variables.css', './login.css']
})
export class Login {

  email = '';
  mdp = '';
  errorMessage = '';
  loading = false;

  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.errorMessage = '';
    this.loading = true;

    this.auth.login(this.email, this.mdp).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin-home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Erreur lors de la connexion';
      }
    });
  }
}
