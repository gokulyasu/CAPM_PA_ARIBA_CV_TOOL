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
        }
    ],
    UI.SelectionFields: [startDate,endDate]
);
