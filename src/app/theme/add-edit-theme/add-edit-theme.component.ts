import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ImageInfos, ImageService } from '../../../services/image.service';
import { ThemeService } from '../../../services/theme.service';
import Theme from '../../models/theme.model';
import { imageValidator } from '../../validators/image-validator.directive';

@Component({
  selector: 'app-add-word',
  templateUrl: './add-edit-theme.component.html',
  styleUrls: ['./add-edit-theme.component.css']
})
export class AddEditThemeComponent implements OnInit {

  themeForm;
  themes: Array<Theme>;
  themeToEdit: Theme;
  illustration: any;
  imageSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService,
              private route: ActivatedRoute,
              private toastr: ToastrService,
              private imageService: ImageService) {
  }

  async ngOnInit(): Promise<any> {
    this.initThemeForm();

    this.imageSubscription = this.imageService.imageSubject.subscribe(
        (image: ImageInfos) => {
          this.illustration = image;
        }
    );
    this.imageService.emitImage();

    this.route.params.subscribe(async params => {
      if (params.id !== undefined) {
        this.themeToEdit = await this.themeService.getThemeById(params.id) as Theme;
        this.initThemeForm(this.themeToEdit.title);
        this.imageService.image.imageUrl = `data:${this.themeToEdit.img.contentType};base64,${this.themeToEdit.img.data}`;
        this.imageService.image.imageSize = Math.round(parseInt(this.themeToEdit.img.size, 10) / 10000) / 100;
        this.imageService.emitImage();
      }
    });

  }

  /**
   * Méthode d'initialisation du formulaire d'ajout de theme
   */
  initThemeForm(valueTheme = '', valueImage = ''): void {
    this.themeForm = this.formBuilder.group({
      theme: [valueTheme, [Validators.required, Validators.maxLength(40)]],
      image: [valueImage, imageValidator()]
    });
  }

  /**
   * Méthode appelée lors de la soumission du formulaire
   * Elle enregistre le contenu du formulaire ou renvoie une erreur si le formulaire est invalide
   */
  onSubmitForm(): void {
    if (this.themeForm.valid && this.illustration.imageSize < 1000000) {
      const theme = this.themeForm.get('theme').value;

      const formData = new FormData();
      if (this.illustration.image) {
        formData.append('image', this.illustration.image);
        formData.append('imageSize', this.illustration.image.size);
      }
      formData.append('title', theme);

      // On réinitialise les champs et on envoie
      if (this.themeToEdit) {
        formData.append('_id', this.themeToEdit._id);
        formData.append('published', this.themeToEdit.published);
        this.themeService.editOneTheme(formData);
      } else {
        formData.append('published', 'true');
        this.themeForm.get('theme')
            .reset();
        this.onResetImage();
        this.themeService.addTheme(formData);
      }
    } else {
      this.toastr.error('Le formulaire n\'est pas valide.');
    }
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
    this.themeForm.get('image')
        .reset();
    this.imageService.resetImage();
  }
}
