import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  @ViewChild('featuresSection', { read: ElementRef }) featuresSection!: ElementRef;
  @ViewChild('contactSection', { read: ElementRef }) contactSection!: ElementRef;

  // ข้อมูลร้าน - แก้ไขตามข้อมูลจริงของคุณ
  storeInfo = {
    name: 'บุญวัฒนา (BWT)',
    description: 'ร้านขายสีและอุปกรณ์ทาสีคุณภาพพรีเมียมสำหรับทุกโปรเจกต์',
    fullDescription: `บุญวัฒนา เป็นผู้เชี่ยวชาญด้านการจำหน่ายสีและอุปกรณ์ทาสีคุณภาพสูง
    เราคัดสรรสินค้าจากแบรนด์ชั้นนำทั้งในและต่างประเทศ พร้อมให้คำปรึกษาและบริการที่ดีที่สุดแก่ลูกค้า
    ด้วยประสบการณ์กว่า 10 ปี เรามุ่งมั่นในการส่งมอบสีที่มีคุณภาพและความทนทาน เหมาะสำหรับทั้งงานบ้านและงานโครงการขนาดใหญ่`,

    address: '124 ปากซอย อินทามระ 32 ถนน สุทธิสารวินิจฉัย แยก 1 ถ. สุทธิสารวินิจฉัย แขวงรัชดาภิเษก เขตดินแดง กรุงเทพมหานคร 10400',
    phone: '02-277-3907',
    email: '',
    line: '',

    // เปลี่ยน coordinates ตามที่ตั้งจริงของร้าน
    coordinates: {
      lat: 13.7866896,
      lng: 100.5644139
    },

    businessHours: [
      { day: 'จันทร์ - ศุกร์', hours: '08:00 - 18:00' },
      { day: 'เสาร์', hours: '09:00 - 17:00' },
      { day: 'อาทิตย์', hours: '09:00 - 16:00' }
    ],

    features: [
      {
        icon: '🎨',
        title: 'สีคุณภาพพรีเมียม',
        description: 'คัดสรรสีจากแบรนด์ชั้นนำ ทนทาน สีสวย',
        gradientFrom: '#9333ea',
        gradientTo: '#db2777'
      },
      {
        icon: '🚚',
        title: 'จัดส่งทั่วประเทศ',
        description: 'บริการจัดส่งรวดเร็ว ปลอดภัย ทั่วไทย',
        gradientFrom: '#db2777',
        gradientTo: '#f97316'
      },
      {
        icon: '👨‍🔧',
        title: 'ให้คำปรึกษาฟรี',
        description: 'ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำ',
        gradientFrom: '#f97316',
        gradientTo: '#4f46e5'
      },
      {
        icon: '💳',
        title: 'ชำระเงินสะดวก',
        description: 'รองรับหลายช่องทาง ปลอดภัย 100%',
        gradientFrom: '#4f46e5',
        gradientTo: '#9333ea'
      }
    ]
  };

  mapUrl: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer
  ) {
    // สร้าง Google Maps embed URL
    const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5397736983895!2d${this.storeInfo.coordinates.lng}!3d${this.storeInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzIyLjciTiAxMDDCsDMwJzA2LjUiRQ!5e0!3m2!1sth!2sth!4v1234567890123!5m2!1sth!2sth`;

    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleMapsUrl);
  }

  ngOnInit() {
    // Component initialization
  }

  scrollToContact() {
    if (this.contactSection) {
      this.contactSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToFeatures() {
    if (this.featuresSection) {
      this.featuresSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${this.storeInfo.coordinates.lat},${this.storeInfo.coordinates.lng}`;
    window.open(url, '_blank');
  }

  openLineChat() {
    window.open(`https://line.me/R/ti/p/${this.storeInfo.line}`, '_blank');
  }

  callPhone() {
    window.location.href = `tel:${this.storeInfo.phone}`;
  }

  sendEmail() {
    window.location.href = `mailto:${this.storeInfo.email}`;
  }
}
