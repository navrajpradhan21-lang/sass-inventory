// Method	Endpoint	Purpose
// POST	/api/categories	Create category
// GET	/api/categories	Get all categories
// GET	/api/categories/:id	Get category by ID
// PATCH	/api/categories/:id	Update category
// DELETE	/api/categories/:id	Delete category

import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.ts"
import { success } from "zod";

// CREATE CATEGORY
export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = req.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }
        const { name, description } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }
        const category = await prisma.category.create({
            data: {
                organizationId,
                name: name.trim(),
                description
            },
        });

    } catch (error) {
        next(error)
    }
};


// GET ALL CATEGORY
export const getAllCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = req.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }
        const categories = await prisma.category.findMany({
            where: {
                organizationId,
            },
            orderBy: { createdAt: "desc" } // most recent sab say baada
        });
        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });

    } catch (error) {
        next(error)
    }
};

// GET CATEGORY BY ID 
export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = req.organizationId;
        const categoryId = req.params.id;
        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                organizationId
            },
            include: { products: true },
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error)
    }
};


// UPDATE CATEGORY
export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = req.organizationId;
        const categoryId = req.params.id;

        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const { name, description } = req.body;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                organizationId,
            }
        });
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        if (
            name !== undefined &&
            (typeof name !== "string" || name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Category name cannot be empty"
            })
        }
        const category = await prisma.category.update({
            where: {
                id: existingCategory.id,
            },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(description !== undefined && { description }),
            },
        });

        return res.status(200).json({
            success: true,
            message: "category updated successfully",
            data: category
        });

    } catch (error) {
        next(error)
    }
};

// DELETE CATEGORY
export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = req.organizationId;
        const categoryId = req.params.id;
        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "Invalid category ID" });
        }
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID missing",
            });
        }
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                organizationId,
            }
        });
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const productCount = await prisma.product.count({
            where: {
                categoryId,
                organizationId
            },
        });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category because products are associated with it"
            })
        }
        await prisma.category.delete({
            where: {
                id: existingCategory.id,
            },
        });
    } catch (error) {
        next(error)
    }
};


