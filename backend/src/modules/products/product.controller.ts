import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma.ts";
import { success } from "zod";

// CREATE PRODUCT 
export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, sku, description, categoryId, price, costPrice } = req.body;
        if (!name || !sku || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, SKU and price are required",
            });
        }
        if (Number(price) <= 0 || !Number.isFinite(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number",
            });
        }
        const product = await prisma.product.create({
            data: {
                organizationId: req.organizationId,
                name,
                sku,
                description,
                categoryId: categoryId || null,
                price: Number(price),
                costPrice: costPrice !== undefined ? Number(costPrice) : null,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });

    } catch (error) {
        next(error)

    }
}
// GET ALL PRODUCTS
export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // getting is for middleware
        const organizationId = req.organizationId;

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }

        const products = await prisma.product.findMany({
            where: {
                organizationId,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });

    } catch (error) {
        next(error);
    }
};


// GET SINGLE PRODUCT 
export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                organizationId: req.organizationId,
            },
            include: { category: true }
        });
        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error)
    }
}

// UPDATE PRODUCT 
export const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // getting is for middleware
        const organizationId = req.organizationId;

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }

        const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        const {
            name,
            sku,
            description,
            categoryId,
            price,
            costPrice,
        } = req.body;

        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                organizationId: req.organizationId,
            },
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            });
        }

        if (costPrice !== undefined &&
            (!Number.isFinite(Number(costPrice)) || Number(costPrice) < 0)) {
            return res.status(404).json({
                success: false,
                message: "Cost price cannot be negative"
            });
        }

        const product = await prisma.product.update({
            where:{id:existingProduct.id},
            data:{
                ...(name !== undefined && {name}),
                ...(sku !== undefined && {sku}),
                ...(description !== undefined && {description}),
                ...(categoryId !== undefined && {categoryId: categoryId || null}),
                ...(price !== undefined && {price: Number(price)}),
                ...(costPrice !== undefined && {costPrice: Number(costPrice)}),
            }
        });
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });

    } catch (error) {
        next(error);
    }
}

export const deleteProduct = async(
    req:Request,
    res: Response,
    next:NextFunction
)=>{
    try{
        // getting is for middleware
        const organizationId = req.organizationId;

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }

        const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const existingProduct = await prisma.product.findFirst({
            where:{
                id:productId,
                organizationId
            },
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            });
        }
        
        await prisma.product.update({
            where:{
                id:existingProduct.id
            },
            data:{
                isActive:false
            }
        });
        res.status(200).json({
            success:true,
            message:"Product deactivated successFully"
        });

    }catch(error){
        next(error)
    }

};