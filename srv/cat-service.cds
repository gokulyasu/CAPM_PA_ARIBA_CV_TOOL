using my.cvtool as my from '../db/schema';

service CatalogService {
    //  entity  logs as projection on my.logs;
   @readonly entity AuditLogs as projection on my.AuditLogs;
  
   action syncAuditLogs(startDate:Timestamp,endDate:Timestamp) returns many AuditLogs;
//    {
//     createdTime,
//     realUser,
//     action,auditType,purposeOfAudit,startDate,endDate
//    };
//    entity AttributeChange as projection on my.AttributeChange;f
}
