namespace com.sap.GitDeployment;

using {
    cuid,
    managed,
} from '@sap/cds/common';

entity Project : managed, cuid {
    name         : String;
    description  : String;
    repo         : String;
    branch       : String;
    type         : String;
    env          : String;
    deployTarget : String;
    subaccount   : String;
    cfSpace      : String;
    status       : String;
}

entity Pipeline : managed, cuid {
    name        : String;
    description : String;
    project     : Association to Project;
    trigger     : String;
    status      : String;
}
