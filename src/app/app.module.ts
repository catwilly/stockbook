import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { StorageModule } from '@ngx-pwa/local-storage';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { HomeComponent } from './home/home.component';
import { StockComponent } from './stock/stock.component';
import { EffectsModule } from '@ngrx/effects';
import { StockBookEffects } from './store/effects';
import { StorageService } from './services/StorageService';
import { stockbookReducer } from './store/reducer';
import { LangService } from './services/LangService';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DialogAddStockComponent } from './dialog-add-stock/dialog-add-stock.component';

import { ChartsModule, ThemeService } from 'ng2-charts';
import { AppState } from './model/stock';
import * as StockBookActions from './store/actions';
import { DialogAddEntryComponent } from './dialog-add-entry/dialog-add-entry.component';
import { GapiSession } from './services/gapi.session';
import { DialogAddApiKeyComponent } from './dialog-add-apikey/dialog-add-apikey.component';
import { DialogLangselComponent } from './dialog-langsel/dialog-langsel-component';
import { Momey2dPipe, Momey3dPipe } from './pipes/money.pipe';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    StockComponent,
    DialogAddStockComponent,
    DialogAddEntryComponent,
    DialogAddApiKeyComponent,
    DialogLangselComponent,
    Momey2dPipe,
    Momey3dPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatListModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatAutocompleteModule,    
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ChartsModule,
    StoreModule.forRoot({ app: stockbookReducer }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    EffectsModule.forRoot([StockBookEffects]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StorageModule.forRoot({ IDBNoWrap: true }),
  ],
  entryComponents: [ DialogAddStockComponent, DialogAddEntryComponent, DialogAddApiKeyComponent, DialogLangselComponent ],
  providers: [ 
    HttpClient, StorageService, LangService, GapiSession,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer, private themeService: ThemeService, private store: Store<{app: AppState}>) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
    themeService.setColorschemesOptions({
      legend: {
        labels: { fontColor: 'white' }
      },
      scales: {
        xAxes: [{
          ticks: { fontColor: 'white' },
          gridLines: { color: 'rgba(255,255,255,0.1)' }
        }],
        yAxes: [{
          ticks: { fontColor: 'white' },
          gridLines: { color: 'rgba(255,255,255,0.1)' }
        }]
      }
    });

    // dispatch action to load from storage
    this.store.dispatch(StockBookActions.loadLangFromStorage());
    this.store.dispatch(StockBookActions.loadAlphaApiKeyFromStorage());
    this.store.dispatch(StockBookActions.gapiInitialize());
  }
}
