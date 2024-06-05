import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = 'http://127.0.0.1:8000/upload-image-model3/';

  constructor(private http: HttpClient) {}

  uploadImage(imageBlob: Blob): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');
    return this.http.post(this.apiUrl, formData);
  }
}
