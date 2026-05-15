const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EntreMentes API',
      version: '1.0.0',
      description:
        'API REST da plataforma EntreMentes — registro e análise de humor de estudantes universitários. ' +
        'Projeto Interdisciplinar 6º semestre FATEC DSM.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desenvolvimento local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido via POST /auth/login',
        },
      },
      schemas: {
        Resposta: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { nullable: true },
            message: { type: 'string', nullable: true },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            name:      { type: 'string', example: 'João Silva' },
            email:     { type: 'string', format: 'email', example: 'joao@email.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegistroBemEstar: {
          type: 'object',
          properties: {
            id:                  { type: 'string', format: 'uuid' },
            userId:              { type: 'string', format: 'uuid' },
            nivelHumor:          { type: 'integer', minimum: 1, maximum: 5, example: 4 },
            tempoTela:           { type: 'number', example: 6.5, description: 'Horas/dia' },
            duracaoSono:         { type: 'number', example: 7.0, description: 'Horas/noite' },
            atividadeFisica:     { type: 'number', example: 3.0, description: 'Horas/semana' },
            nivelEstresse:       { type: 'string', enum: ['Baixo', 'Medio', 'Alto'], example: 'Medio' },
            ansiedadeAntesProva: { type: 'boolean', example: false },
            desempenhoAcademico: { type: 'string', enum: ['Melhorou', 'Mesmo', 'Piorou'], example: 'Mesmo' },
            nota:                { type: 'string', nullable: true, example: 'Me senti bem hoje.' },
            createdAt:           { type: 'string', format: 'date-time' },
          },
        },
        PerfilComportamental: {
          type: 'object',
          properties: {
            nomePerfil:   { type: 'string', enum: ['Equilibrado', 'Rotina Saudável', 'Sob Pressão', 'Em Alerta'], example: 'Rotina Saudável' },
            clusterId:    { type: 'integer', minimum: 0, maximum: 3, example: 2 },
            nivelRisco:   { type: 'string', enum: ['Baixo', 'Moderado', 'Alto'], example: 'Baixo' },
            emoji:        { type: 'string', example: '🟡' },
            corRisco:     { type: 'string', example: '#FDCB6E' },
            bgRisco:      { type: 'string', example: '#FFFBEE' },
            justificativa:{ type: 'string', example: 'Seu padrão indica estabilidade geral...' },
            medias: {
              type: 'object',
              properties: {
                duracaoSono:     { type: 'number', nullable: true, example: 6.8 },
                tempoTela:       { type: 'number', nullable: true, example: 7.2 },
                atividadeFisica: { type: 'number', nullable: true, example: 2.1 },
              },
            },
            insights:      { type: 'array', items: { type: 'string' }, example: ['Tempo de tela acima do recomendado'] },
            recomendacoes: { type: 'array', items: { type: 'string' }, example: ['Reduza o tempo de tela 1h antes de dormir'] },
            geradoEm:      { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
