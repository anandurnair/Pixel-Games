const adminOrder={}
const Orders=require('../Models/order')
const Users = require('../Models/user')
const paginate = require('paginate'); 

adminOrder.orderList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      const currentPage = parseInt(req.query.page) || 1; 
      const perPage = 10;

      let skipValue = 0; 

      if (currentPage > 1) {
        skipValue = (currentPage - 1) * perPage; 
      }
      const totalOrders = await Orders.countDocuments(); 

      const orders = await Orders.find()
      .populate('userId')
      .populate('gameItems.gameId')
      .skip(skipValue) 
      .limit(perPage);

      res.render('admin/pages/orderList', { orders ,currentPage, totalPages: Math.ceil(totalOrders / perPage)});
    } else {
      res.redirect('/adminLogin');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports=adminOrder