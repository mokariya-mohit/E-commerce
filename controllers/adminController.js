const fs = require("fs");

const path = require("path");

const Admin = require("../models/Admin");

const nodemailer = require('nodemailer');

module.exports.admin = async (req, res) => {
    try {
        let data = res.locals.user;
        if (data) {
            return res.redirect("/admin/dashboard");
        } else {
            return res.render("admin/login_admin");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.dashboard = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            return res.render("admin/dashboard");
        } else {
            return res.redirect("/admin/");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.add_admin = async (req, res) => {
    try {
        return res.render("admin/add_admin");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.insertAdminData = async (req, res) => {
    try {
        let imagePath = "";
        let fullname = "";
        if (req.file) {
            imagePath = Admin.imageModelPath + "/" + req.file.filename;
            if (req.body) {
                // fullname = req.body.fname + " " + req.body.lname;
                // req.body.name = fullname;
                req.body.adminImage = imagePath;
                req.body.isActive = true;
                req.body.created_date = new Date().toLocaleString();
                req.body.updated_date = new Date().toLocaleString();
                let adminData = await Admin.create(req.body);
                if (adminData) {
                    console.log("Data inserted successfully");
                    return res.redirect("back");
                } else {
                    console.log("Data not insert");
                    return res.redirect("back");
                }
            } else {
                console.log("Data not found");
                return res.redirect("back");
            }
        } else {
            console.log("Image not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.view_admin = async (req, res) => {
    try {
        let search = "";
        let page;
        if (req.query.page) {
            page = req.query.page;
        } else {
            page = 0;
        }
        let perPage = 10;

        if (req.query.search) {
            search = req.query.search;
        }

        let totalAdminData = await Admin.find({
            $or: [
                {
                    name: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                    },
                },
            ],
        }).countDocuments();

        let AdminData = await Admin.find({
            $or: [
                {
                    name: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                    },
                },
            ],
        })
            .limit(perPage)
            .skip(perPage * page);

        let adminData = await Admin.find({});
        if (adminData) {
            return res.render("admin/view_admin", {
                adminData: adminData,
                search: search,
                totalDocument: Math.ceil(totalAdminData / perPage),
                pageNo: parseInt(page),
            });
        } else {
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.loginAdmin = async (req, res) => {
    try {
        return res.redirect("/admin/dashboard");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.profile_admin = async (req, res) => {
    try {
        let adminData = await Admin.find({});
        if (adminData) {
            return res.render("admin/profile_admin", {
                adminData: adminData,
            });
        } else {
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.logout_admin = async (req, res) => {
    try {
        res.clearCookie("e-com");
        return res.redirect("/admin");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.editProfile = async (req, res) => {
    try {
        let oldData = await Admin.findById(req.body.oldId);
        if (req.file) {
            if (oldData.adminImage) {
                let fullPath = path.join(__dirname, ".." + oldData.adminImage);
                await fs.unlinkSync(fullPath);
            }
            let imagePath = "";
            imagePath = Admin.imageModelPath + "/" + req.file.filename;
            req.body.adminImage = imagePath;
        } else {
            req.body.adminImage = oldData.adminImage;
        }
        req.body.name = req.body.fname + " " + req.body.lname;
        await Admin.findByIdAndUpdate(req.body.oldId, req.body);
        let adminData = await Admin.findById(req.body.oldId);
        res.locals.user = adminData;
        return res.redirect("back");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.updateAdmin = async (req, res) => {
    try {
        if (req.query.id) {
            let adminData = await Admin.findById(req.query.id);
            return res.render("admin/update_admin", {
                adminData: adminData,
            });
        } else {
            console.log("Data not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.editAdminData = async (req, res) => {
    try {
        let oldData = await Admin.findById(req.body.oldId);
        if (req.file) {
            if (oldData.adminImage) {
                let fullPath = path.join(__dirname, ".." + oldData.adminImage);
                await fs.unlinkSync(fullPath);
            }
            let imagePath = "";
            imagePath = Admin.imageModelPath + "/" + req.file.filename;
            req.body.adminImage = imagePath;
            res.locals.user.adminImage = imagePath;
        } else {
            req.body.adminImage = oldData.adminImage;
        }
        req.body.name = req.body.fname + " " + req.body.lname;
        await Admin.findByIdAndUpdate(req.body.oldId, req.body);
        let adminData = await Admin.findById(req.body.oldId);
        res.locals.user = adminData;
        return res.redirect("/admin/view_admin");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.deleteAdmin = async (req, res) => {
    try {
        if (req.query.id) {
            let oldData = await Admin.findById(req.query.id);
            if (oldData) {
                if (oldData.adminImage) {
                    let fullPath = path.join(
                        __dirname,
                        ".." + oldData.adminImage
                    );
                    await fs.unlinkSync(fullPath);
                } else {
                    console.log("Admin  image not found");
                }
            } else {
                console.log("Admin not found");
            }
            let data = await Admin.findByIdAndDelete(req.query.id);
            console.log(data);
            if (data) {
                return res.redirect("back");
            } else {
                console.log("Admin not delete");
                return res.redirect("back");
            }
        } else {
            console.log("Admin not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.deactiveAdmin = async (req, res) => {
    try {
        if (req.query.id) {
            let data = await Admin.findByIdAndUpdate(req.query.id, {
                isActive: false,
            });
            if (data) {
                return res.redirect("back");
            } else {
                console.log("Admin not deactivate");
                return res.redirect("back");
            }
        } else {
            console.log("Admin not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.activeAdmin = async (req, res) => {
    try {
        if (req.query.id) {
            let data = await Admin.findByIdAndUpdate(req.query.id, {
                isActive: true,
            });
            if (data) {
                return res.redirect("back");
            } else {
                console.log("Admin not activate");
                return res.redirect("back");
            }
        } else {
            console.log("Admin not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.changePassword = async function (req, res) {
    try {
        if (res.locals.user == undefined) {
            return res.redirect('/admin');
        }
        let adminRecord = res.locals.user;
        return res.render('changePassword', {
            admin: adminRecord
        });
    }
    catch (err) {
        console.log(err);
        return res.redirect('back');
    }
}
module.exports.modifyPassword = async function (req, res) {
    try {
        console.log(req.body);
        let adminData = res.locals.user;
        if (adminData.password == req.body.Cpassword) {
            if (req.body.Cpassword != req.body.Npassword) {
                if (req.body.Npassword == req.body.Copassword) {
                    let allAdmin = await Admin.findById(adminData._id);
                    if (allAdmin) {
                        let editPass = await Admin.findByIdAndUpdate(allAdmin.id, { 'password': req.body.Npassword });
                        if (editPass) {
                            return res.redirect('/admin/checkLogout');
                        }
                        else {
                            console.log("Password Updated");
                        }
                    } else {
                        console.log("Record not found");
                    }
                }
                else {
                    console.log("Confirm Password are not same");
                }
            }
            else {
                console.log("Current password and New password are same");
            }
        }
        else {
            console.log("Please enter a valid password");
        }
        return res.redirect('back');
    }
    catch (err) {
        console.log(err);
        return res.redirect('back');
    }
};


module.exports.mailPage = async function (req, res) {
    return res.render('forgetPassword/emailPage');
};

module.exports.checkMail = async function (req, res) {
    try {
        let checkEmail = Admin.findOne({ email: req.body.email });
        if (checkEmail) {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: "mohitmokariya1238@gmail.com",
                    pass: "akatzahhkozdtwsl",
                },
            });

            var otp = Math.floor(1000 + Math.random() * 9999);

            res.cookie('otp', otp);
            res.cookie('email', req.body.email);

            const info = await transporter.sendMail({
                from: "mohitmokariya1238@gmail.com", // sender address
                to: "mohitmokariya1238@gmail.com", // list of receivers
                subject: "OTP ✔", // Subject line
                text: "OTP is Here", // plain text body
                html: `<b>${otp}</b>`, // html body
            });
            console.log(otp);
            console.log("Sent Email");
            return res.redirect('/admin/checkotp');
        }
        else {
            console.log("Email not found");
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log("Something went wrong");
        return res.redirect('back');
    }
};


module.exports.verifyotp = function (req, res) {
    // console.log(req.body.otp);
    try {
        if (req.body.otp == req.cookies.otp) {
            res.redirect('/admin/resetPass');
        }
        else {
            console.log("OTP Can Not Verify");
        }
    }
    catch (err) {
        console.log("something went wrong");
        res.redirect('back');
    };
};
module.exports.changepass = async function (req, res) {
    try {
        console.log(req.body);
        if (req.body.npass == req.body.cpass) {
            let data = await Admin.findOne({ email: req.cookies.email });
            if (data) {
                let reset = await Admin.findByIdAndUpdate(data.id, { password: req.body.npass });
                if (reset) {
                    res.clearCookie('otp');
                    res.clearCookie('email');
                    return res.redirect('/admin');
                }
                else {
                    console.log("Password Not Updated");
                    return res.redirect('back');
                }
            }
            else{
                console.log('Admin not found');
                return res.redirect('back')
            }
        }
        else {
            console.log("New and Confirm Password Not Match");
            return res.redirect('back');
        }
    }
    catch (err) {
        console.log("something went wrong");
        res.redirect('back');
    }
};