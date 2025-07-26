import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class TicketingApiService {
  constructor() {}

  // Products
  get_products         = () => `/products`;
  post_search_products = (product: string) => `/products/search?q=${product}`
  post_product         = () => `/products`;
  put_product          = (id: string) => `/products/${id}`;
  delete_product       = (id: string) => `/products/${id}`;

}
