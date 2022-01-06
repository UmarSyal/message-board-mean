import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  error: string | null;
  errorSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.errorSub = this.authService.getErrorOccuredListener()
      .subscribe((errorMessage: string | null) => {
        this.error = errorMessage;
      });
  }

  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    this.authService.login(loginForm.value);
  }

  ngOnDestroy(): void {
      this.errorSub.unsubscribe();
  }
}
