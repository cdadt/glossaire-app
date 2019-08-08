import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  image: any;
  imageName: string;
  imageUrl: any;
  imageSize: number;
  invalidSize: boolean;
  themeToEdit: Theme;

  constructor(private formBuilder: FormBuilder,
              private themeService: ThemeService,
              private route: ActivatedRoute,
              private toastr: ToastrService) {
    this.imageName = 'Image';
    this.imageSize = 0;
    this.invalidSize = false;
  }

  async ngOnInit(): Promise<any> {
    this.initThemeForm();

    this.route.params.subscribe(async params => {
      if (params.id !== undefined) {
        this.themeToEdit = await this.themeService.getThemeById(params.id) as Theme;
        this.initThemeForm(this.themeToEdit.title);
        this.imageUrl = `data:${this.themeToEdit.img.contentType};base64,${this.themeToEdit.img.data}`;
        this.imageSize = Math.round(parseInt(this.themeToEdit.img.size, 10) / 10000) / 100;
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
    if (this.themeForm.valid && this.imageSize < 1000000) {
      const theme = this.themeForm.get('theme').value;

      const formData = new FormData();
      if (this.imageUrl) {
        formData.append('image', this.image);
        formData.append('imageSize', this.image.size);
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
