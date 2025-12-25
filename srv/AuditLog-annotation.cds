using CatalogService as my from './cat-service';

annotate my.AuditLogs with @(

  
    UI.LineItem       : [
        {
            Value: createdTime,
            Label: 'Created At'
        },
        {
            Value: realUser,
            Label: 'User'
        },
        {
            Value: action,
            Label: 'Action'
        },
        {
            Value: auditType,
            Label: 'Action Type'
        },
        {
            Value: purposeOfAudit,
            Label: 'Description'
        },
        {
      $Type           : 'UI.DataFieldForAction',
      Action          : 'CatalogService.EntityContainer/syncAuditLogs',
      Label           : 'Purge Audits',
      RequiresContext : false          ,
      Parameters: [
        {
          $Type: 'UI.Parameter',
          Name: 'startDate',
          Value: startDate
        },
        {
          $Type: 'UI.Parameter',
          Name: 'endDate',
          Value: endDate
        }
      ]      
    }
    ],
    
    UI.SelectionFields: [
      
       startDate,endDate,refreshButton],
    Common.FieldControl : #Mandatory
);


annotate my.AuditLogs.refreshButton with @(
  UI.Hidden : false,

  Common.ValueListWithFixedValues : false,

  Capabilities.FilterRestrictions : {
    FilterExpressionRestrictions : [
      {
        Property : refreshButton,
        AllowedExpressions : 'SingleValue'
      }
    ]
  }
);
