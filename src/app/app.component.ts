import { Component, ChangeDetectorRef } from '@angular/core';

declare var dialog: any;
declare var fs: any;
declare var xml2js: any;
declare var path: any;
declare var xml: any;
declare var csvParse: any;

const TARGET_REPO = './dist/assets/targets';

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
  result:string[][];
  input: string;
  folderName: string = "";

  constructor(private chd: ChangeDetectorRef) {}

  ngOnInit() {
    fs.readdir(TARGET_REPO, (err, files) => {
      this.targets = files;
      this.chd.detectChanges();
    });
  }

  onOpen() {
        dialog.showOpenDialog({title:'select'}, (filenames) => {
      console.log(filenames);
      this.fileName = filenames[0];
      this.chd.detectChanges();
    });
  }

  onBrowse() {
        dialog.showOpenDialog({title:'output folder', properties: ["openDirectory"] }, (folders) => {
      console.log(folders);
      this.folderName = folders[0];
      this.chd.detectChanges();
    });
  }

  onLoad() {
    fs.readFile(this.fileName, 'latin1', (err, data) => {
      if (err) {
        console.log("Read failed: " + err);
      }
      var s1 = JSON.stringify(data);
      var s2 = JSON.parse(s1);
      this.input = String(data);
      csvParse(this.input, {delimiter: ';'}, (err, output) => {
        console.log(output);
        this.result= output;
      });
    });
    
  }

  onTargetSelected(target: string) {
    fs.readFile(path.join(TARGET_REPO, target), (err, data) => {
      if (err) {
        console.log("Read failed: " + err);
      }
      this.input = String(data);
      var parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        console.dir(result);
      });
    
    });
  }

  onSave() {
    var output = {
      DataTables : [
      ]
    }
    for (let idx in this.result) {
      if (idx == "0")
        continue;
      let rec = this.result[idx];
      output.DataTables.push({MA_Items: { _attr: { 
        Item : rec[0],
        Description: rec[5],
        InternalNote: rec[6],
        ShortDescription: rec[7],
        BasePrice: rec[9].replace(',','.'),
        BaseUoM: rec[12]
      }}});
    }
    var strOut = xml(output, {declaration: { standalone: 'yes', encoding: 'UTF-16' }, indent: true});
    console.log(strOut);
    
    fs.writeFile(path.join(this.folderName, 'MA_Items.xml'), strOut, function (err) {
      if (err) {
        console.log("Write failed: " + err);
        return;
      }
  
      console.log("Write completed.");
    });
    
  }
}
