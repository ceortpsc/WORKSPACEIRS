import {apiError,apiResponse,authorizeOperationalRequest,readJson,requestContext,validateTenantScope} from '../../../../../../lib/api';
import {buildDocumentNarrative,classifyDocument,mapExtractedFields,validateUpload,type ExtractedField,type UploadedDocument,type SupportedDocumentType} from '../../../../../../lib/document-intake';

const roles=['OWNER_SUPER_ADMIN','PLATFORM_ADMIN','FIRM_ADMIN','ERO_ADMIN','PREPARER','REVIEWER','COMPLIANCE','CLIENT_SERVICE'];

export async function POST(request:Request){
 const context=requestContext(request);const auth=authorizeOperationalRequest(request,{allowSynthetic:true,roles});
 if(!auth.allowed)return apiError(auth.code??'ACCESS_DENIED',auth.message??'Access denied.',auth.httpStatus??403,context.correlationId);
 try{
  const body=await readJson(request);const scopeError=validateTenantScope(auth,body);
  if(scopeError)return apiError('TENANT_OR_SYNTHETIC_SCOPE_DENIED',scopeError,403,context.correlationId);
  const document=body.document as UploadedDocument;
  if(!document||typeof document!=='object')return apiError('DOCUMENT_REQUIRED','document metadata is required.',400,context.correlationId);
  if(document.tenantId!==auth.tenantId)return apiError('TENANT_SCOPE_DENIED','Document tenant does not match authenticated tenant.',403,context.correlationId);
  const uploadValidation=validateUpload(document);
  if(uploadValidation.status==='HOLD')return apiResponse({ok:false,uploadValidation},409,context.correlationId);
  const classification=classifyDocument({fileName:document.fileName,textSample:String(body.textSample??''),declaredType:typeof body.declaredType==='string'?body.declaredType as SupportedDocumentType:undefined});
  const fields=Array.isArray(body.fields)?body.fields as ExtractedField[]:[];
  const mapping=mapExtractedFields({classification,fields});
  const narratives={client:buildDocumentNarrative({classification,mapping,purpose:'client_note'}),workpaper:buildDocumentNarrative({classification,mapping,purpose:'workpaper_note'}),missingItem:buildDocumentNarrative({classification,mapping,purpose:'missing_item_request'})};
  return apiResponse({ok:true,document:{documentId:document.documentId,fileName:document.fileName,sourceHash:document.sourceHash},uploadValidation,classification,mapping,narratives,approval:{required:true,reason:'Extracted values and generated language remain draft until an authorized human accepts them.'},auth:{tenantId:auth.tenantId,role:auth.role}},mapping.status==='PASS'?200:409,context.correlationId);
 }catch(error){return apiError('INVALID_REQUEST',error instanceof Error?error.message:'Invalid request.',400,context.correlationId);}
}
