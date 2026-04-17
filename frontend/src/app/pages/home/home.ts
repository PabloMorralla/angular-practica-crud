import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { PaginatedResponseDto } from '../../../model/DTO/paginated-response-dto';
import { CarsService } from '../../../services/cars-service/cars-service';
import { RouterLink } from "@angular/router";
import { Dialog } from '../../shared/dialog/dialog';
import { CarSummaryDto } from '../../../model/DTO/car-summary-dto';
import { Fab } from '../../shared/fab/fab';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Dialog, Fab],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<any> = signal(null);
  paginatedResponse: WritableSignal<PaginatedResponseDto|null> = signal(null);

  pages: Signal<number[]> = computed(()=>{
    var totalPages = this.paginatedResponse()?.meta.totalPages ?? 0;
    return Array.from({length: totalPages}, (_, i)=>i+1);
  })
  hasNextPage = computed(()=>this.paginatedResponse()?.meta.hasNextPage ?? false);
  hasPreviousPage = computed(()=>this.paginatedResponse()?.meta.hasPreviousPage ?? false);
  currentPage = computed(()=>this.paginatedResponse()?.meta.currentPage);

  items = computed(()=>this.paginatedResponse()?.items ?? [])

  isDialogOpen = signal(false);
  carToDelete = signal<CarSummaryDto | undefined>(undefined);

  constructor (private carsService: CarsService) {}

  ngOnInit(): void {
    this.getCars(1);
  }

  getCars(page: number){
    this.loading.set(true);
    
    this.carsService.getCarList(page).subscribe({

      next: (paginatedResponse) => {
        this.paginatedResponse.set(paginatedResponse);
      },

      error: (error) => {
        this.loading.set(false);
        this.error.set(error);
        this.paginatedResponse.set(null);
      },

      complete: () => {
        this.loading.set(false);
        this.error.set(null);
      }

    });
  }

  refreshCars() {
    this.getCars(this.currentPage() ?? 1);
  }

  navigateToPage(page: number){
    this.getCars(page);
  }

  goToPrevious(){
    if (this.currentPage() && this.hasPreviousPage()) {
      this.navigateToPage(this.currentPage()! - 1);
    }
  }

  goToNext(){
    if (this.currentPage() && this.hasNextPage()) {
      this.navigateToPage(this.currentPage()! + 1);
    }
  }

  openDialog(carId: string){
    this.carToDelete.set(
      this.items().find(
        (car) => car.id == carId
      )
    )
    
    this.isDialogOpen.set(true);
  }

  closeDialog(){
    this.isDialogOpen.set(false);
  }

  onDialogConfirmation() {
    if (!this.carToDelete()){
      alert('There was an unexpected error deleting the car');
      return;
    }

    this.carsService.deleteCar(this.carToDelete()!.id).subscribe({
      next: () => {
        alert('Car deleted successfully.');
        this.refreshCars();
      },

      error: (error: HttpErrorResponse) => {
        switch(error.status){
          case 403:
            alert('You do not have permission to edit a car.');
            break;
          case 404:
            alert('This car does not exist.');
            break;
          default:
            alert('There was an unexpected error deleting the car');
            break;
        }
      }
    });

    this.isDialogOpen.set(false);
  }
}
