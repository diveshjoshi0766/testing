const customerModel = require("../../models/customerModel");
const { responseReturn } = require("../../utiles/response");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const { createToken } = require("../../utiles/tokenCreate");
const { sendEmail } = require("../../utiles/email");

class customerAuthController {
  customer_register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const customer = await customerModel.findOne({ email });
      if (customer) {
        responseReturn(res, 404, { error: "Email Already Exits" });
      } else {
        const createCustomer = await customerModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 10),
          method: "menualy",
        });
        await sellerCustomerModel.create({
          myId: createCustomer.id,
        });
        const token = await createToken({
          id: createCustomer.id,
          name: createCustomer.name,
          email: createCustomer.email,
          method: createCustomer.method,
        });
        res.cookie("customerToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, { message: "User Register Success", token });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  customer_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const customer = await customerModel
        .findOne({ email })
        .select("+password");
      if (customer) {
        const match = await bcrypt.compare(password, customer.password);
        if (match) {
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          });
          res.cookie("customerToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 201, { message: "User Login Success", token });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email Not Found" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

   reset_password = async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await customerModel.findOne({ email });
        if (!customer) {
            return responseReturn(res, 404, { error: "Email Not Found" });
        }
        const newPassword = crypto.randomBytes(6).toString('hex'); 
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        customer.password = hashedPassword;
        await customer.save();
        const emailContent = `Your new temporary password is: ${newPassword}
        \nPlease login and change your password.`;

        await sendEmail({
            to: customer.email,
            subject: 'Your New Password',
            text: emailContent
        });

        responseReturn(res, 200, { message: "New password sent to your email." });
        
    } catch (error) {
        console.error(error.message);
        responseReturn(res, 500, { error: "An error occurred. Please try again." });
    }
};


  customer_logout = async (req, res) => {
    res.cookie("customerToken", "", {
      expires: new Date(Date.now()),
    });
    responseReturn(res, 200, { message: "Logout Success" });
  };
  // End Method
}

module.exports = new customerAuthController();
