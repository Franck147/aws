# EcoMarket HT-01

Frontend Angular 21 y backend Node.js 24 en EC2 separadas. El catálogo muestra seis productos de demostración. La selección calcula un total local en soles.

En AWS, el backend lee el esquema ecomarket desde la RDS privada de EduCode con su usuario de solo lectura. Configura AWS_REGION, CATALOG_BUCKET, DB_HOST, DB_SECRET_ARN y DB_READ_ONLY=1. Descarga la cadena de confianza de RDS en rds-ca.pem. El rol del backend requiere acceso a su secreto y al prefijo de imágenes del catálogo.

Para reconstruir Angular, ejecuta npm ci y npm run build dentro de frontend. El resultado queda en frontend/dist/ecomarket/browser. Para el backend, ejecuta npm ci, npm run check y npm start dentro de backend. Los archivos de bloqueo fijan las dependencias de la compilación.

La plantilla activa está en ../infra/ecomarket-rds-educode.json. Las rutas de prueba públicas son /api/health y /api/products.
