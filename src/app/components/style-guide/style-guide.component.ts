import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-style-guide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './style-guide.component.html',
  styleUrls: ['./style-guide.component.css']
})
export class StyleGuideComponent {
  demoForm: FormGroup;
  showPassword = false;
  rememberMe = false;
  selectedOption = 'option1';
  acceptTerms = false;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });
  }

  get email() {
    return this.demoForm.get('email');
  }

  get password() {
    return this.demoForm.get('password');
  }

  get name() {
    return this.demoForm.get('name');
  }

  get phone() {
    return this.demoForm.get('phone');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  simulateLoading(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  onSubmit(): void {
    console.log('Form submitted', this.demoForm.value);
  }
}
