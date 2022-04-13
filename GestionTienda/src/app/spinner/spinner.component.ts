import { Component, OnInit } from '@angular/core';
import { SpinnerLoaderService } from '../services/spinner-loader.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  loading: boolean;
  constructor(private loaderService: SpinnerLoaderService) {
      this.loaderService.isLoading.subscribe((v) => {
        //console.log(v);
        this.loading = v;
      });
   }
  
  ngOnInit() {
  }

}
