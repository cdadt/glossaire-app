import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Tesseract } from 'tesseract.ts';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

    constructor(private http: HttpClient) {
        // CONSTRUCTOR
    }

    readImage(image: any): Promise<any> {
    //     Tesseract
    //         .recognize(image, 'fra')
    //         .progress(console.log)
    //         .then((res: any) => {
    //             console.log(res.text);
    //         })
    //         .catch(console.error);

        return this.http.post<any>(`${environment.apiUrl}/ocr`, image)
            .toPromise();
    }
}
