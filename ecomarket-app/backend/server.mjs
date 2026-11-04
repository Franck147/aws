import http from 'node:http';
import {S3Client,GetObjectCommand} from '@aws-sdk/client-s3';
import {initialize,products,findProduct,ping,close} from './database.mjs';
const s3=new S3Client({region:process.env.AWS_REGION||'us-east-1'});
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));}
await initialize();
const server=http.createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');json(res,405,{error:'Método no permitido'});return;}
  if(path==='/health'||path==='/api/health'){await ping();json(res,200,{status:'ok',database:'ready'});return;}
  if(path==='/api/products'){json(res,200,{products:await products(),currency:'PEN'});return;}
  const match=path.match(/^\/api\/products\/(\d+)(\/image)?$/);
  if(match){
   const id=Number(match[1]);if(!Number.isSafeInteger(id)||id<1){json(res,400,{error:'Producto no válido'});return;}
   const p=await findProduct(id);if(!p){json(res,404,{error:'Producto no encontrado'});return;}
   if(match[2]){
    if(!/^catalog\/products\/\d+\.svg$/.test(p.image_key))throw new Error('UnexpectedImageKey');
    const object=await s3.send(new GetObjectCommand({Bucket:process.env.CATALOG_BUCKET,Key:p.image_key}));
    const image=await object.Body.transformToByteArray();
    res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"});res.end(image);return;
   }
   delete p.image_key;json(res,200,p);return;
  }
  json(res,404,{error:'Ruta no encontrada'});
 }catch(error){console.error('request_failed',error.name);json(res,503,{error:'No pudimos consultar el catálogo. Inténtalo de nuevo.'});}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('ecomarket_backend_ready'));
async function shutdown(){server.close();await close();process.exit(0);}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
