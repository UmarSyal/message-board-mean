import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private errorOccuredListener: Subject<string | null> = new Subject();
  private authStatusListener: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private authStatus: boolean = false;
  private authToken: string;
  private authUserId: string;
  private authTimeout: any;

  constructor(private http: HttpClient, private router: Router) { }

  signup(userCredentials: {email: string, password: string}) {
    this.http.post<{ message: string, error?: any }>(environment.api_url_prefix + 'users/signup', userCredentials)
      .subscribe(success => {
        this.errorOccuredListener.next(null);
        this.login({ email: userCredentials.email, password: userCredentials.password});
      }, error => {
        this.errorOccuredListener.next(error.error.error.message);
      });
  }

  login(userCredentials: {email: string, password: string}) {
    this.http.post<{ message: string, token?: string, expiresIn?: number, userId?: string, error?: any }>(environment.api_url_prefix + 'users/login', userCredentials)
      .subscribe(success => {
        this.errorOccuredListener.next(null);
        if (success.token) {
          const expiresIn = success.expiresIn * 1000;
          this.updateAuthData(success.token, true, expiresIn, success.userId);
          const now = new Date();
          const expiration = new Date(now.getTime() + expiresIn);
          this.saveAuthData(success.token, expiration, success.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        console.log('error');
        console.log(error);
        this.updateAuthData(null, false, 0, null);
        this.errorOccuredListener.next(error.error.message);
      });
  }

  logout() {
    this.updateAuthData(null, false, 0, null);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  getErrorOccuredListener(): Observable<string> {
    return this.errorOccuredListener.asObservable();
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  getAuthStatus(): boolean {
    return this.authStatus;
  }

  getAuthToken(): string {
    return this.authToken;
  }

  getAuthUserId(): string {
    return this.authUserId;
  }

  autoAuthUser() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expiration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.updateAuthData(authData.token, true, expiresIn, authData.userId);
    } else {
      this.logout();
    }
  }

  updateAuthData(token: string, authStatus: boolean, expiresIn: number, userId: string) {
    this.authToken = token;
    this.authStatus = authStatus;
    this.authUserId = userId;
    this.authStatusListener.next(authStatus);
    if (expiresIn > 0) {
      this.authTimeout = setTimeout(() => {
        this.logout();
      }, expiresIn);
    } else {
      clearTimeout(this.authTimeout);
    }
  }

  saveAuthData(token: string, expiration: Date, userId: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiration', expiration.toISOString());
    localStorage.setItem('userId', userId);
  }

  getAuthData(): { token: string, expiration: Date, userId: string } {
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('tokenExpiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration || !userId) {
      return;
    }
    return { token: token, expiration: new Date(expiration), userId: userId };
  }

  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userId');
  }
}
