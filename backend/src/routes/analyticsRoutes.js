const router  = require('express').Router();
const controller = require('../controllers/analyticsController');
const auth     = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Análise
 *   description: Perfil comportamental gerado pelo modelo K-Means
 */

/**
 * @swagger
 * /analytics/profile:
 *   get:
 *     summary: Retorna o perfil comportamental do usuário
 *     description: |
 *       Retorna o perfil classificado pelo modelo K-Means (K=4), junto com médias dos últimos
 *       30 registros, insights e recomendações personalizadas.
 *
 *       O perfil é atualizado automaticamente a cada novo registro via `POST /mood`.
 *
 *       **Aviso:** Este resultado não substitui acompanhamento profissional de saúde mental.
 *     tags: [Análise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil comportamental gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PerfilComportamental'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Perfil ainda não gerado — crie ao menos um registro via POST /mood
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               data: null
 *               message: "Perfil ainda não gerado. Registre seu humor para receber uma análise."
 */
router.get('/profile', auth, controller.getProfile);

module.exports = router;
