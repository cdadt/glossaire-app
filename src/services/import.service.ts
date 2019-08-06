import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Theme from '../app/models/theme.model';
import { environment } from '../environments/environment';
import { ThemeService } from './theme.service';
import { WordService } from './word.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  file: File;
  reader: FileReader = new FileReader();
  themes: Array<Theme>;
  rows: Array<any>;

  constructor(private wordService: WordService,
              private themeService: ThemeService,
              private toastr: ToastrService,
              private http: HttpClient) {
    this.init();
  }

  /**
   * Méthode qui envoi les lignes du fichier en backend.
   */
  sendImportRows(): void {
    this.http.post(`${environment.apiUrl}/import`, this.rows, { responseType: 'text' })
        .subscribe();
  }

  /**
   * Méthode d'accès au service pour utiliser l'import de définition à partir d'un fichier.
   * @param file: le fichier d'import.
   */
  async importDefinitions(file: File, callback): Promise<any> {
    this.file = file[0];
    this.readImportFile(() => {
      this.sendImportRows();
    }, () => {
      callback();
    });
  }

  /**
   * Méthode qui permet de récupérer tous les thèmes existant à la construction du service pour comparer lors des imports.
   */
  private async init(): Promise<any> {
    this.themes = await this.themeService.getThemes() as Array<Theme>;
    this.rows = [];
  }

  /**
   * Méthode qui permet de parcourir le fichier csv.
   */
  private async readImportFile(callbackSuccess, callbackFinally): Promise<any> {
    this.reader.onload = async () => {
      const lines = (this.reader.result as string).split('\n');
      const isFileValid = await this.isImportFileValid(lines);
      if (isFileValid) {
        for (let i = 0; i < lines.length; i++) {
          this.importOneDefinition(lines[i]);
        }
        callbackSuccess();
        this.toastr.success('Toutes les définitions ont été importées dans le système.');
      } else {
        this.toastr.error('Vérifier le fichier avant de l\'importer', 'Fichier d\'import invalide');
      }
      callbackFinally();
    };
    this.reader.readAsText(this.file);
  }

  /**
   * Méthode qui permet de vérifier que le fichier est conforme avant de l'importer.
   * @param lines: les lignes du fichier à vérifier.
   */
  private async isImportFileValid(lines: any): Promise<boolean> {
    // Pour chaque ligne
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].split(';');
      // On vérifie que le mot n'existe pas déjà et que le minimum d'info est présent.
      const existWord = await this.wordService.existWordTitle(line[0]);
      if (existWord || line.length < 4) {
        return false;
      }

      // Pour chaque élément de la ligne
      for (let j = 3; j < line.length; j++) {
        // On vérifie que les thèmes saisis existe.
        if (this.themes.find(element => element.title === line[j].trim()) === undefined) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Méthode qui permet d'utiliser une ligne pour importer une définition.
   */
  private importOneDefinition(line: String): void {
    const thisLine = line.split(';');
    const themesObj = [];

    for (let i = 3; i < thisLine.length; i++) {
      themesObj.push(this.themes.find(element => element.title === thisLine[i].trim()));
    }

    // On contruit l'objet à envoyer en BDD
    const wordInfo = {
      title: thisLine[0].trim(),
      definition: thisLine[1].trim(),
      know_more: thisLine[2].trim(),
      themes: themesObj,
      last_edit: new Date().getTime()
    };
    this.rows.push(wordInfo);
  }
}
