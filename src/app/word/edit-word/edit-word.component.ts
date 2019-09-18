import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as FrenchStrings } from 'ngx-timeago/language-strings/fr';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { ImageInfos, ImageService } from '../../../services/image.service';
import { ThemeService } from '../../../services/theme.service';
import { WordService } from '../../../services/word.service';
import Theme from '../../models/theme.model';
import Word from '../../models/word.model';
import { imageValidator } from '../../validators/image-validator.directive';

@Component({
  selector: 'app-edit-word',
  templateUrl: './edit-word.component.html',
  styleUrls: ['./edit-word.component.css']
})
export class EditWordComponent implements OnInit {

  word: Word;
  wordSubject = new Subject<Word>();
  open: boolean;
  live: true;
  displayDeleteWindow: boolean;
  edit: string;
  themes: Array<Theme>;
  themeForm;
  imageForm;
  illustration: any;
  imageSubscription: Subscription;

  constructor(private wordService: WordService,
              private route: ActivatedRoute,
              intl: TimeagoIntl,
              private router: Router,
              private themeService: ThemeService,
              private formBuilder: FormBuilder,
              private imageService: ImageService,
              private toastr: ToastrService) {
    // Les fichiers de langue pour le module Ilya(Timeago)
    intl.strings = FrenchStrings;
    intl.changes.next();
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.imageSubscription = this.imageService.imageSubject.subscribe(
          (image: ImageInfos) => {
          this.illustration = image;
        }
      );
      this.imageService.emitImage();

      this.getWord(params.id);

      this.open = false;
      this.displayDeleteWindow = false;
      this.initThemeForm();
      this.initImageForm();
    });
  }

  /**
   * Méthode permettant d'initialiser un formulaire pour la liste des thèmes
   */
  initThemeForm(): void {
     this.themeForm = this.formBuilder.group({
        theme: ['', [Validators.required]]
        });
  }

    /**
     * Méthode permettant d'initialiser un formulaire pour l'upload d'une image
     */
  initImageForm(): void {
     this.imageForm = this.formBuilder.group({
         image: ['', [Validators.required, imageValidator()]]
     });
  }

  /**
   * Méthode appelée à la soumission du formulaire des thèmes
   */
  onSubmitThemeForm(): void {
      if (this.themeForm.valid) {
          // Pour chacun des themes choisis on recherche dans la liste initiale le thème correspondant à l'ID
          const themesObj = [];
          for (const theme of this.themeForm.get('theme').value) {
              themesObj.push(this.themes.find(element => {
                  delete element.img;

                  return element._id === theme;
              }));
          }
          this.updateWord('themes', themesObj);
     }
  }

  /**
   * Méthode appelée à la soumission du formulaire des thèmes
   */
  onSubmitImageForm(): void {
      if (this.imageForm.valid) {
          this.updateWord('image', 'newImage');
        }
    }

    /**
     * Méthode appelée lorsque l'utilisateur clique à côté de la zone de saisie.
     * Elle permet de récupérer la valeur du champ et appelle la méthode de mise à jour du mot.
     * @param event L'événement capture lors du 'focusout'
     * @param elemToEdit L'élement à éditer (le titre, la définition...)
     * @param required Si cet élement est requis ou non
     * @param length Taille maximum du texte (0 pour pas de limite)
     */
  onSave(event, elemToEdit, required = false, length = 0): void {
      const elemToEditValue = event.target.value;
      if (elemToEditValue.length <= length && length !== 0) {
          this.updateWord(elemToEdit, elemToEditValue, required);
      } else {
          this.toastr.error(`La taille du champ doit être inférieur à ${length} caractères.`, 'Formulaire non valide');
      }
  }

    /**
     * Méthode appelée lorsque l'utilisateur effectue un double-clic sur l'lément qu'il souhaite modifier.
     * Elle permet d'afficher la zone de saisie.
     * Si la zone saisie est un thème (val = themes) alors on va chercher la liste de tous les thèmes
     * afin de les afficher dans le formulaire.
     * @param val La valeur de la zone à afficher (title, definition, themes...)
     */
  async onEdit(val): Promise<void> {
      this.edit = `edit-${val}`;

      if (val === 'themes') {
          this.themes = await this.themeService.getThemes() as Array<Theme>;
          // On définit les thèmes préselectionnés dans le formulaire
          const tbTheme = [];
          this.word.themes.forEach(ele => {
              tbTheme.push(ele._id);
          });
          this.themeForm.patchValue({theme: tbTheme});
      }
  }

    /**
     * Méthode permettant de mettre à jour le mot sélectionné.
     * Elle construit un formData qui sera envoyé au wordService.
     * A la fin, elle annule le mode édition après avoir modifié le mot en BDD. Puis elle met à jour la page.
     * @param elemToEdit L'élément de la définition à modifier.
     * @param elemToEditValue La valeur de la modification
     * @param required Si cet élément est requis ou non
     */
  updateWord(elemToEdit, elemToEditValue, required = false): void {
      if (elemToEditValue !== '' && required || elemToEditValue === '' && !required || elemToEditValue !== '' && !required) {
          const formData = new FormData();
          const test = JSON.stringify(elemToEditValue);

          if (elemToEdit === 'image' && elemToEditValue === 'newImage') {
              formData.append('image', this.illustration.image);
              formData.append('imageSize', this.illustration.image.size);
          }
          formData.append('elemToEdit', elemToEdit);
          formData.append('elemToEditValue', test);
          formData.append('wordId', this.word._id);

          this.wordService.editWordElements(formData)
              .then(
                  async success => {
                      this.edit = undefined;
                      this.getWord(this.word._id);
                  },
                  err => {
                      this.wordService.errorActions(err);
                  }
              );
      } else {
          this.edit = undefined;
      }
  }

    /**
     * Méthode permettant de récupérer un mot et de mettre à jour les donées de ce mot
     * @param id L'id du mot à récupérer
     */
  async getWord(id): Promise<void> {
      this.word = await this.wordService.getWordById(id) as Word;
      this.emitWord();
      this.onResetImage();
  }

    /**
     * Méthode permettant d'annuler le mode édition d'un mot
     */
  onCancelEdition(): void {
      this.edit = undefined;
  }

    /**
     * Méthode permettant de créer la prévisualisation de l'image et de vérifier la taille du fichier avant l'envoi
     * @param element Le champ image
     */
  onInputImageChange(element): void {
     this.imageService.imageChange(element);
  }

    /**
     * Méthode permettant de réinitiliser le champ image et la prévisualisation
     */
  onResetImage(): void {
    this.imageForm.get('image')
     .reset();

    if (this.word.img) {
        this.imageService.image.imageUrl = `data:${this.word.img.contentType};base64,${this.word.img.data}`;
        this.imageService.image.imageSize = Math.round(parseInt(this.word.img.size, 10) / 10000) / 100;
        this.imageService.emitImage();
    } else {
        this.imageService.resetImage();
    }
   }

  onDeleteImage(): void {
     this.updateWord('image', 'deleteImage');
  }

  /**
   * Méthode permettant de publier ou dépublier un mot lors d'un clic sur le bouton correspondant
   */
  async onTogglePublishWord(): Promise<void> {
      if (this.word.published) {
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, false);

          if (updatePublishState) {
              this.word.published = false;
              this.emitWord();
          }
      } else {
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, true);
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, true);

          if (updatePublishState && updateValidateState) {
              this.word.validated = true;
              this.word.published = true;
              this.emitWord();
          }
      }
  }

   /**
    * Méthode permettant de valider ou invalider un mot lors d'un clic sur le bouton correspondant
    */
  async onToggleValidateWord(): Promise<void> {
      if (this.word.validated) {
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, false);
          const updatePublishState = await this.wordService.publishedOneWord(this.word._id, false);

          if (updatePublishState && updateValidateState) {
              this.word.validated = false;
              this.word.published = false;
              this.emitWord();
          }
      } else {
          const updateValidateState = await this.wordService.validateOneWord(this.word._id, true);

          if (updateValidateState) {
              this.word.validated = true;
              this.emitWord();
          }
      }
  }

  /**
   * Permet de mettre à jour l'abonnement au mot
   */
  emitWord(): void {
      this.wordSubject.next(this.word);
   }

    /**
     * Méthode permettant de supprimer un mot
     */
  onDeleteWord(): void {
      this.wordService.deleteOneWord(this.word._id);
      this.router.navigate(['mot/gerer']);
  }

    /**
     * Méthode permettant d'annuler la suppression d'un mot
     */
  onCancelDelete(): void {
      this.displayDeleteWindow = false;
  }

    /**
     * Méthode permettant d'afficher la fenêtre de suppression d'un mot
     */
  onDisplayDeleteWindow(): void {
        this.displayDeleteWindow = true;
  }

  /**
   * Indique si la partie "En savoir plus" est ouverte ou non
   */
  onDisplayKnowMore(): void {
    this.open = !this.open;
  }
}
