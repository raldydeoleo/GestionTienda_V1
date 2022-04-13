import { NgbDate } from "@ng-bootstrap/ng-bootstrap";


export interface IOrder{
      id:number; 
      orderId:string; 
      contactPerson:string;  
      createMethodType:string;  
      expectedStartDate:Date;
      expectedStartDateForm:NgbDate;
      creationDate: Date;
      factoryAddress:string;  
      factoryCountry:string;  
      factoryId:number;  
      factoryName:string;  
      poNumber:number;  
      productCode:string;  
      productDescription:string;  
      productionLineId:number;  
      productionOrderId:string;  
      releaseMethodType:string;  
      serviceProviderId:string;  
      cisType:string;  
      gtin:string;  
      mrp:string;  
      quantity:number;  
      serialNumberType:string; 
      stickerId:number;  
      templateId:number;  
      omsUrl:string;  
      omsId:string;  
      token:string;  
      status: string;
      expectedCompleteTimestamp: number;
      isPrintAuthorized: boolean;
      sapOrderReference: string;
      codes:any[];
}