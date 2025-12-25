namespace my.bookshop;

// entity Books {
//   key ID    : Integer;
//       title : String;
//       stock : Integer;
// }

// entity logs{
//   key effectiveUser: String;
//   realuser:String;
//   craeted: Timestamp; 
//   Action: String;
// }



type JSONText : LargeString;
type XMLText  : LargeString;


entity AuditLogs {
  key uniqueId            : String(50);        
  nodeName                : String(200);
  purgeScope              : String(30);
  auditType               : String(60);
  action                  : String(30);
  serviceName             : String(60);
  sourceServiceName       : String(100);
  clientId                : String(40);
  tenantId                : String(100);
  documentId              : String(200);
  traceId                 : String(80);
  ip                      : String(60);
  realUser                : String(100);
  effectiveUser           : String(100);
  notes                   : String(500);
  purposeOfAudit: String(100);
  status                  : String(40);
  createdTime             : Timestamp;

  paramMap1               : JSONText;
  paramMap2               : JSONText;
  paramMap3               : JSONText;

  resourceName            : String(200);
  resourceId              : String(40);

  // attributes              : Composition of many AttributeChange
                              // on attributes.parent = $self;

  virtual startDate : Timestamp @cds.persistence.skip;
  
  virtual endDate: Timestamp @cds.persistence.skip;
  virtual refreshButton: Boolean @cds.persistence.skip;
}


entity AttributeChange {
  // key parent              : Association to AuditLogs;
  key seq                 : Integer;
  key changeKey           : String(100);

  oldVal                  : XMLText;
  newVal                  : XMLText;
}
