import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-model1',
  templateUrl: './model1.component.html',
  styleUrls: ['./model1.component.css']
})
export class Model1Component implements AfterViewInit {
  resultado: string = '';

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  setupCanvas(): void {
    const canvas = document.getElementById('canvas-model1') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('2D context not supported or canvas already initialized');
      return;
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;  // Ajustar el grosor del trazo para un canvas más grande

    let mousedown = false;

    canvas.onmousedown = (e: MouseEvent) => {
      const pos = this.getMousePos(canvas, e);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mousedown = true;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);

      // Limpiar el canvas oculto al iniciar un nuevo dibujo
      const hiddenCanvas = document.getElementById('hidden-canvas-model1') as HTMLCanvasElement;
      const hiddenCtx = hiddenCanvas.getContext('2d');
      if (hiddenCtx) {
        hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      }

      return false;
    };

    canvas.onmousemove = (e: MouseEvent) => {
      if (!mousedown) return;
      const pos = this.getMousePos(canvas, e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    canvas.onmouseup = () => {
      mousedown = false;

      // Redimensionar la imagen a 28x28
      const hiddenCanvas = document.getElementById('hidden-canvas-model1') as HTMLCanvasElement;
      const hiddenCtx = hiddenCanvas.getContext('2d');
      if (!hiddenCtx) {
        console.error('2D context not supported or canvas already initialized');
        return;
      }
      hiddenCtx.drawImage(canvas, 0, 0, 28, 28);

      // Arreglo para almacenar los pixeles
      const pixels: string[] = [];
      for (let y = 0; y < 28; y++) { // Cambiado el orden a y,x
        for (let x = 0; x < 28; x++) { // Cambiado el orden a y,x
          const imgData = hiddenCtx.getImageData(x, y, 1, 1).data; // Cambiado el orden a y,x
          const color = (imgData[3] / 255).toFixed(2);
          pixels.push(color);
        }
      }

      console.log(pixels);

      this.http.post<{ prediction: string }>('http://localhost:8000/predict/', { pixeles: pixels.join(',') })
        .subscribe(response => {
          console.log('Resultado: ' + response.prediction);
          this.resultado = response.prediction;
        });
    };
  }

  getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
}
