import { HttpInterceptorFn } from '@angular/common/http';

// Adds the token to every request
export const iamInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const session = JSON.parse(localStorage.getItem('smartstock.session') ?? 'null');
    if (session?.token) req = req.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } });
  } catch { /* no session */ }
  return next(req);
};
