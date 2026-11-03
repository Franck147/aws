FROM public.ecr.aws/docker/library/node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/* && npm install --omit=dev && npm cache clean --force
RUN curl -fsS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o rds-ca.pem
COPY server.mjs ./
USER node
EXPOSE 3000
CMD ["node","server.mjs"]
