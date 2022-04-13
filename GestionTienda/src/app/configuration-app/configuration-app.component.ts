import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IConfiguration } from './configuration';
import { ConfigurationService } from './configuration.service';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-configuration-app',
  templateUrl: './configuration-app.component.html',
  styleUrls: ['./configuration-app.component.css']
})
export class ConfigurationAppComponent implements OnInit {
  formGroup: FormGroup;
  confirmacionModuloConfig: IConfiguration;
  confirmacionModuloText: string;
  constructor(private fb: FormBuilder, private toast: ToastrService, private configurationService: ConfigurationService, private accountService: AccountService) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      confirmacionModuloConfig: ''
    });
    this.configurationService.getConfigurationByCode("confirmacionModulo").toPromise().then(configuration => {
      this.confirmacionModuloConfig = configuration;
      this.confirmacionModuloText = configuration.textoConfiguracion;
    });
    this.accountService.showSubMenu("configuracionMenu");
  }

  save() {
    let confirmacionModuloValue = this.formGroup.controls['confirmacionModuloConfig'].value;
    let valueText: string = "False";
    if (confirmacionModuloValue == true) {
      valueText = "True";
    }
    this.confirmacionModuloConfig.valorConfiguracion = valueText;
    this.confirmacionModuloConfig.usuarioModificacion = this.accountService.getLoggedInUser();
    this.configurationService.updateConfiguration(this.confirmacionModuloConfig).toPromise().then(result => {
      this.toast.success("Las configuraciones fueron guardadas");
    });
  }

  getConfirmacionModuloConfigValue(): boolean {
    let result = false;
    if (this.confirmacionModuloConfig) {
      if (this.confirmacionModuloConfig.valorConfiguracion == 'True') {
        result = true;
      }
    }
    return result;
  }

}
