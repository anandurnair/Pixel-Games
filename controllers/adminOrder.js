const adminOrder={}
const Orders=require('../Models/order')
const Users = require('../Models/user')

adminOrder.orderList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {
      // Populate the userId field to get user details
      const orders = await Orders.find().populate('userId');

      res.render('admin/pages/orderList', { orders });
    } else {
      res.redirect('/adminLogin');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports=adminOrder