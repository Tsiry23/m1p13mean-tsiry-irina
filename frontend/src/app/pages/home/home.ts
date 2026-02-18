import { Component } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { Hero } from '../../components/hero/hero';
import { Services } from '../../components/services/services';
import { Contact } from '../../components/contact/contact';
import { Footer } from '../../components/footer/footer';
import { BoutiqueSliderComponent } from '../../components/boutique-slider/boutique-slider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Navbar,
    Hero,
    Services,
    Contact,
    Footer,
    BoutiqueSliderComponent
  ],
  templateUrl: './home.html'
})
export class Home {}
