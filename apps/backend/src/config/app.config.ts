export default () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  mail: {
    from: process.env.MAIL_FROM || 'noreply@example.com',
    appUrl: process.env.APP_URL || 'http://localhost:4200',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
  },
});
