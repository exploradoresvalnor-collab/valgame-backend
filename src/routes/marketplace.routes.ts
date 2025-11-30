import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  listItemInMarketplace,
  buyItemFromMarketplace,
  cancelMarketplaceListing
} from '../controllers/marketplace.controller';

const router = Router();

router.post('/marketplace/list', auth, listItemInMarketplace);
router.post('/marketplace/buy/:listingId', auth, buyItemFromMarketplace);
router.post('/marketplace/cancel/:listingId', auth, cancelMarketplaceListing);

export default router;
