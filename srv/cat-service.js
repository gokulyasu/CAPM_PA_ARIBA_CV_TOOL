const cds = require('@sap/cds');
const { INSERT, UPSERT } = require('@sap/cds/lib/ql/cds-ql');
const axios = require('axios');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

const { getDestination } = require('@sap-cloud-sdk/connectivity');
const qs = require('qs')

module.exports = cds.service.impl(
    async function (srv) {
        this.on('GET', 'AuditLogss', async (req, res) => {

            const hasStart = req.query.SELECT.where?.some(e => e.ref?.[0] === 'startDate');
            const hasEnd = req.query.SELECT.where?.some(e => e.ref?.[0] === 'endDate');

            if (!hasStart || !hasEnd) {
                req.reject(400, 'Start Date and End Date are mandatory');
            } else {
                try {
                    const destination = await getDestination({ destinationName: 'ARIBA_AUDIT_API' })

                    const apiKey = destination.originalProperties.destinationConfiguration.APIKey
                    const startDate = getDateFilter(req, 'startDate');
                    const endDate = getDateFilter(req, 'endDate');
                    const refresh = getDateFilter(req, 'refreshButton');
                    var tempurl = '/api/audit-search/v2/prod/audits?tenantId=InfosysDSAPP-T&auditType=ConfigurationModification&documentType=ariba.collaborate.contracts.contractworkspace&searchStartTime=2025-11-01T02:00:00%2B0530&searchEndTime=2025-11-26T02:00:00%2B0530';
                    var url = '/api/audit-search/v2/prod/audits?tenantId=InfosysDSAPP-T&auditType=ConfigurationModification&documentType=ariba.collaborate.contracts.contractworkspace&searchStartTime=' + startDate + '&searchEndTime=' + endDate;
                    const { AuditLogs } = cds.entities('my.cvtool');
                    const tx = cds.transaction(req);
                    var logs = [];
                    if (!refresh) {
                        logs = await cds.run(
                            SELECT.from(AuditLogs)
                                .where({
                                    createdTime: {
                                        between: startDate,
                                        and: endDate
                                    }
                                }));
                    }
                    if (logs.length == 0) {
                        var logs = (await callAribaAuditAPI()).map(toAuditLogsEntity);
                        await tx.run(
                            UPSERT.into(AuditLogs).entries(logs)
                        );
                      
                    }
                    return logs;



                } catch (error) {
                    console.error(error);
                    req.error(500, error);
                }
            }

        });

        this.on('syncAuditLogs', async (req, res) => {
            try {
                const { startDate, endDate } = req.data;

                console.log('Start:', startDate);
                console.log('End  :', endDate)
                const destination = await getDestination({ destinationName: 'ARIBA_AUDIT_API' })

                const apiKey = destination.originalProperties.destinationConfiguration.APIKey

                var url = '/api/audit-search/v2/prod/audits?tenantId=InfosysDSAPP-T&auditType=ConfigurationModification&documentType=ariba.collaborate.contracts.contractworkspace&searchStartTime=2025-11-01T02:00:00%2B0530&searchEndTime=2025-11-26T02:00:00%2B0530';

                // const token = ;
                req.info('Data refreshed');
                return (await callAribaAuditAPI()).map(toAuditLogsEntity);


            } catch (error) {
                console.error(error);
                req.error(500, 'failed to fetch the employees');
            }
        });

        function getDateFilter(req, field) {
            const where = req.query?.SELECT?.where;
            if (!where) return null;

            for (let i = 0; i < where.length; i++) {
                if (where[i].ref?.[0] === field) {

                    // startDate = '2024-01-01'
                    if (where[i + 1] === '=') {
                        return where[i + 2].val;
                    }

                    // startDate >= '2024-01-01'
                    if (where[i + 1] === '>=') {
                        return where[i + 2].val;
                    }

                    // startDate BETWEEN x AND y
                    if (where[i + 1] === 'between') {
                        return where[i + 2].val; // lower bound
                    }
                }
            }
            return null;
        }

        async function getOAuthToken() {
            try {
                const destination = await getDestination({ destinationName: 'ARIBA_AUDIT_API' });
                const TOKEN_URL = destination.originalProperties.destinationConfiguration.tokenServiceURL;
                const API_KEY = destination.originalProperties.destinationConfiguration.APIKey;
                const CLIENT_ID = destination.originalProperties.destinationConfiguration.clientId;
                const CLIENT_SECRET = destination.originalProperties.destinationConfiguration.clientSecret;
                const response = await axios.post(
                    TOKEN_URL,
                    new URLSearchParams({
                        grant_type: "client_credentials"
                    }),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        auth: {
                            username: CLIENT_ID,
                            password: CLIENT_SECRET
                        }
                    }
                );
                return response.data.access_token

            } catch (error) {
                console.error(
                    'OAuth token error:',
                    error.response?.data || error.message
                )
                throw error
            }
        }

        async function callAribaAuditAPI() {
            const destination = await getDestination({ destinationName: 'ARIBA_AUDIT_API' })
            const API_KEY = destination.originalProperties.destinationConfiguration.APIKey;
            const token = await getOAuthToken()
            const base_url = destination.originalProperties.destinationConfiguration.URL;
            const search_url = '/api/audit-search/v2/prod/audits?tenantId=InfosysDSAPP-T&auditType=ConfigurationModification&documentType=ariba.collaborate.contracts.contractworkspace&searchStartTime=2025-11-01T02:00:00%2B0530&searchEndTime=2025-11-26T02:00:00%2B0530';
            const API_URL =
                base_url + search_url;
            try {
                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'APIKey': API_KEY,
                        Accept: 'application/json'
                    }
                })
                return response.data.contents;
            } catch (err) {
                console.error('API call error:', err.response?.data || err.message)
                throw err
            }
        }



        function toAuditLogsEntity(item) {
            // Ensure param maps are stored as strings (JSONText in CDS)
            const pm1 = item.paramMap1 && typeof item.paramMap1 === 'object'
                ? JSON.stringify(item.paramMap1)
                : item.paramMap1 || null;

            const pm2 = item.paramMap2 && typeof item.paramMap2 === 'object'
                ? JSON.stringify(item.paramMap2)
                : item.paramMap2 || null;

            const pm3 = item.paramMap3 && typeof item.paramMap3 === 'object'
                ? JSON.stringify(item.paramMap3)
                : item.paramMap3 || null;

            // Convenience fields (if present in paramMap1)
            let resourceName = item.resourceName;
            let resourceId = item.resourceId;
            if (!resourceName || !resourceId) {
                try {
                    const obj = typeof item.paramMap1 === 'string'
                        ? JSON.parse(item.paramMap1)
                        : item.paramMap1;
                    resourceName = resourceName || obj?.resourceName || null;
                    resourceId = resourceId || obj?.resourceId || null;
                } catch (e) { /* ignore parse errors */ }
            }

            // Convert createdTime; if it's not ISO, you can pre-fix timezone (e.g., 2025-10-31T16:11:50-07:00)
            let createdDate = null;
            if (item.createdTime) {
                const iso = String(item.createdTime)
                    .replace(/(\+\d{4})$/, (m) => m.slice(0, 3) + ':' + m.slice(3)); // convert +0700 -> +07:00
                const dt = new Date(iso);
                createdDate = isNaN(dt.getTime()) ? null : dt;
            }

            return {
                uniqueId: item.uniqueId,

                nodeName: item.nodeName,
                purgeScope: item.purgeScope,
                auditType: item.auditType,
                action: item.action,
                serviceName: item.serviceName,
                sourceServiceName: item.sourceServiceName,
                clientId: item.clientId,
                tenantId: item.tenantId,
                documentId: item.documentId,
                traceId: item.traceId,
                ip: item.ip,
                realUser: item.realUser,
                effectiveUser: item.effectiveUser,
                notes: item.notes,
                status: item.status,
                createdTime: createdDate,
                purposeOfAudit: item.purposeOfAudit,
                paramMap1: pm1,
                paramMap2: pm2,
                paramMap3: pm3,

                resourceName,
                resourceId,


            };
        }

    })


