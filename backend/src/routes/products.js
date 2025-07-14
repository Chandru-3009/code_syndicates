export default async function (fastify) {
  fastify.get('/', async (request, reply) => {
    const products = await fastify.prisma.product.findMany();
    return products;
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const product = await fastify.prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    return product;
  });
}
