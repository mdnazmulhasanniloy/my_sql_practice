import { PrismaClient } from '../../generated/prisma';
import { Prisma } from '@prisma/client';


const base = new PrismaClient({
  transactionOptions: { maxWait: 10_000, timeout: 10_000 },
});

/**
 * Middleware implemented as a client extension
 */
const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        console.log(`[Prisma] Model: ${model ?? 'n/a'}, Action: ${operation}`);

        try {
          return await query(args);
        } catch (error) {
          console.error(
            `[Prisma] Error in ${model ?? 'n/a'}.${operation}:`,
            error
          );
          throw error;
        }
      },
    },
  },
});

export default prisma;
