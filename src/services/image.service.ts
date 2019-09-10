import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ImageInfos {
  image: any;
  imageName: string;
  imageUrl: any;
  invalidSize: boolean;
  imageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  image: ImageInfos = {
    image : undefined,
    imageName : 'Image',
    imageSize: 0,
    imageUrl: undefined,
    invalidSize: false
  };
  imageSubject = new Subject<ImageInfos>();

  constructor() {
    this.emitImage();
  }

  /**
   * Permet de mettre à jour l'abonnement à la liste des thèmes
   */
  emitImage(): void {
    this.imageSubject.next(this.image);
  }

  /**
   * Méthode permettant de créer la prévisualisation de l'image et de vérifier la taille du fichier avant l'envoi
   * @param element Le champ image
   */
  imageChange(element): void {
    this.image.image = element.target.files[0];
    this.image.imageName = this.image.image.name;

    // On crée l'aperçu de l'image
    const reader = new FileReader();
    reader.readAsDataURL(this.image.image);
    reader.onload = _event => {
      this.image.imageUrl = reader.result;
    };

    // On vérifie la taille du fichier
    this.image.invalidSize = this.image.image.size > 1000000;
    this.image.imageSize = Math.round(this.image.image.size / 10000) / 100;
    this.emitImage();
  }

  /**
   * Méthode permettant de réinitiliser le champ image et la prévisualisation
   */
  resetImage(): void {
    // this.wordForm.get('image')
    //     .reset();
    this.image.image = undefined;
    this.image.imageUrl = undefined;
    this.image.imageName = 'Image';
    this.image.invalidSize = false;
    this.emitImage();
  }
}
