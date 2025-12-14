import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'administrator';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('token');
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storeSession(response.data.user, response.data.token);
        }
      })
    );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/register', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storeSession(response.data.user, response.data.token);
        }
      })
    );
  }

  logout() {
    this.http.post('/api/v1/logout', {}).subscribe();
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private storeSession(user: User, token: string) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  private clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.currentUserValue;
  }
}
