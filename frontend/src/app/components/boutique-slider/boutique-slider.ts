import { Component, OnInit } from '@angular/core';
import { BoutiqueService } from '../../services/boutique/boutique';
import { Boutique } from '../../models/boutique.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boutique-slider',
  imports: [ CommonModule ],
  templateUrl: './boutique-slider.html',
  styleUrls: ['./boutique-slider.css']
})
export class BoutiqueSliderComponent implements OnInit {

  boutiques: Boutique[] = [];

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.boutiqueService.getBoutiques().subscribe({
      next: (data) => this.boutiques = data,
      error: (err) => console.error(err)
    });
  }
}
