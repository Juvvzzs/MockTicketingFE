import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, switchMap, map, catchError } from 'rxjs';
import { TktCategory } from '../models/tkt-category';

interface JsonBinResponse {
  record: {
    TicketCategory: TktCategory[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class TktCategoryService {
    private binId = '6874fb1b6063391d31ad7057';
    private apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;

    constructor(private http: HttpClient) {}

    getTicketCategory(): Observable<TktCategory[]> {
    return this.http.get<JsonBinResponse>(`${this.apiUrl}/latest`).pipe(
      map(res => res.record?.TicketCategory || []),
      catchError(this.handleError)
    );
  }

  saveCategory(newCategory: TktCategory): Observable<any> {
    return this.getTicketCategory().pipe(
      switchMap((categories: TktCategory[]) => {
        const updated = [...categories, newCategory];
        return this.http.put(this.apiUrl, { TicketCategory: updated });
      }),
      catchError(this.handleError)
    );
  }

  
  updateCategoryStatus(id: string, changes: Partial<TktCategory>): Observable<any> {
    return this.getTicketCategory().pipe(
      switchMap((categories: TktCategory[]) => {
        const updated = categories.map(cat =>
          cat.CatId === id ? { ...cat, ...changes } : cat
        );
        return this.http.put(this.apiUrl, { TicketCategory: updated });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  overwriteAllCategories(newList: any[]): Observable<any> {
  return this.http.put<any>(this.apiUrl, {
    TicketCategory: newList
  }).pipe(
    catchError(error => {
      console.error('Error overwriting categories:', error);
      return throwError(() => error);
    })
  );
}

}