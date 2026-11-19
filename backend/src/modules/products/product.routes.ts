import { Router } from "express";
import { createProduct,getProducts,getProductById ,updateProduct,deleteProduct } from "./product.controller.ts";
import { devTenant } from "../../middleware/devTenant.middleware.ts";

const router = Router();

// Apply tenant middleware to all poducts routes
router.use(devTenant);

//CREATE PRODUCTS 
router.post("/",createProduct);

// GET ALL PRODUCTS
router.get("/",getProducts);

// GET SINGLE PRODUCT
router.get("/:id",getProductById);

// UPDATE PRODUCT
router.patch("/:id",updateProduct);

// DELETE PRODUCT
router.delete("/:id",deleteProduct);

export default router;
