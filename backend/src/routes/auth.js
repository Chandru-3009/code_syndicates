import { Worker } from 'worker_threads';
import path from 'path';
import { signupSchema, loginSchema } from '../validators/validator.js';

function hashPasswordInWorker(password, saltRounds) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve('/home/remote-user/Code-Syndicate/backend/src/plugins/bcryptWorker.js'), {
      workerData: { password, saltRounds }
    });

    worker.on('message', (data) => {
      if (data.success) {
        resolve(data.hash);
      } else {
        reject(new Error(data.error));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

export default async function (fastify) {

  fastify.post('/signup', async (request, reply) => {
    try {
      const { error, value } = signupSchema.validate(request.body, { abortEarly: false });
  
      if (error) {
        const errorMessages = error.details.map(err => err.message);
        return reply.code(400).send({ 
          success: false,
          message: 'Validation failed',
          errors: errorMessages 
        });
      }
  
      const { email, password, name } = value;
  
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });
  
      if (existingUser) {
        return reply.code(409).send({ 
          success: false,
          message: "Email already registered" 
        });
      }
  
      // const hashedPassword = await fastify.bcrypt.hash(password, process.env.SALT_ROUNDS);
      const hashedPassword = await hashPasswordInWorker(password, Number(process.env.SALT_ROUNDS));
  
      await fastify.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });
  
      reply.code(201).send({
        success: true,
        message: 'User created successfully',
      });
    } catch (err) {
      console.error("Signup error:", err);
      reply.code(500).send({ success: false,
        message: "Internal server error" });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Quick validation
      if (!email || !password) {
        return reply.code(400).send({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Sanitize email input
      const sanitizedEmail = email.toLowerCase().trim();

      // Run validation and database query concurrently
      const [validationResult, user] = await Promise.all([
        loginSchema.validate({ email: sanitizedEmail, password }, { abortEarly: false }),
        fastify.prisma.user.findUnique({ 
          where: { email: sanitizedEmail },
          select: {
            id: true,
            email: true,
            password: true
          }
        })
      ]);

      // Handle validation errors
      if (validationResult.error) {
        return reply.code(400).send({ 
          success: false,
          message: 'Invalid input data'
        });
      }

      if (!user) {
        return reply.code(401).send({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const isValid = await fastify.bcrypt.compare(password, user.password);
      if (!isValid) {
        return reply.code(401).send({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const token = fastify.jwt.sign({ 
        id: user.id, 
        email: user.email 
      }, { expiresIn: '24h' });

      reply.send({ 
        success: true,
        message: 'Login successful',
        token 
      });
    } catch (err) {
      console.error("Login error:", err);
      reply.code(500).send({ 
        success: false,
        message: "Internal server error" 
      });
    }
  });
}
