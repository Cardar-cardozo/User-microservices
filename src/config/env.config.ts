import * as env from 'env-var';
import { config } from 'dotenv';

config();

export const NODE_ENV = env.get('NODE_ENV').asString();
export const PORT = env.get('PORT').required().asInt();
export const JWT_KEY = env.get('JWT_KEY').asString();

export const DB_URL = env.get('DB_URL').asString();
