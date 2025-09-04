import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PrivacyPolicyController } from './privacyPolicy/privacyPolicy.controllers';
import { TermsConditionsController } from './termsConditions/termsConditions.controllers';

const router = Router();
router
  .route('/privacy-policy')
  .get(PrivacyPolicyController.getPrivacyPolicy)
  .post(auth('Admin', 'Super_Admin'), PrivacyPolicyController.createOrUpdatePrivacyPolicy);
router
  .route('/terms-conditions')
  .get(TermsConditionsController.getTermsConditions)
  .post(auth('Admin', 'Super_Admin'), TermsConditionsController.createOrUpdateTermsConditions);

export const SettingsRoutes = router;
