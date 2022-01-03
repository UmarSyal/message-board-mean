import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
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

  onSignup(signupForm: NgForm) {
    this.authService.signup(signupForm.value);
  }

  ngOnDestroy(): void {
      this.errorSub.unsubscribe();
  }
}
