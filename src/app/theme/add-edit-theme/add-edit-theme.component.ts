import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
              private imageService: ImageService,
              private router: Router) {
  }

  async ngOnInit(): Promise<any> {
    this.initThemeForm();
    this.onResetImage();

    this.route.params.subscribe(async params => {
      try {
        // Dans le cas d'une édition
        if (params.id !== undefined) {
          this.themeToEdit = await this.themeService.getThemeById(params.id) as Theme;
          this.initThemeForm(this.themeToEdit.title);
          this.imageService.image.imageUrl = `${this.themeToEdit.img.data}`;
          this.imageService.image.imageSize = Math.round(parseInt(this.themeToEdit.img.size, 10) / 10000) / 100;
          this.imageService.emitImage();
        }
      } catch (error) {
        this.router.navigateByUrl('/404');
      }
    });

    this.imageSubscription = this.imageService.imageSubject.subscribe(
        (image: ImageInfos) => {
          this.illustration = image;
        }
    );
    this.imageService.emitImage();
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
      const themeInfo = this.createThemeInfo(theme);

      if (this.illustration.image) {
        const reader = new FileReader();
        reader.readAsDataURL(this.illustration.image);

        reader.onload = async () => {
          // On ajoute l'image
          themeInfo.image = reader.result;
          themeInfo.imageSize = this.illustration.image.size;

          // On envoie le tout
          this.sendThemeInfo(themeInfo);
        };
      } else {
        this.sendThemeInfo(themeInfo);
      }
    } else {
      this.toastr.error('Le formulaire n\'est pas valide.');
    }
  }

  /**
   * Méthode permettant de créer l'objet thème
   * @param title Le titre tu thème
   */
  createThemeInfo(title): any {
    return {
      _id: undefined,
      title,
      image: undefined,
      imageSize: undefined,
      published: undefined
    };
  }

  /**
   * Méthode permettant d'envoyer les informations du thème ajoute ou modifié en BDD
   * @param themeInfo L'objet Thème
   */
  sendThemeInfo(themeInfo): void {
    if (this.themeToEdit) {
      themeInfo._id = this.themeToEdit._id;
      themeInfo.published = this.themeToEdit.published;
      this.themeService.editOneTheme(themeInfo);
    } else {
      themeInfo.published = true;
      this.themeForm.get('theme')
          .reset();
      this.onResetImage();
      this.themeService.addTheme(themeInfo);
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
