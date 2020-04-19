import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ILangDef {
    name: string;
    iconSrc: string;
    lang: string;
}

@Component({
  selector: 'app-dialog-langsel',
  templateUrl: './dialog-langsel-component.html'
})
export class DialogLangselComponent implements OnInit {

  public langDefs: ILangDef[] = [ { name: 'English', lang: 'en', iconSrc: '../../assets/flags/en_flag.png'},
                                  { name: 'Español', lang: 'es', iconSrc: '../../assets/flags/es_flag.png'},
                                  { name: 'Català', lang: 'ca', iconSrc: '../../assets/flags/ca_flag.png'} ]  

  constructor(public dialogRef: MatDialogRef<DialogLangselComponent>) { 
  }

  ngOnInit() {
  }

  public onSelected(lang: string) {
    this.dialogRef.close(lang);
  }

}
