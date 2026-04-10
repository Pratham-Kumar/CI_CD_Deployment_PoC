namespace com.sap.GitDeployment;

using {
    cuid,
    managed,
} from '@sap/cds/common';

entity Project : managed, cuid {

    projectName   : String;
    description   : String;
    repositoryURL : String;
    branch        : String;
    appType       : String;
}
