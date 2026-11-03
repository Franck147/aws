# Prácticas AWS HT-01 a HT-05

Aplicación Node.js de demostración para EC2 y ECS Fargate, plantillas de infraestructura y esquemas SQL.

- `app/`: servidor HTTP, Dockerfile y hooks para CodeDeploy.
- `infra/laboratorio.json`: CloudFormation para ALB, Auto Scaling, RDS privado opcional, ECS opcional, CloudWatch y WAF opcional.
- `infra/ecomarket.json`: base de red, S3 e IAM para EcoMarket.
- `infra/main.tf`: administración de CloudFormation con Terraform.
- `infra/https.json`: dos distribuciones CloudFront con certificado del dominio predeterminado, redirección a HTTPS y caché deshabilitada.
- `sql/`: tablas y datos ficticios de Books4All y EduCode.

Las rutas `/health`, `/students`, `/upload` y `/containers/*` sirven para las comprobaciones del laboratorio. La carga S3 se limita al prefijo de prácticas, 1 MiB y 120 segundos. Los datos de demostración son ficticios.

## Ejecución local

Requiere Node.js 24. En `app/`, ejecutar `npm install` y `npm start`. La consulta de estudiantes y las cargas requieren configuración AWS mediante roles o la cadena normal de credenciales del SDK. No incluir claves ni contraseñas en el código.

## Infraestructura

Revisar todos los parámetros antes de desplegar. El ejemplo de variables corresponde a una cuenta de laboratorio y debe adaptarse. Si el stack ya existe, importarlo en Terraform antes de aplicar; evitar crear infraestructura duplicada. Ejecutar `terraform init`, `terraform validate` y `terraform plan` antes de cualquier aplicación.

El despliegue base de aplicación usa HTTP. La plantilla adicional `infra/https.json` habilita HTTPS entre el navegador y CloudFront sin dominio propio. El tramo CloudFront-ALB conserva HTTP; esto no equivale a cifrado hasta el origen. Para HTTPS también en el origen se necesita un dominio y un certificado válido en el ALB. MySQL permanece privado y SSH no está abierto; la administración usa Systems Manager.

CloudFront incorpora una función que sobrescribe `x-lab-client-ip` con la IP de la conexión del visitante. La regla adicional de WAF limita esa IP cuando llega el encabezado; se conservan la protección SQLi y el límite por IP de conexión del ALB. Este último también agrega solicitudes por dirección de salida de CloudFront y puede restringir varios visitantes juntos. Esta es una configuración de laboratorio.

La imagen se construye con `docker build -t educode-lab app/`. El contenedor descarga el certificado de RDS durante la construcción y la aplicación valida TLS al conectar a MySQL.

Los archivos de CodeDeploy están preparados para su uso cuando el servicio esté habilitado. Tener `appspec.yml` en el repositorio no acredita por sí mismo un despliegue CodeDeploy exitoso.

Los estados Terraform, archivos de variables locales, credenciales y evidencias privadas deben conservarse fuera del repositorio. Los recursos activos generan costes; revisar el plan y la capacidad antes y después de las pruebas.
