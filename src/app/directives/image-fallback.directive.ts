import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback: string = 'https://placehold.co/400x400/e5e7eb/6b7280/png?text=No+Image';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element = this.el.nativeElement as HTMLImageElement;
    element.src = this.appImageFallback;
  }
}
