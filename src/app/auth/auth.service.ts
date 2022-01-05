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
    this.http.post<{ message: string, token?: string, expiresIn?: number, error?: any }>(environment.api_url_prefix + 'users/login', userCredentials)
      .subscribe(success => {
        this.errorOccuredListener.next(null);
        if (success.token) {
          const expiresIn = success.expiresIn * 1000;
          this.updateAuthData(success.token, true, expiresIn);
          const now = new Date();
          const expiration = new Date(now.getTime() + expiresIn);
          this.saveAuthData(success.token, expiration);
          this.router.navigate(['/']);
        }
      }, error => {
        console.log('error');
        console.log(error);
        this.updateAuthData(null, false, 0);
        this.errorOccuredListener.next(error.error.message);
      });
  }

  logout() {
    this.updateAuthData(null, false, 0);
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

  autoAuthUser() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expiration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.updateAuthData(authData.token, true, expiresIn);
    } else {
      this.logout();
    }
  }

  updateAuthData(token: string, authStatus: boolean, expiresIn: number) {
    this.authToken = token;
    this.authStatus = authStatus;
    this.authStatusListener.next(authStatus);
    if (expiresIn > 0) {
      this.authTimeout = setTimeout(() => {
        this.logout();
      }, expiresIn);
    } else {
      clearTimeout(this.authTimeout);
    }
  }

  saveAuthData(token: string, expiration: Date): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenExpiration', expiration.toISOString());
  }

  getAuthData(): { token: string, expiration: Date } {
    const token = localStorage.getItem('authToken');
    const expiration = localStorage.getItem('tokenExpiration');
    if (!token || !expiration) {
      return;
    }
    return { token: token, expiration: new Date(expiration) };
  }

  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiration');
  }
}
