const baseUrl=(process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000').replace(/\/$/,'');
const expectProductionReady=(process.env.EXPECT_PRODUCTION_READY||'false').toLowerCase()==='true';
const failures=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForServer(){for(let attempt=1;attempt<=40;attempt++){try{const response=await fetch(`${baseUrl}/api/health`,{redirect:'manual'});if(response.status<500)return;}catch{}await sleep(500);}throw new Error(`Server did not become reachable at ${baseUrl}.`);}
async function check(name,path,options={},validate=()=>true){try{const response=await fetch(`${baseUrl}${path}`,{redirect:'manual',...options});const contentType=response.headers.get('content-type')||'';const body=contentType.includes('application/json')?await response.json():await response.text();const valid=await validate(response,body);if(!valid)failures.push(`${name}: status=${response.status}; body=${JSON.stringify(body).slice(0,700)}`);else console.log(`PASS ${name} (${response.status})`);}catch(error){failures.push(`${name}: ${error instanceof Error?error.message:String(error)}`);}}
await waitForServer();
await check('homepage','/',{},(response,body)=>response.status===200&&typeof body==='string'&&/Ross Tax|RTPSC Operations Fabric/i.test(body));
await check('services route','/services',{},response=>response.status===200);
await check('operations route','/operations-fabric',{},response=>response.status===200);
await check('IRS forms catalog page','/irs-form-catalog',{},(response,body)=>response.status===200&&typeof body==='string'&&/IRS forms, schedules and filing-product catalog/i.test(body));
await check('official IRS lookup contract','/api/v1/irs-forms/search?q=1040&page=0&pageSize=25',{},(response,body)=>response.status===200?(body?.ok===true&&body?.source?.official===true&&Array.isArray(body?.items)):(response.status===503&&body?.ok===false&&body?.error?.code==='IRS_CATALOG_UNAVAILABLE'));
await check('refund case schema','/api/v1/refund-cases/schema',{},(response,body)=>response.status===200&&body?.ok===true&&body?.aggregate==='RefundCase'&&Array.isArray(body?.stations)&&body.stations.length===7);
await check('health contract','/api/health',{},(response,body)=>response.status===200&&body?.status==='ok'&&body?.routeCount>=20);
await check('platform status','/api/platform/status',{},(response,body)=>response.status===200&&body?.routeSummary?.total>=20&&body?.workflowRegistry?.controlGates===15);
await check('route registry','/api/routes',{},(response,body)=>response.status===200&&body?.summary?.total>=20&&Array.isArray(body?.routes));
await check('integration registry','/api/v1/integrations',{},(response,body)=>response.status===200&&Array.isArray(body?.integrations)&&body.integrations.length>=10);
await check('readiness gate','/api/ready',{},(response,body)=>expectProductionReady?(response.status===200&&body?.productionReady===true):(response.status===503&&body?.productionReady===false&&Array.isArray(body?.blockers)&&body.blockers.length>0));
const jsonHeaders={'Content-Type':'application/json','X-Correlation-ID':crypto.randomUUID()};
await check('anonymous workflow denied','/api/v1/workflows/transition',{method:'POST',headers:jsonHeaders,body:JSON.stringify({tenantId:'demo-tenant',from:'REQUESTED',to:'AUTHENTICATED',taskId:'demo-task'})},response=>[401,403,423].includes(response.status));
await check('anonymous e-file denied','/api/v1/efile/submissions',{method:'POST',headers:{...jsonHeaders,'X-Idempotency-Key':'demo-idempotency','X-Schema-Version':'demo-schema','X-Approval-Token':'demo-approval'},body:JSON.stringify({tenantId:'demo-tenant',officeId:'demo-office',returnId:'demo-return',environment:'ats'})},response=>[401,403,423].includes(response.status));
await check('anonymous refund case denied','/api/v1/refund-cases/process',{method:'POST',headers:jsonHeaders,body:JSON.stringify({tenantId:'demo-tenant',refundCase:{tenantId:'demo-tenant',caseId:'demo-case',taxpayerId:'demo-taxpayer',taxYear:2025}})},response=>[401,403,423].includes(response.status));
if(failures.length){console.error('\nSmoke test failures:');for(const failure of failures)console.error(`- ${failure}`);process.exit(1);}console.log(`\nAll smoke tests passed against ${baseUrl}. Production readiness expected: ${expectProductionReady}.`);
