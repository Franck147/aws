import http from 'node:http';
import os from 'node:os';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {S3Client} from '@aws-sdk/client-s3';
import {createPresignedPost} from '@aws-sdk/s3-presigned-post';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import mysql from 'mysql2/promise';
const region=process.env.AWS_REGION||'us-east-1';
const s3=new S3Client({region});
const sm=new SecretsManagerClient({region});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pool;
async function database(){
 if(!pool){
  const secret=JSON.parse((await sm.send(new GetSecretValueCommand({SecretId:process.env.DB_SECRET_ARN}))).SecretString);
  pool=mysql.createPool({host:process.env.DB_HOST,user:secret.username,password:secret.password,database:'educode',connectionLimit:3,ssl:{ca:readFileSync(new URL('./rds-ca.pem',import.meta.url)),minVersion:'TLSv1.2',rejectUnauthorized:true}});
  await pool.execute('CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100),email VARCHAR(100) UNIQUE)');
  await pool.execute('INSERT IGNORE INTO students(name,email) VALUES (?,?)',['Estudiante de prueba','estudiante@example.com']);
 }
 return pool;
}
const page=(title,body)=>`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font:18px system-ui;max-width:850px;margin:50px auto;padding:20px;background:#f5f7fb;color:#14263d}a{color:#1462bd}section{background:white;padding:24px;border-radius:12px}input,button{padding:12px;margin:8px 0}</style><h1>${title}</h1><section>${body}</section></html>`;
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 url.pathname=url.pathname.replace(/^\/containers(?=\/)/,'');
 try{
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',host:os.hostname()}));return;}
  if(url.pathname==='/students'){
   const db=await database();const [rows]=await db.execute('SELECT id,name,email FROM students ORDER BY id LIMIT 20');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(page('EduCode · estudiantes',`<pre>${escape(JSON.stringify(rows,null,2))}</pre><a href="/">Inicio</a>`));return;
  }
  if(url.pathname==='/upload'){
   if(!process.env.UPLOAD_BUCKET)throw new Error('Carga no configurada en este servicio');
   const key='practicas/'+randomUUID()+'.txt';
   const post=await createPresignedPost(s3,{Bucket:process.env.UPLOAD_BUCKET,Key:key,Expires:120,Fields:{success_action_status:'201'},Conditions:[['content-length-range',1,1048576],['eq','$success_action_status','201']]});
   const fields=Object.entries(post.fields).map(([k,v])=>`<input type="hidden" name="${escape(k)}" value="${escape(v)}">`).join('');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(page('DataVision · cargar archivo',`<p>Archivo de prueba de hasta 1 MiB. La autorización de carga vence en dos minutos.</p><form method="post" action="${escape(post.url)}" enctype="multipart/form-data">${fields}<input type="file" name="file" required><button>Cargar en S3</button></form><a href="/">Inicio</a>`));return;
  }
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(page('Laboratorio AWS',`<p>Servicio: ${escape(process.env.PROJECT||'EduCode / DataVision')}</p><p>Servidor: ${escape(os.hostname())}</p><ul><li><a href="/students">Consultar estudiantes en MySQL</a></li><li><a href="/upload">Cargar un archivo en DataVision</a></li><li><a href="/containers/">Aplicación en contenedor</a></li><li><a href="/health">Estado</a></li></ul>`));
 }catch(e){console.error(e.name,e.message);res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8'});res.end('Servicio temporalmente no disponible. Revisar logs del laboratorio.');}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
