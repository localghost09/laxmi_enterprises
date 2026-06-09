import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, addStock } from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/add-stock', addStock);

export default router;
