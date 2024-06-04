import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  resultado: string = '';

  ngOnInit(): void {
    this.setupCanvas();
  }

  setupCanvas(): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('2D context not supported or canvas already initialized');
      return;
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;  // Ajustar el grosor del trazo para un canvas más grande

    let mousedown = false;

    canvas.onmousedown = (e: MouseEvent) => {
      const pos = this.fixPosition(e, canvas);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mousedown = true;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);

      // Limpiar el canvas oculto al iniciar un nuevo dibujo
      const hiddenCanvas = document.getElementById('hidden-canvas') as HTMLCanvasElement;
      const hiddenCtx = hiddenCanvas.getContext('2d');
      if (hiddenCtx) {
        hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      }

      return false;
    };

    canvas.onmousemove = (e: MouseEvent) => {
      if (!mousedown) return;
      const pos = this.fixPosition(e, canvas);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    canvas.onmouseup = () => {
      mousedown = false;

      // Redimensionar la imagen a 28x28
      const hiddenCanvas = document.getElementById('hidden-canvas') as HTMLCanvasElement;
      const hiddenCtx = hiddenCanvas.getContext('2d');
      if (!hiddenCtx) {
        console.error('2D context not supported or canvas already initialized');
        return;
      }
      hiddenCtx.drawImage(canvas, 0, 0, 28, 28);

      // Arreglo para almacenar los pixeles
      const pixels: string[] = [];
      for (let x = 0; x < 28; x++) {
        for (let y = 0; y < 28; y++) {
          const imgData = hiddenCtx.getImageData(x, y, 1, 1).data;
          const color = (imgData[3] / 255).toFixed(2);
          pixels.push(color);
        }
      }

      console.log(pixels);

      $.ajax({
        url: 'http://localhost:8000/predict/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ pixeles: pixels.join(',') }),
        success: (response: any) => {
          console.log('Resultado: ' + response.prediction);
          this.resultado = response.prediction;
        },
      });
    };
  }

  fixPosition(e: MouseEvent, gCanvasElement: HTMLCanvasElement): { x: number; y: number } {
    let x = e.pageX - gCanvasElement.offsetLeft;
    let y = e.pageY - gCanvasElement.offsetTop;
    return { x, y };
  }
}
