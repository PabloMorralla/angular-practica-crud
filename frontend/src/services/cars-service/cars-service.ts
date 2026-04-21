import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginatedResponseDto } from '../../model/DTO/paginated-response-dto';
import { CarDetailDto } from '../../model/DTO/car-detail-dto';
import { CreateCarDto } from '../../model/DTO/create-car-dto';
import { CarBrandDto } from '../../model/DTO/car-brand-dto';
import { Observable } from 'rxjs';
import { CarModelDto } from '../../model/DTO/car-model-dto';
import { UploadedCarDocumentResponseDto } from '../../model/DTO/uploaded-car-document-response-dto';


@Injectable({
  providedIn: 'root',
})
export class CarsService {
  baseUrl: string = '/api';
  timeout = 3000;

  constructor (private http: HttpClient) {}

  public getCurrencyCodes(): string[] {
    return [ 
      'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 
      'HUF', 'RON', 'BGN', 'HRK', 'ARS', 'BRL', 'CLP', 'COP', 
      'PEN', 'UYU', 'PYG', 'BOB', 'VES', 'USD', 'CAD', 'MXN', 
      'JPY', 'CNY', 'INR', 'KRW', 'SGD', 'HKD', 'MYR', 'IDR', 
      'THB', 'VND', 'PKR', 'AUD', 'NZD', 'ZAR', 'EGP', 'NGN', 
      'KES', 'GHS' 
    ]
  }

  public getCarList(page: number): Observable<PaginatedResponseDto> {
    return this.http.get<PaginatedResponseDto>(
      `${this.baseUrl}/cars`,
      { 
        params: {
          page: page
        }
      }
    )
  }

  public getCarDetails(carId: string): Observable<CarDetailDto> {
    return this.http.get<CarDetailDto>(
      `${this.baseUrl}/cars/${carId}`
    )
  }

  public createCar(car: CreateCarDto): Observable<CarDetailDto> {
    return this.http.post<CarDetailDto>(
      `${this.baseUrl}/cars`, 
      car
    )
  }

  public editCar(carId: string, car: CreateCarDto): Observable<CarDetailDto> {
    return this.http.put<CarDetailDto>(
      `${this.baseUrl}/cars/${carId}`,
      car
    )
  }

  public getBrands(): Observable<CarBrandDto[]> {
    return this.http.get<CarBrandDto[]>(
      `${this.baseUrl}/brands`
    )
  }

  public getModelsByBrand(brandId: string): Observable<CarModelDto[]> {
    return this.http.get<CarModelDto[]>(
      `${this.baseUrl}/brands/${brandId}/models`
    )
  }

  public deleteCar(carId: string) {
    return this.http.delete(
      `${this.baseUrl}/cars/${carId}`
    );
  }

  public getFile(carId: string): Observable<UploadedCarDocumentResponseDto> {
    return this.http.get<UploadedCarDocumentResponseDto>(
      `${this.baseUrl}/cars/${carId}/documents`
    );
  }

  public uploadFile(carId: string, formData: FormData): Observable<UploadedCarDocumentResponseDto> {
    return this.http.post<UploadedCarDocumentResponseDto>(
      `${this.baseUrl}/cars/${carId}/documents`, 
      formData
    );
  }

  public deleteFile(carId: string) {
    return this.http.delete(
      `${this.baseUrl}/cars/${carId}/documents`
    )
  }
}