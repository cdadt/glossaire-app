import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { WordService } from '../../services/word.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  nbWaintingDef: Number;
  user = this.authService.getUserDetails();

  constructor(private wordService: WordService,
              private authService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.getNbWaitingDef();
  }

  private async getNbWaitingDef(): Promise<void> {
    this.nbWaintingDef = await this.wordService.countWaitingWord() as Number;
  }

}
