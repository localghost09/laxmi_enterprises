import { Router } from 'express';
import { createInvoice, getInvoices, getInvoiceByNumber } from '../controllers/invoiceController';

const router = Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:invoiceNumber', getInvoiceByNumber);

export default router;
