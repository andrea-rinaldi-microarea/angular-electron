import { Component, ChangeDetectorRef } from '@angular/core';

declare var dialog: any;
declare var fs: any;
declare var parseString: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  fileName:string = "";
  message: string = "";
  targets: string[];

  constructor(private chd: ChangeDetectorRef) {}

  ngOnInit() {
    fs.readdir('./dist/assets/targets', (err, files) => {
      this.targets = files;
      this.chd.detectChanges();
    });
    var xml = "<root>Hello xml2js!</root>"
     parseString(xml, function (err, result) {
      console.dir(result);
    });
  }

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
