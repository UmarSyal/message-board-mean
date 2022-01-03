import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private errorOccured: Subject<string | null> = new Subject();

  constructor(private http: HttpClient) { }

  signup(userCredentials: {email: string, password: string}) {
    this.http.post<{ message: string, user?: any, error?: any }>(environment.api_url_prefix + 'users/signup', userCredentials)
      .subscribe(success => {
        console.log(success.message);
        console.log(success.user);
        this.errorOccured.next(null);
      }, error => {
        this.errorOccured.next(error.error.error.message);
      });
  }

  getErrorOccuredListener() {
    return this.errorOccured.asObservable();
  }
}
