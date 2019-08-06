import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImportService } from '../../services/import.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent implements OnInit {

  importForm;
  fileImport: File;
  loader = false;
  fileName = 'Choisir un fichier';

  constructor(private formBuilder: FormBuilder,
              private importService: ImportService,
              private toastr: ToastrService) { }

  async ngOnInit(): Promise<any> {
    this.initForm();
  }

  initForm(): void {
    this.importForm = this.formBuilder.group({
      file: ['', Validators.required]
    });
  }

  async onSubmitForm(): Promise<any> {
    if (this.importForm.valid && this.fileImport) {
      this.loader = true;
      this.importService.importDefinitions(this.fileImport, () => {
          this.loader = false;
      });
    }
  }

  /**
   * Méthode qui permet de récupérer le fichier sélectionné et des faire certains premier contrôle dessus.
   * @param event
   */
  onFileChange(event): void {
    if (event.target.files && event.target.files.length) {
      const fileExtension = event.target.files[0].name.split('.')[1];
      if (fileExtension === 'csv') {
        this.fileImport = event.target.files;
        this.fileName = this.fileImport[0].name;
      } else {
        this.importForm.reset();
        this.toastr.warning('Le fichier doit être de type csv');
      }
    }
  }

}
