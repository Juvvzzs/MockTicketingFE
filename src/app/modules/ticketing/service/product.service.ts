import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { api } from 'src/app/connection';
import { TicketingApiService } from '../shared/ticketing-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
    constructor(
        private http: HttpClient,
        private url: TicketingApiService,
    ) {}


    getProducts() {
        return this.http.get<any>(api + this.url.get_products());
    }

    addProduct(product:any) {
        return this.http.post(api + this.url.post_product(), product);
    }

    updateProduct(id: string, product: any) {
        return this.http.put(api + this.url.put_product(id), product);
    }

    deleteProduct(id: string) {
        return this.http.delete(api + this.url.delete_product(id));
    }

}
