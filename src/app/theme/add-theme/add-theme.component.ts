import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import Theme from '../../models/theme.model';
import { imageValidator } from '../../validators/image-validator.directive';

@Component({
  selector: 'app-add-word',
  templateUrl: './add-theme.component.html',
  styleUrls: ['./add-theme.component.css']
})
export class AddThemeComponent implements OnInit {

  themeForm;
  message: string;
  themes: Array<Theme>;
  readImageLoadingDef: boolean;
  readImageLoadingKnowMore: boolean;
  image: any;
  imageName: string;
  imageUrl: any;
  imageSize: number;
  invalidSize: boolean;

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService) {
    this.imageName = 'Image';
    this.imageSize = 0;
    this.invalidSize = false;
  }

  async ngOnInit(): Promise<any> {
    this.initThemeForm();
  }

  /**
   * Méthode d'initialisation du formulaire d'ajout de theme
   */
  initThemeForm(): void {
    this.themeForm = this.formBuilder.group({
      theme: ['', [Validators.required, Validators.maxLength(40)]],
      image: ['', imageValidator()]
    });
  }

  /**
   * Méthode appelée lors de la soumission du formulaire
   * Elle enregistre le contenu du formulaire ou renvoie une erreur si le formulaire est invalide
   */
  onSubmitForm(): void {
    if (this.themeForm.valid && this.imageSize < 1000000) {
      const theme = this.themeForm.get('theme').value;

      const formData = new FormData();
      if (this.image) {
        formData.append('image', this.image, 'test.png');
      }
      formData.append('title', theme);
      // On contruit l'objet à envoyer en BDD
console.log('formData title : ', formData.get('title'));
      this.message = 'saved';
      this.themeForm.get('theme')
          .reset();
      this.onResetImage();
      this.themeService.addTheme(formData);
    } else {
      this.message = 'error';
    }
  }

  /**
   * Méthode permettant de créer la prévisualisation de l'image et de vérifier la taille du fichier avant l'envoi
   * @param element Le champ image
   */
  onInputImageChange(element): void {
    this.image = element.target.files[0];
    this.imageName = this.image.name;

    // On crée l'aperçu de l'image
    const reader = new FileReader();
    reader.readAsDataURL(this.image);
    reader.onload = _event => {
      this.imageUrl = reader.result;
    };

    // On vérifie la taille du fichier
    this.invalidSize = this.image.size > 1000000;
    this.imageSize = Math.round(this.image.size / 10000) / 100;
  }

  /**
   * Méthode permettant de réinitiliser le champ image et la prévisualisation
   */
  onResetImage(): void {
    this.themeForm.get('image')
        .reset();
    this.image = undefined;
    this.imageUrl = undefined;
    this.imageName = 'Image';
    this.invalidSize = false;
  }
}
