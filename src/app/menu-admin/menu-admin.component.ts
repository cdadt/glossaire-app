import { Component, OnInit } from '@angular/core';
import { WordService } from '../../services/word.service';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.component.html',
  styleUrls: ['./menu-admin.component.css']
})
export class MenuAdminComponent implements OnInit {
  nbWaintingDef: Number;

  constructor(private wordService: WordService) {
  }

  ngOnInit(): void {
    this.getNbWaitingDef();
  }

  private async getNbWaitingDef(): Promise<void> {
    this.nbWaintingDef = await this.wordService.countWaitingWord() as Number;
  }

}
