import { Component, ChangeDetectorRef } from '@angular/core';


declare var dialog: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  fileName:string = "";
  message: string = "";

  constructor(private chd: ChangeDetectorRef) {}

  onOpen() {
        dialog.showOpenDialog({title:'select'}, (filenames) => {
      console.log(filenames);
      this.fileName = filenames[0];
      this.chd.detectChanges();
    });
  }

  onSave() {
    this.message = "saved";
  }
}
