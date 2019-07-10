import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

    constructor() {
        this.readImage(undefined);
    }

    readImage(myImage: any): void {
        const {TesseractWorker} = Tesseract;

    //     worker
    //         .recognize('https://tesseract.projectnaptha.com/img/eng_bw.png')
    //         .progress(p => {
    //             console.log('progress', p);
    //         })
    //         .then(({text}) => {
    //             console.log(text);
    //             worker.terminate();
    //         });
    }
}
