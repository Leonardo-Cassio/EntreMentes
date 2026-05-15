const router = require('express').Router();
const controller = require('../controllers/moodController');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Humor
 *   description: Registros diários de bem-estar
 */

/**
 * @swagger
 * /mood:
 *   post:
 *     summary: Criar registro de humor
 *     description: Cria um novo registro de bem-estar. Após salvar, dispara automaticamente a classificação comportamental em segundo plano.
 *     tags: [Humor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nivelHumor, tempoTela, duracaoSono, atividadeFisica, nivelEstresse, ansiedadeAntesProva, desempenhoAcademico]
 *             properties:
 *               nivelHumor:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: "1 = muito ruim, 5 = excelente"
 *               tempoTela:
 *                 type: number
 *                 example: 6.5
 *                 description: Horas de tela por dia
 *               duracaoSono:
 *                 type: number
 *                 example: 7.0
 *                 description: Horas de sono por noite
 *               atividadeFisica:
 *                 type: number
 *                 example: 3.0
 *                 description: Horas de atividade física por semana
 *               nivelEstresse:
 *                 type: string
 *                 enum: [Baixo, Medio, Alto]
 *                 example: Medio
 *               ansiedadeAntesProva:
 *                 type: boolean
 *                 example: false
 *               desempenhoAcademico:
 *                 type: string
 *                 enum: [Melhorou, Mesmo, Piorou]
 *                 example: Mesmo
 *               nota:
 *                 type: string
 *                 nullable: true
 *                 example: Me senti bem hoje.
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RegistroBemEstar'
 *       401:
 *         description: Não autenticado
 *       400:
 *         description: Campos obrigatórios ausentes
 */
router.post('/', auth, controller.create);

/**
 * @swagger
 * /mood:
 *   get:
 *     summary: Listar registros do usuário
 *     tags: [Humor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-01"
 *         description: Data inicial do filtro (ISO 8601)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-15"
 *         description: Data final do filtro (ISO 8601)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Número máximo de registros retornados
 *     responses:
 *       200:
 *         description: Lista de registros em ordem decrescente de data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RegistroBemEstar'
 *       401:
 *         description: Não autenticado
 */
router.get('/', auth, controller.list);

/**
 * @swagger
 * /mood/{id}:
 *   get:
 *     summary: Buscar registro por ID
 *     tags: [Humor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do registro
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RegistroBemEstar'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Registro não encontrado ou pertence a outro usuário
 */
router.get('/:id', auth, controller.getById);

/**
 * @swagger
 * /mood/{id}:
 *   put:
 *     summary: Atualizar registro existente
 *     description: Apenas os campos enviados são alterados.
 *     tags: [Humor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nivelHumor:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               tempoTela:
 *                 type: number
 *               duracaoSono:
 *                 type: number
 *               atividadeFisica:
 *                 type: number
 *               nivelEstresse:
 *                 type: string
 *                 enum: [Baixo, Medio, Alto]
 *               ansiedadeAntesProva:
 *                 type: boolean
 *               desempenhoAcademico:
 *                 type: string
 *                 enum: [Melhorou, Mesmo, Piorou]
 *               nota:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RegistroBemEstar'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Registro não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', auth, controller.update);

/**
 * @swagger
 * /mood/{id}:
 *   delete:
 *     summary: Remover registro
 *     tags: [Humor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro removido com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Registro não encontrado
 */
router.delete('/:id', auth, controller.remove);

module.exports = router;
