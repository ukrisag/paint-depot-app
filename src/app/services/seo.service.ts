import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);

  private defaultTitle = 'Paint Depot - ร้านสีออนไลน์คุณภาพ';
  private defaultDescription = 'ร้านขายสีออนไลน์ชั้นนำ มีสีคุณภาพหลากหลายแบรนด์ ราคาย่อมเยา จัดส่งฟรีทั่วประเทศ';
  private defaultImage = '/assets/images/og-image.jpg';
  private defaultUrl = 'https://paintdepot.com';

  constructor() {
    this.trackRouteChanges();
  }

  setTitle(title: string) {
    this.titleService.setTitle(`${title} | Paint Depot`);
  }

  setMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    const title = config.title || this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const image = config.image || this.defaultImage;
    const url = config.url || this.defaultUrl;
    const type = config.type || 'website';

    // Update title
    if (config.title) {
      this.setTitle(config.title);
    }

    // Standard meta tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: 'สี, ทาสี, สีบ้าน, สีน้ำมัน, สีน้ำ, paint, paint shop' });

    // Open Graph tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Paint Depot' });

    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  setProductMeta(product: { name: string; description: string; image?: string; price: number }) {
    this.setMetaTags({
      title: product.name,
      description: product.description,
      image: product.image,
      type: 'product'
    });

    // Product specific meta
    this.metaService.updateTag({ property: 'product:price:amount', content: product.price.toString() });
    this.metaService.updateTag({ property: 'product:price:currency', content: 'THB' });
  }

  private trackRouteChanges() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Reset to default on route change
      this.setMetaTags({});
    });
  }
}
