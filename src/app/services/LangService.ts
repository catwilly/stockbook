import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
    providedIn: 'root'
  })
export class LangService {

    private readonly key: string = "stockbook-lang-key";

    constructor(private storage: StorageMap) {
    }

    public getLang (): Observable<string> {
        let x = this.storage.get<string>(this.key, {type: 'string'});
        
        return x;
    }

    public saveLang (lang: string): Observable<void> {
        let x = this.storage.set(this.key, lang, {type: 'string'});

        return x;
    }

}