import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private route = inject(ActivatedRoute);

  // 1. Récupère ?type=admin
  rawValue = computed(() =>
    this.route.snapshot.queryParamMap.get('type')
  );

  // 2. Traitement
  processedValue = computed(() => {
    const val = this.rawValue();
    if (!val) return null;

    return val.trim().toUpperCase();
  });

}
