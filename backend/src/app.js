import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import bcrypt from 'fastify-bcrypt';

import db from './plugins/db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';

export default async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  // Plugins
  await fastify.register(cors);
  await fastify.register(helmet);
  await fastify.register(jwt, { secret: process.env.JWT_SECRET });
  await fastify.register(db);

  // Decorator to verify JWT
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.register(bcrypt);
  // Routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(productRoutes, { prefix: '/api/products' });

  return fastify;
}
