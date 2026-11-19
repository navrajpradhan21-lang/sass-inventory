// this is temporary

import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.ts";

export const devTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // This bypass is strictly for local development.
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message: "Development tenant middleware is disabled",
    });
  }

  try {
    const organizationId = req.header("x-organization-id");
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organisation ID is required"
      });
    }
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId
      },
      select: {
        id: true
      }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }
    req.organizationId = organization.id;
    next();
  } catch (error) {
    next(error);
  }
};

//. What does this middleware do?
// 1. Reads the x-organization-id header from the request.
// 2. Checks whether that organization exists in PostgreSQL.
// 3. Stores its ID in req.organizationId.
// 4. Calls next() to allow the request to reach the controller.