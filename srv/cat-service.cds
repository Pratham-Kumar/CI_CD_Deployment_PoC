using {com.sap.GitDeployment as my} from '../db/schema';

service CatalogService @(path: '/GitDeployment') {

  entity Projects  as projection on my.Project;

  entity Pipelines as
    projection on my.Pipeline {
      *,
      project.name       as projectName,
      project.subaccount as orgName,
      project.cfSpace    as cfSpace,
      project.repo       as repo,
      project.branch     as branch,

    };

  action deployApplication(repoUrl: String,
                           branch: String,
                           cfApi: String,
                           cfUser: String,
                           cfPassword: String,
                           cfOrg: String,
                           cfSpace: String) returns String;
}
