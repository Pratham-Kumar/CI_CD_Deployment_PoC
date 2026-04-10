using { com.sap.GitDeployment as my } from '../db/schema';

service CatalogService @(path:'/GitDeployment') {

  entity Projects as projection on my.Project;
  }