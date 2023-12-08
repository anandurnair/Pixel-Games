const adminOrder={}
const Orders=require('../Models/order')
const Users = require('../Models/user')
const paginate = require('paginate'); 

let orderList =[];



adminOrder.orderList = async (req, res) => {
  try {
    if (req.session.adminLogIn) {

      const currentPage = parseInt(req.query.page) || 1; 
      const perPage = 4;
      console.log('Page :',currentPage)
     let skipValue = 0; 
      if (currentPage < 1) {
        currentPage = 1; // Reset to 1 if currentPage is less than 1
      }
      if (currentPage > 1) {
        skipValue = (currentPage - 1) * perPage; 
      } 
      console.log("skip : ",skipValue)
      const totalOrders = await Orders.countDocuments(); 
      const totalPages = Math.ceil(totalOrders / perPage); // Calculate total pages
      
      const orders = await Orders.find()
        .populate('userId')
        .populate('gameItems.gameId')
        .skip(skipValue)
        .limit(perPage);
        
      let orderNull=''
      if(!orders){
        orderNull="No orders"
      }
     
        
      
      res.render('admin/pages/orderList', { orders, currentPage, totalPages,orderNull });
      
    } else {
      res.redirect('/adminLogin');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports=adminOrder