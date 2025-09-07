import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PrivacyPolicyController } from './privacyPolicy/privacyPolicy.controllers';
import { TermsConditionsController } from './termsConditions/termsConditions.controllers';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings and policies endpoints
 */

/**
 * @swagger
 * /settings/privacy-policy:
 *   get:
 *     summary: Get privacy policy
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Privacy policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     version:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Privacy policy not found
 *   post:
 *     summary: Create or update privacy policy (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Privacy policy content
 *               version:
 *                 type: string
 *                 description: Policy version
 *     responses:
 *       200:
 *         description: Privacy policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       201:
 *         description: Privacy policy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/privacy-policy')
  .get(PrivacyPolicyController.getPrivacyPolicy)
  .post(auth('Admin', 'Super_Admin'), PrivacyPolicyController.createOrUpdatePrivacyPolicy);

/**
 * @swagger
 * /settings/terms-conditions:
 *   get:
 *     summary: Get terms and conditions
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Terms and conditions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     content:
 *                       type: string
 *                     version:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Terms and conditions not found
 *   post:
 *     summary: Create or update terms and conditions (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Terms and conditions content
 *               version:
 *                 type: string
 *                 description: Terms version
 *     responses:
 *       200:
 *         description: Terms and conditions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       201:
 *         description: Terms and conditions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router
  .route('/terms-conditions')
  .get(TermsConditionsController.getTermsConditions)
  .post(auth('Admin', 'Super_Admin'), TermsConditionsController.createOrUpdateTermsConditions);

export const SettingsRoutes = router;
