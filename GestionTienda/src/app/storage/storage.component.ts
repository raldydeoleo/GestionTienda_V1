import { Component, OnInit } from '@angular/core';
import { StorageService } from './storage.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { IStorage } from './storage';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ModalService } from '../modals/modal/modal.service';

@UntilDestroy()
@Component({
      selector: 'app-storage',
      templateUrl: './storage.component.html',
      styleUrls: ['./storage.component.css']
    })
export class StorageComponent implements OnInit {
  public storages: IStorage[];
  constructor(private storageService: StorageService, private accountService: AccountService, private toast: ToastrService, private modalService: ModalService) { }

  ngOnInit() {
    this.loadData();
    this.accountService.showSubMenu("configuracionMenu");
  }
  delete(storage: IStorage) {
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el almacenamiento ${storage.descripcion.toLowerCase()}?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
        storage.usuarioBorrado = this.accountService.getLoggedInUser();
        this.storageService.deleteStorage(storage).pipe(untilDestroyed(this)).subscribe(storage => this.loadData(), error => console.error(error), () => this.toast.success("Almacenamiento Eliminado!"));
      }
    });
  }
  loadData(): void {
    this.storageService.getStorages()
      .toPromise().then(storages => this.storages = storages);
  }
}
