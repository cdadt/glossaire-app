import { Component, OnInit } from '@angular/core';
import { WordService } from '../../services/word.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
