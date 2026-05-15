const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuário
 *   description: Gerenciamento do perfil do usuário autenticado
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna dados do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/me', auth, controller.getMe);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Atualiza nome e/ou e-mail do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Atualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: novo@email.com
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Resposta'
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *       400:
 *         description: E-mail já em uso por outro usuário
 */
router.put('/me', auth, controller.updateMe);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Remove permanentemente a conta do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta removida com sucesso
 *       401:
 *         description: Não autenticado
 */
router.delete('/me', auth, controller.deleteMe);

module.exports = router;
