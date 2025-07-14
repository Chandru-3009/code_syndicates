import { parentPort, workerData } from 'worker_threads';
import bcrypt from 'bcrypt';

async function hashPassword() {
  const { password, saltRounds } = workerData;
  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    parentPort.postMessage({ success: true, hash: hashed });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
}

hashPassword();
