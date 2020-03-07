import { Component, OnInit } from '@angular/core';
import {GameService} from '../gameService.service';

interface Level {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})



export class BoardComponent implements OnInit {

  gameStatusTitle = "Game In Progress";
  levels: Level[] = [
    {value: '1', viewValue: 'Level 1'},
    {value: '2', viewValue: 'Level 2'},
    {value: '3', viewValue: 'Level 3'},
    {value: '4', viewValue: 'Level 4'}
  ];
  currentLevel = 1;
  items = new Array();

  constructor(private gameService:GameService) {
    for (let i = 0; i < 200; i++) {
        this.items.push(i);
    }
   }

  ngOnInit() {

  }



}
