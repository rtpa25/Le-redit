declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    SESSION_SECRET: string;
    REDIS_PORT: string;
    REDIS_HOST: string;
    PASSWORD: string;
  }
}