import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OcrService } from '../../../services/ocr.service';
import { SyncService } from '../../../services/sync.service';
import { ThemeService } from '../../../services/theme.service';
import { WordService } from '../../../services/word.service';
import Theme from '../../models/theme.model';
import { imageValidator } from '../../validators/image-validator.directive';

@Component({
  selector: 'app-add-word',
  templateUrl: './add-word.component.html',
  styleUrls: ['./add-word.component.css']
})
export class AddWordComponent implements OnInit {

  wordForm;
  message: string;
  themes: Array<Theme>;
  readImageLoadingDef: boolean;
  readImageLoadingKnowMore: boolean;
  imageName: string;
  image: any;
  imageUrl: any;
  invalidSize: boolean;
  imageSize: number;

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService,
              private wordService: WordService,
              private ocrService: OcrService,
              private syncService: SyncService,
              private toastr: ToastrService) {
    this.imageName = 'Image';
    this.imageSize = 0;
    this.invalidSize = false;
  }

  async ngOnInit(): Promise<any> {
    this.initWordForm();
    this.themes = await this.themeService.getThemes('true') as Array<Theme>;
  }

  initWordForm(): void {
    this.wordForm = this.formBuilder.group({
      word: ['', [Validators.required, Validators.maxLength(40)]],
      definition: ['', [Validators.required]],
      knowMore: [''],
      theme: ['', [Validators.required]],
      image: ['', imageValidator()],
      legend: ['']
    });
  }

  onSubmitForm(): void {
    if (this.wordForm.valid) {
      // Pour chacun des themes choisis on recherche dans la liste initiale le titre correspondant à l'ID
      const themesObj = [];
      for (const theme of this.wordForm.get('theme').value) {
        themesObj.push(this.themes.find(element => element._id === theme));
      }

      // On contruit l'objet à envoyer en BDD
      const wordInfo =  JSON.stringify({
        title: this.wordForm.get('word').value,
        definition: this.wordForm.get('definition').value,
        know_more: this.wordForm.get('knowMore').value,
        themes: themesObj,
        last_edit : new Date().getTime(),
        published: 'true',
        legend: this.wordForm.get('legend').value
      }, undefined, 2);

      const formData = new FormData();
      if (this.image) {
        formData.append('image', this.image);
        formData.append('imageSize', this.image.size);
      }
      formData.append('wordInfo', wordInfo);

      this.onResetImage();
      this.message = 'saved';
      this.wordForm.reset();
      this.wordService.addWord(formData);
    } else {
      this.message = 'error';
    }
  }

  /**
   * Méthode permettant de fermer la fenêtre d'information "Définition créée"
   */
  onClose(): void {
    this.message = 'none';
  }

  /**
   * Méthode permettant de réupérer l'image sélectionnée dans le champ input file et de l'envoyer au service ocr pour
   * reconnaissance. Le résultat est affiché dans le champ Définition
   * @param element L'élément input de type file
   */
  onImageRecognition(element): void {
    // On vérifie que la navigation se fait en ligne
    if (this.syncService.getIsOnline()) {

      // on récupère l'image
      const image = element.target.files[0];

      if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
        this.toastr.error('Le fichier choisi doit être de type png ou jpg.', 'Erreur du format d\'image');
      } else {
        // on active le spinner de chargement
        this.activateLoaders(element);

        const formData = new FormData();
        formData.append('file', image);

        // On lance la reconnaissance d'image depuis l'ocrservice
        // Si ça fonctionne, on désactive le spinner et on affiche le résultat dans les champs
        this.ocrService.readImage(formData)
            .then(success => {
              this.displayOcrResults(element, success);
            });
      }
    } else {
      this.toastr.warning('Veuillez attendre de récupérer la connexion avant de réessayer la reconnaissance d\'image',
          'Vous êtes hors ligne');
    }
  }

  /**
   * Méthode permettabnt d'activer les loaders concernés
   * @param element L'input sur lequel l'utilisateur a cliqué
   */
  activateLoaders(element): void {
    if (element.target.id === 'inputFileDef') {
      this.readImageLoadingDef = true;
    }
    if (element.target.id === 'inputFileKnowMore') {
      this.readImageLoadingKnowMore = true;
    }
  }

  /**
   * Méthode permettant d'afficher le résultat de l'ocr dans le champ désiré et de désactivé le spinner
   * @param element L'input sur lequel l'utilisateur a cliqué
   * @param response Le résultat de la reconnaissance d'image
   */
  displayOcrResults(element, response): void {
    if (element.target.id === 'inputFileDef') {
      this.readImageLoadingDef = false;
      this.wordForm.controls.definition.setValue(response.textResponse);
    }

    if (element.target.id === 'inputFileKnowMore') {
      this.readImageLoadingKnowMore = false;
      this.wordForm.controls.knowMore.setValue(response.textResponse);
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
    this.wordForm.get('image')
        .reset();
    this.image = undefined;
    this.imageUrl = undefined;
    this.imageName = 'Image';
    this.invalidSize = false;
  }
}
