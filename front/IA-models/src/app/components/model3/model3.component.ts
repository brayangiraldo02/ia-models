import { Component, ElementRef, ViewChild} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-model3',
  templateUrl: './model3.component.html',
  styleUrls: ['./model3.component.css']
})
export class Model3Component {
  // Webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  public webcamImage: WebcamImage | null = null;
  public showWebcam = true;

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  public takeSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
}
