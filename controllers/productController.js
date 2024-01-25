
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const ExtraCategoryxtracategory = require("../models/ExtraCategory");
const Brand = require("../models/Brand");
const Type = require("../models/Type");
const Product = require("../models/Proudct");
const path = require('path');
const fs = require('fs');
const ExtraCategory = require("../models/ExtraCategory");

module.exports.add_product = async (req, res) => {
    let categoryData = await Category.find({});
    let subcategoryData = await Subcategory.find({});
    let extraCategoryData = await ExtraCategoryxtracategory.find({});
    let brandData = await Brand.find({});
    let typeData = await Type.find({});

    return res.render("admin/add_product", {
        categoryData: categoryData,
        subcategoryData: subcategoryData,
        extraCategoryData: extraCategoryData,
        brandData: brandData,
        typeData: typeData
    });
}

module.exports.view_product = async (req, res) => {
    try {
        var search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        if (req.query.page) {
            page = req.query.page;
        }
        else {
            page = 0;
        }
        var perPage = 12;
        let productData = await Product.find({
            $or: [
                { "product_title": { $regex: ".*" + search + ".*", $options: "i" } },
            ]
        }).limit(perPage).skip(perPage * page).populate(['category', 'subcategory', 'extracategory', 'brandname', 'typeName']).exec();
        let totalTypedata = await Product.find({
            $or: [
                { "product_title": { $regex: ".*" + search + ".*", $options: "i" } },
            ]
        }).countDocuments();
        return res.render('admin/view_product', {
            productData: productData,
            searchValue: search,
            totaldocument: Math.ceil(totalTypedata / perPage),
            currentPage: page,
        })
    }
    catch (error) {
        console.log(error);
        return res.redirect('back');
    }

}
module.exports.insert_product = async (req, res) => {
    try {
        // console.log(req.body);
        // console.log(req.files);
        let imagePath = "";
        let imageMulPath = [];
        if (req.files) {
            imagePath =
                Product.prsingleimg +
                "/" +
                req.files.ProductImage[0].filename;
            req.files.multipleproductimage.map((v, i) => {
                imageMulPath.push(Product.prmulimg + "/" + v.filename);
            });
            if (req.body) {
                req.body.ProductImage = imagePath;
                req.body.multipleproductimage = imageMulPath;
                req.body.IsActive = true;
                req.body.Create_Date = new Date().toLocaleString();
                req.body.Upadate_Date = new Date().toLocaleString();
                let productData = await Product.create(req.body);
                if (productData) {
                    return res.redirect("back");
                } else {
                    console.log("Product not inserted");
                    return res.redirect("back");
                }
            } else {
                console.log("Data not found");
                return res.redirect("back");
            }
        } else {
            console.log("Images not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.getBrandType = async (req, res) => {
    try {
        let brandData = await Brand.find({
            categoryId: req.body.categoryId,
            subcategoryId: req.body.subcategoryId,
            extracategoryId: req.body.extracategoryId,
        });
        let typeData = await Type.find({
            categoryId: req.body.categoryId,
            subcategoryId: req.body.subcategoryId,
            extracategoryId: req.body.extracategoryId,
        });
        return res.render("Admin_pages/ajaxBrandType", {
            brandData: brandData,
            typeData: typeData,
        });
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};



module.exports.isActive = async (req, res) => {
    try {
        if (req.params.id) {
            let active = await Product.findByIdAndUpdate(req.params.id, { IsActive: false });
            if (active) {
                console.log("Data Deactive Successfully");
                return res.redirect('back');
            }
            else {
                console.log("Record Not Deactive");
                return res.redirect('back');
            }
        }
        else {
            console.log("Params Id not Found");
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}
module.exports.deActive = async (req, res) => {
    try {
        if (req.params.id) {
            let active = await Product.findByIdAndUpdate(req.params.id, { IsActive: true });
            if (active) {
                console.log("Data Isactive Successfully");
                return res.redirect('back');
            }
            else {
                console.log("Record Not Deactive");
                return res.redirect('back');
            }
        }
        else {
            console.log("Params Id not Found");
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deleteimg = async (req, res) => {
    try {
        // console.log(req.body.img);
        var productsdata = await Product.findById(req.body.id);

        var de = productsdata.multipleproductimage.splice(req.body.i, 1);
        //console.log(de);

        var fullPath = path.join(__dirname, '..', req.body.img);
        await fs.unlinkSync(fullPath);
        var datas = await Product.findByIdAndUpdate(req.body.id, productsdata)
        if (datas) {
            console.log("Data Updated Successfully");
            return res.redirect('/admin/product/view_product');
        }
        else {
            console.log("Record Not Updated Successfully");
            return res.redirect('/admin/product/view_product');
        }

    }
    catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}

module.exports.deletAdmin = async (req, res) => {
    try {
        let oldData = await Product.findById(req.params.id);
        var oldimages = oldData.multipleproductimage;
        if (oldimages.length >= 1) {
            for (var i = 0; i < oldimages.length; i++) {
                console.log(oldimages[i]);
                var imgpath = path.join(__dirname, '..', oldimages[i]);
                console.log(imgpath);
                await fs.unlinkSync(imgpath)
            }
        }
        if (oldData) {
            var oldImage = oldData.ProductImage;

            if (oldImage) {
                let fullPath = path.join(__dirname, '..', oldData.ProductImage);
                await fs.unlinkSync(fullPath);
                console.log(oldimages);

                let deletData = await Product.findByIdAndDelete(req.params.id);
                if (deletData) {
                    console.log("Record & Image Delet Succesfully");
                    return res.redirect('back');
                }
                else {
                    console.log("Record Delet Succesfully");
                    return res.redirect('back');
                }
            }
            else {
                let deletData = await Product.findByIdAndDelete(req.params.id);
                if (deletData) {
                    console.log("Admin Data not Delet");
                    return res.redirect('back');
                }
                else {
                    console.log("Admin Record Deleted");
                    return res.redirect('back');
                }
            }
        }
        else {
            console.log("Record Not Found");
            return res.redirect('back');
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect('back');
    }
}

module.exports.updateproduct = async (req, res) => {
    try {
        let productRecord = await Product.findById(req.params.id).populate(['category', 'subcategory', 'extracategory', 'brandname', 'typeName']).exec();;
        //console.log(productRecord);
        let categoryData = await Category.find({});
        let subcateData = await Subcategory.find({});
        let extraCategoryData = await ExtraCategory.find({});
        let brandData = await Brand.find({});
        let typeData = await Type.find({});
        if (productRecord) {
            return res.render('update_product', {

                productRecord: productRecord,
                categoryData: categoryData,
                subcateData: subcateData,
                extraCategoryData: extraCategoryData,
                brandData: brandData,
                typeData: typeData
            })
        }
        else {
            console.log('Record Not Found');
            return res.redirect('back');
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect('back');
    }
}


module.exports.edit_product = async (req, res) => {
    try {
        if (req.files.ProductImage) {
            let oldData = await Product.findById(req.body.EditId);
            if (oldData) {
                if (oldData.ProductImage) {
                    let fullPath = path.join(__dirname, '..', oldData.ProductImage);
                }
                if (req.files.multipleproductimage) {
                    let multipleimg = [];
                    let oldpro = await Product.findById(req.body.EditId);

                    for (var j = 0; j < oldpro.multipleproductimage.length; j++) {
                        multipleimg.push(oldpro.multipleproductimage[j]);
                    }
                    for (var i = 0; i < req.files.multipleproductimage.length; i++) {
                        multipleimg.push(Product.prmulimg + "/" + req.files.multipleproductimage[i].filename);
                    }
                    req.body.multipleproductimage = multipleimg;
                }
                var productImagePath = product.prsingleimg + '/' + req.files.ProductImage[0].filename;
                req.body.ProductImage = productImagePath;

                req.body.Upadate_Date = new Date().toLocaleString();
                let ad = await Product.findByIdAndUpdate(req.body.EditId, req.body);
                if (ad) {
                    console.log("Record & Image Update Succesfully");
                    return res.redirect('/admin/product/view_product');
                }
                else {
                    console.log("Record Not Updated");
                    return res.redirect('/admin/product/view_product');
                }
            }
            else {
                console.log("Record Not Updated");
                return res.redirect('/admin/product/view_product');
            }
        }
        else {
            let oldData = await Product.findById(req.body.EditId);
            if (oldData) {
                if (req.files.multipleproductimage) {
                    let multipleimg = [];
                    let oldpro = await Product.findById(req.body.EditId);
                    for (var j = 0; j < oldpro.multipleproductimage.length; j++) {
                        multipleimg.push(oldpro.multipleproductimage[j]);
                    }
                    for (var i = 0; i < req.files.multipleproductimage.length; i++) {
                        multipleimg.push(Product.prmulimg + "/" + req.files.multipleproductimage[i].filename);
                    }
                    req.body.multipleproductimage = multipleimg;
                }
                req.body.ProductImage = oldData.ProductImage;

                req.body.Upadate_Date = new Date().toLocaleString();
                let ad = await Product.findByIdAndUpdate(req.body.EditId, req.body);
                if (ad) {
                    console.log("Record & Image Update Succesfully");
                    return res.redirect('/admin/product/view_product');
                }
                else {
                    console.log("Record Not Updated");
                    return res.redirect('/admin/product/view_product');
                }
            }
            else {
                console.log("Record Not Updated");
                return res.redirect('/admin/product/view_product');
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.redirect('/admin/product/view_product');
    }
}
