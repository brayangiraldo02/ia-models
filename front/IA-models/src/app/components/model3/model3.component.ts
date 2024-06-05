import { Component, HostListener } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { ImageUploadService } from './services/image-upload.service';  // Ajusta la ruta según tu estructura de archivos

@Component({
  selector: 'app-model3',
  templateUrl: './model3.component.html',
  styleUrls: ['./model3.component.css']
})
export class Model3Component {
  private trigger: Subject<void> = new Subject<void>();
  public webcamImage: WebcamImage | null = null;
  public showWebcam = true;
  public processedImageUrl: string | null = null;
  imageText: string = '';

  constructor(private imageUploadService: ImageUploadService) {}

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.uploadImage();
  }

  public takeSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  private uploadImage(): void {
    if (this.webcamImage) {
      const imageBlob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
      this.imageUploadService.uploadImage(imageBlob).subscribe(response => {
        console.log('Texto extraído:', response.text);
        if (response.text == '') {
          this.imageText = 'Error al intentar leer el texto';
        } else {
          this.imageText = response.text;
        }
        const processedImageBytes = response.image;
        const processedImageBlob = this.hexStringToBlob(processedImageBytes, 'image/jpeg');
        this.displayProcessedImage(processedImageBlob);
      }, error => {
        console.error('Error al subir la imagen:', error);
      });
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }

  private hexStringToBlob(hexString: string, mimeType: string): Blob {
    const byteArray = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return new Blob([byteArray], { type: mimeType });
  }

  private displayProcessedImage(imageBlob: Blob): void {
    this.processedImageUrl = URL.createObjectURL(imageBlob);
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === ' ' && this.showWebcam) {
      this.takeSnapshot();
    }
  }
}