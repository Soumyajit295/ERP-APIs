import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_BEARER_AUTH = 'access-token';
export const SWAGGER_REFRESH_COOKIE_AUTH = 'refresh-token-cookie';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('ERP APIs')
    .setDescription('API documentation for the ERP backend.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the JWT access token returned by /auth/login.',
      },
      SWAGGER_BEARER_AUTH,
    )
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'HTTP-only refresh token cookie set by /auth/login.',
      },
      SWAGGER_REFRESH_COOKIE_AUTH,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
