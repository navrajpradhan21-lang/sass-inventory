
import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./modules/products/product.routes.ts"


const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

app.use("/api/products",productRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Inventory SaaS API is running"
    });
});


export default app;
