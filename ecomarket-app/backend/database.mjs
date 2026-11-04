import mysql from 'mysql2/promise';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {readFileSync} from 'node:fs';
const client=new SecretsManagerClient({region:process.env.AWS_REGION||'us-east-1'});
let pool;
export async function initialize(){
 const socketPath=process.env.DB_SOCKET;
 const options=socketPath
  ? {socketPath,user:process.env.DB_USER,password:process.env.DB_PASSWORD}
  : await (async()=>{
   const secret=JSON.parse((await client.send(new GetSecretValueCommand({SecretId:process.env.DB_SECRET_ARN}))).SecretString);
   return {host:process.env.DB_HOST,user:secret.username,password:secret.password,ssl:{ca:readFileSync(new URL('./rds-ca.pem',import.meta.url)),minVersion:'TLSv1.2',rejectUnauthorized:true}};
  })();
 pool=mysql.createPool({...options,database:'ecomarket',connectionLimit:4,connectTimeout:10000});
 if ((socketPath || process.env.DB_READ_ONLY === '1') && process.env.DB_MIGRATE !== '1') {
  await ping();
  return;
 }
 await pool.execute(`CREATE TABLE IF NOT EXISTS products (
 id INT PRIMARY KEY,name VARCHAR(120) NOT NULL,category VARCHAR(80) NOT NULL,
 description VARCHAR(500) NOT NULL,price DECIMAL(10,2) NOT NULL,unit VARCHAR(60) NOT NULL,
 stock INT NOT NULL,badge VARCHAR(80) NOT NULL,tone VARCHAR(20) NOT NULL,image_key VARCHAR(180) NOT NULL)`);
 const seed=JSON.parse(readFileSync(new URL('./products.json',import.meta.url),'utf8'));
 for(const p of seed)await pool.execute('INSERT IGNORE INTO products(id,name,category,description,price,unit,stock,badge,tone,image_key) VALUES (?,?,?,?,?,?,?,?,?,?)',[p.id,p.name,p.category,p.description,p.price,p.unit,p.stock,p.badge,p.tone,p.image_key]);
}
function product(row){return {...row,price:Number(row.price),image_url:'/api/products/'+row.id+'/image'};}
export async function products(){const [rows]=await pool.execute('SELECT id,name,category,description,price,unit,stock,badge,tone FROM products ORDER BY id LIMIT 100');return rows.map(product);}
export async function findProduct(id){const [rows]=await pool.execute('SELECT id,name,category,description,price,unit,stock,badge,tone,image_key FROM products WHERE id=?',[id]);return rows[0]?product(rows[0]):null;}
export async function ping(){await pool.execute('SELECT 1');}
export async function close(){if(pool)await pool.end();}
