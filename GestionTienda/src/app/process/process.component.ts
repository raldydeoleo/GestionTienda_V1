import { Component, OnInit } from '@angular/core';
import { IProcess } from './process';
import { ProcessService } from './process.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ModalService } from '../modals/modal/modal.service';

@UntilDestroy()
@Component({
      selector: 'app-process',
      templateUrl: './process.component.html',
      styleUrls: ['./process.component.css']
    })
export class ProcessComponent implements OnInit {
  public processes: IProcess[];
  constructor(private processService: ProcessService, private accountService: AccountService, private toast: ToastrService, private modalService: ModalService) { }

  ngOnInit() {
    this.loadData();
    this.accountService.showSubMenu("configuracionMenu");
  }
  delete(process: IProcess) {
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el proceso ${process.descripcion.toLowerCase()}?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
        process.usuarioEliminacion = this.accountService.getLoggedInUser();
        this.processService.deleteProcess(process).pipe(untilDestroyed(this)).subscribe(process => this.loadData(), error => console.error(error), () => this.toast.success("Proceso Eliminado!"));
      }
    });
  }
  loadData(): void {
    this.processService.getProcesses()
      .toPromise().then(processes => this.processes = processes);
  }
}
