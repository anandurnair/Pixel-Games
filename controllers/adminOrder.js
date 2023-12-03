const adminOrder={}
const Orders=require('../Models/order')
const Users = require('../Models/user')
const paginate = require('paginate'); 

adminOrder.orderList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      const currentPage = parseInt(req.query.page) || 1; // Get the current page from query parameters or default to page 1
      const perPage = 10; 

      const orders = await Orders.find()
      .populate('userId')
      .populate('gameItems.gameId')

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