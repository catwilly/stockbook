import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlphavanService } from '../services/AlphavanService';

@Component({
    selector: 'app-dialog-add-apikey',
    templateUrl: './dialog-add-apikey.component.html'
})
export class DialogAddApiKeyComponent implements OnInit {
    
    public apiKey: string = null;
    
    constructor(public dialogRef: MatDialogRef<DialogAddApiKeyComponent>, private alphaService: AlphavanService) {
        
    }
    
    ngOnInit() { 
    }
    
    public cantEnter(): boolean {
        let canEnter;
        if(this.apiKey !== null && this.apiKey.length > 0) {
            canEnter = true;
        }
        else {
            canEnter = false;
        }
        return !canEnter;
    }
    
    public onNoClick() {
        this.dialogRef.close(null);
    }
    
    public onEnter() {
        this.dialogRef.close(this.apiKey);
    }
    
}