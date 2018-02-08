import { Component, ChangeDetectorRef } from '@angular/core';
import { Job } from './model/job.model';
import { Mapping } from './model/mapping.model';
import { Column, Type } from './model/column.model';
import { Copy, Fixed } from './model/rule.model';

declare var dialog: any;
declare var fs: any;
declare var xml2js: any;
declare var path: any;
declare var xml: any;
declare var csvParse: any;
declare function isElectron();

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

  job: Job = new Job();

  constructor(private chd: ChangeDetectorRef) {}

  ngOnInit() {
    if (isElectron()) {
      fs.readdir(TARGET_REPO, (err, files) => {
        this.targets = files;
        this.chd.detectChanges();
      });
    }

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

    this.job.targetTable = "MA_Items";
    this.job.mappings.push(new Mapping(new Column("Item", Type.String, 21 ), 0, new Copy()));
    this.job.mappings.push(new Mapping(new Column("Description", Type.String, 128 ), 5, new Copy()));
    this.job.mappings.push(new Mapping(new Column("InternalNote", Type.String, 128 ), 6, new Copy()));
    this.job.mappings.push(new Mapping(new Column("ShortDescription", Type.String, 40 ), 7, new Copy()));
    this.job.mappings.push(new Mapping(new Column("BasePrice", Type.Money, 0 ), 9, new Copy()));
    this.job.mappings.push(new Mapping(new Column("BaseUoM", Type.String, 8 ), 12, new Copy()));
    this.job.mappings.push(new Mapping(new Column("IsGood", Type.Bool, 0 ), null, new Fixed("1")));


    var output = {
      DataTables : [
      ]
    }
    for (let idx in this.result) {
      if (idx == "0")
        continue;
      let rec = this.result[idx];
      var row: any = {};
      var attributes: any = {};
      for (let mapping of this.job.mappings) {
        attributes[mapping.targetColumn.name] = mapping.rule.apply(mapping.sourceColumn ? rec[mapping.sourceColumn] : "", mapping.targetColumn);
      }
      row[this.job.targetTable] = { _attr: attributes };
      output.DataTables.push(row);
    }
    var strOut = xml(output, {declaration: { standalone: 'yes', encoding: 'UTF-8' }, indent: true});
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
