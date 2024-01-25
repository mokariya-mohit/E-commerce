const express = require("express");
const routes = express.Router();
const product = require("../models/Proudct");
const productController = require("../controllers/productController");

routes.get("/add_product", productController.add_product);

routes.get("/view_product", productController.view_product);

routes.post('/edit_product', product.uploadimage, productController.edit_product);
routes.post("/insert_product", product.uploadimage, productController.insert_product)

routes.post("/getBrandType", productController.getBrandType)
routes.post("/deleteimg", productController.deleteimg)
routes.get('/isActive/:id', productController.isActive);
routes.get('/deActive/:id', productController.deActive);
routes.get('/deletAdmin/:id', productController.deletAdmin);
routes.get('/updateproduct/:id', productController.updateproduct);
module.exports = routes;