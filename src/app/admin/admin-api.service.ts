import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { CognitoAuthService } from './auth/cognito-auth.service';
import { Product } from '../models/product.model';
import { Order, OrderStatus } from '../models/order.model';

export interface DashboardSummary {
  products: number; lowStock: number; ordersToday: number;
  pendingPayment: number; paidOrders: number; revenue: number; currency: string;
  recentOrders: Array<Pick<Order, 'orderReference' | 'customerName' | 'total' | 'currency' | 'status' | 'paymentStatus' | 'createdAt'>>;
}

export interface InventoryRow {
  productId: string; productName: string; category: string; variantId: string;
  sku: string; attributes: Record<string, string>; availableQuantity: number;
  lowStockThreshold: number; lowStock: boolean; active: boolean;
}

export interface PaymentSettings {
  provider: string; environment: string; apiKey: string; webhookSalt: string;
  webhookUrl: string; returnUrl: string;
}

export interface PresignResponse {
  key: string; uploadUrl: string; previewUrl: string; maxBytes: number; contentType: string;
}

/**
 * Typed client for the authenticated admin API (/api/admin/*). Every call attaches
 * a fresh Cognito ID token as a Bearer credential; the API Gateway JWT authorizer
 * validates it before the request reaches the Lambda.
 */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(CognitoAuthService);
  private readonly base = `${environment.apiBaseUrl}/api/admin`;

  // --- dashboard / audit / customers ---
  dashboard() { return this.get<DashboardSummary>('/dashboard'); }
  audit(limit = 50) { return this.get<any[]>(`/audit?limit=${limit}`); }
  customers() { return this.get<any[]>('/customers'); }

  // --- products ---
  listProducts() { return this.get<Product[]>('/products'); }
  getProduct(id: string) { return this.get<Product>(`/products/${encodeURIComponent(id)}`); }
  createProduct(p: Partial<Product>) { return this.post<Product>('/products', p); }
  updateProduct(id: string, p: Partial<Product>) { return this.put<Product>(`/products/${encodeURIComponent(id)}`, p); }
  archiveProduct(id: string) { return this.del<Product>(`/products/${encodeURIComponent(id)}`); }

  // --- inventory ---
  inventory() { return this.get<InventoryRow[]>('/inventory'); }
  adjustInventory(body: { productId: string; variantId: string; newQuantity?: number; delta?: number; reason?: string }) {
    return this.post<{ previousQuantity: number; newQuantity: number; adjustment: number }>('/inventory/adjust', body);
  }
  inventoryHistory(sku: string) { return this.get<any[]>(`/inventory/${encodeURIComponent(sku)}/history`); }

  // --- orders ---
  listOrders(status?: string) { return this.get<Order[]>(status ? `/orders?status=${encodeURIComponent(status)}` : '/orders'); }
  getOrder(ref: string) { return this.get<Order>(`/orders/${encodeURIComponent(ref)}`); }
  updateOrderStatus(ref: string, status: OrderStatus, note?: string) {
    return this.patch<Order>(`/orders/${encodeURIComponent(ref)}/status`, { status, note });
  }

  // --- categories ---
  listCategories() { return this.get<any[]>('/categories'); }
  saveCategory(slug: string, c: any) { return this.put<any>(`/categories/${encodeURIComponent(slug)}`, c); }
  createCategory(c: any) { return this.post<any>('/categories', c); }
  deleteCategory(slug: string) { return this.del<void>(`/categories/${encodeURIComponent(slug)}`); }

  // --- homepage ---
  getHomepage() { return this.get<any>('/homepage'); }
  saveHomepage(cfg: any) { return this.put<any>('/homepage', cfg); }

  // --- settings ---
  getBusiness() { return this.get<any>('/settings/business'); }
  saveBusiness(b: any) { return this.put<any>('/settings/business', b); }
  getDelivery() { return this.get<any>('/settings/delivery'); }
  saveDelivery(d: any) { return this.put<any>('/settings/delivery', d); }
  getPayments() { return this.get<PaymentSettings>('/settings/payments'); }
  savePayments(body: { apiKey?: string; webhookSalt?: string }) { return this.put<any>('/settings/payments', body); }

  // --- uploads ---
  presignUpload(body: { folder: string; contentType: string; contentLength: number; filename: string }) {
    return this.post<PresignResponse>('/uploads/presign', body);
  }

  // --- verbs with auth header ---
  private authHeaders() {
    return from(this.auth.getIdToken()).pipe(
      map(token => ({ Authorization: `Bearer ${token}` }))
    );
  }
  private get<T>(path: string): Observable<T> {
    return this.authHeaders().pipe(switchMap(headers => this.http.get<T>(`${this.base}${path}`, { headers })));
  }
  private post<T>(path: string, body: unknown): Observable<T> {
    return this.authHeaders().pipe(switchMap(headers => this.http.post<T>(`${this.base}${path}`, body, { headers })));
  }
  private put<T>(path: string, body: unknown): Observable<T> {
    return this.authHeaders().pipe(switchMap(headers => this.http.put<T>(`${this.base}${path}`, body, { headers })));
  }
  private patch<T>(path: string, body: unknown): Observable<T> {
    return this.authHeaders().pipe(switchMap(headers => this.http.patch<T>(`${this.base}${path}`, body, { headers })));
  }
  private del<T>(path: string): Observable<T> {
    return this.authHeaders().pipe(switchMap(headers => this.http.delete<T>(`${this.base}${path}`, { headers })));
  }
}
