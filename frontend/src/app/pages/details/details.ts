import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CarDetailDto } from '../../../model/DTO/car-detail-dto';
import { CarsService } from '../../../services/cars-service/cars-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Dialog } from '../../shared/dialog/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UploadedCarDocumentResponseDto } from '../../../model/DTO/uploaded-car-document-response-dto';

@Component({
  selector: 'app-details',
  imports: [CurrencyPipe, DatePipe, RouterLink, Dialog, ReactiveFormsModule],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details implements OnInit {
  carId: string|null = null;

  isDialogOpen: WritableSignal<boolean> = signal(false);

  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<any> = signal(null);
  carDetails: WritableSignal<CarDetailDto|null> = signal(null);

  uploadFileForm: FormGroup;
  selectedFile: File | null = null;
  fileError = signal<string|null>(null);
  fileSuccess = signal<string|null>(null);
  
  uploadedFile = signal<UploadedCarDocumentResponseDto|null>(null);

  constructor (
    private carsService: CarsService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.uploadFileForm = this.fb.group({
      file: [null, Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.carId = this.route.snapshot.paramMap.get('id');
    this.getCarDetails();
    this.getFile();
  }

  getCarDetails(): void {
    if (this.carId == null) 
      throw new Error("Car ID should not be null");
    
    this.loading.set(true);

    this.carsService.getCarDetails(this.carId).subscribe({
      next: (carDetails) => {
        this.carDetails.set(carDetails);
      },

      error: (error) => {
        this.loading.set(false);
        this.error.set(error);
        this.carDetails.set(null);

        console.log(error)
      },

      complete: () => {
        this.loading.set(false);
        this.error.set(null);
      }
    });
  }

  getFile(): void {
    if (!this.carId) return;
    this.carsService.getFile(this.carId).subscribe({
      next: (fileResponse: UploadedCarDocumentResponseDto) => {
        this.uploadedFile.set(fileResponse);
      },

      error: (error: HttpErrorResponse)=>{
        alert(error.message);
      }, // TODO handle error
    });
  }

  openDialog(){
    this.isDialogOpen.set(true);
  }

  closeDialog(){
    this.isDialogOpen.set(false);
  }

  onDialogConfirmation(){
    alert(`DELETE CAR ${this.carDetails()?.brand.name ?? 'ERROR'} ${this.carDetails()?.model.name ?? 'ERROR'}`);
    this.isDialogOpen.set(false);
  }

  onSubmitFileForm(){
    if (this.uploadFileForm.invalid) {
      this.fileError.set('Form is invalid');
      return;
    }

    if (!this.selectedFile) {
      this.fileError.set('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    
    const description = this.uploadFileForm.get('description')?.value;
    if (description) {
      formData.append('description', description);
    }

    this.uploadFile(formData);
  }

  uploadFile(formData: FormData) {
    if (!this.carId){
      this.fileError.set('Unknown error');
      return;
    }

    this.carsService.uploadFile(
      this.carId!, 
      formData
    ).subscribe({
      next: () => {
        this.fileError.set(null);
        this.fileSuccess.set('File uploaded successfully');
      },

      error: (error: HttpErrorResponse) => {
        this.fileSuccess.set(null);
        switch(error.status){  
          case 403:
            this.fileError.set('You do not have permission to upload a file');
            break;
          case 404:
            this.fileError.set('Car not found');
            break;
          case 413:
            this.fileError.set('File is too large (max. 5MB)');
            break;
          case 415:
            this.fileError.set('Unsupported file type');
            break;
          case 400:
          default:
            this.fileError.set('Unknown error');
            break;
        }
      }
    });
  }

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length == 0)
      return;

    const file = input.files[0];

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/png'];
  
    if (file.size > maxSize) {
      this.fileError.set('The file is too large (max. 5MB)');
      this.uploadFileForm.patchValue({ file: null });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.fileError.set('File type not allowed');
      this.uploadFileForm.patchValue({ file: null });
      return;
    }

    this.selectedFile = file;
    this.uploadFileForm.patchValue({ file: file });
    this.fileError.set(null);
  }

  downloadFile(){

  }
}