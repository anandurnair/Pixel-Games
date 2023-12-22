const Users = require("../Models/user");
const Games = require("../Models/game");
const Genres = require("../Models/genre");
const Orders = require('../Models/order');
const Coupons = require('../Models/coupon')
const multer = require("multer");
const path =require('path')
const adminController = {};
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join( "views", "gameImages")); // Adjust the destination folder as needed
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
  
});

const upload = multer({ storage: storage });
adminController.upload = upload.array("gameImage",3);
adminController.upload2 = multer({  
  storage: storage,
  fileFilter: function (req, file, cb) {
  
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
}).array("gameImage", 3); 


adminController.upload3 = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
}).fields([
  { name: 'gameImage1', maxCount: 1 },
  { name: 'gameImage2', maxCount: 1 },
  { name: 'gameImage3', maxCount: 1 },
]);

let adminEmail = "anandu123@gmail.com";
let adminPassword = 123;
var adminLogIn;

adminController.login = (req, res) => {
  try {
    if (req.session.adminLogIn) {
      res.redirect("/adminDashboard");
    } else {
      res.render("admin/pages/login.ejs");
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
};

adminController.loginData = (req, res) => {
  try {
    const { email, password } = req.body;

    if (email == adminEmail && password == adminPassword) {
      req.session.adminLogIn = true;
      res.redirect("/adminDashboard");
    } else {
      res.render("admin/pages/login.ejs", {
        err: true,
        message: "Invalid Email / password",
      });
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminController.dashboard = async(req, res) => {
  try {
    if (req.session.adminLogIn) {
      const userCount = await Users.countDocuments() 
      const gameCount = await Games.countDocuments()
      const orderCount = await Orders.countDocuments()
      const couponCount = await Coupons.countDocuments()
      const counts = {
        userCount,gameCount,orderCount,couponCount
      }



      res.render("admin/pages/index",{counts});
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 
};

adminController.gamesOrderedPerYear = async (req, res) => {
  try {
    const startYear = 2019; // Set the start year
    const endYear = 2024; // Set the end year

    const gameCountsPerYear = await Orders.aggregate([
      {
        $match: {
          orderDate: { $gte: new Date(`${startYear}-01-01`), $lte: new Date(`${endYear}-12-31`) },
        },
      },
      {
        $group: {
          _id: { $year: '$orderDate' }, // Grouping by year of orderDate
          count: { $sum: { $size: '$gameItems' } }, // Counting the number of gameItems (games ordered)
        },
      },
    ]);

    const gameCounts = {};
    for (let year = startYear; year <= endYear; year++) {
      gameCounts[year.toString()] = 0;
    }

    gameCountsPerYear.forEach(item => {
      const year = item._id;
      gameCounts[year.toString()] = item.count;
    });
    console.log('games : ',gameCounts)
    res.json({ gameCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





adminController.gamesDownloadedPerMonthInYear = async (req, res) => {
  try {
    const { year } = req.query;
    console.log("Year: ", year);

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const orderDates = await Orders.aggregate([
      {
        $match: {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
          orderStatus: 'Downloaded', // Consider only downloaded orders
        },
      },
      {
        $group: {
          _id: { $month: '$orderDate' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyOrderCounts = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    orderDates.forEach((monthData) => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[monthData._id - 1];

      // Populate the monthly order counts
      monthlyOrderCounts[monthName] = monthData.count;
    });

    console.log("Monthly Order Counts: ", monthlyOrderCounts);
    res.json({ monthlyOrderCounts });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

adminController.mostInstalledGames= async(req,res)=>{
  try {
    const topGames = await Games.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'gameItems.gameId',
          as: 'gameOrders',
        },
      },
      {
        $project: {
          _id:0,
          gameName: 1,
          ordersCount: { $size: '$gameOrders' },
        },
      },
      { $sort: { ordersCount: -1 } },
      { $limit: 5 },
    ]);
    console.log("top : ",topGames)
    res.status(200).json({ topGames });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
}


adminController.revenue= async (req, res) => {
  try {
    const revenueData = await getRevenueData();
    res.status(200).json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function getRevenueData() {
  try {
    const revenuePerDate = await Orders.aggregate([
      {
        $match: {
          orderStatus: 'Downloaded', 
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: { _id: 1 }, 
      },
    ]);

    const dates = revenuePerDate.map((item) => item._id);
    const revenueValues = revenuePerDate.map((item) => item.totalRevenue);

    return { dates, revenueValues };
  } catch (error) {
    console.error('Error getting revenue data:', error);
    throw error;
  }
}


adminController.salesReport=async(req,res)=>{
  try {
    const orders = await Orders.find().populate('gameItems.gameId', 'name price');
    console.log('Or : ',orders)
    // Create a PDF document
    const pdfDoc = new PDFDocument();
    const pdfFileName = 'sales_report.pdf';
    pdfDoc.pipe(res);
    pdfDoc.fontSize(14).text('Sales Report\n\n');

    // Add sales data to PDF
    orders.forEach((order, index) => {
      pdfDoc.text(`Order ${index + 1}:`);
      pdfDoc.text(`Order Date: ${order.orderDate}`);
      pdfDoc.text(`Payment Method: ${order.paymentMethod}`);
      pdfDoc.text('Games Purchased:');
      order.gameItems.forEach((item) => {
        pdfDoc.text(`- ${item.gameId.gameName}: $${item.gameId.price}`);
      });
      pdfDoc.text(`Total Amount: $${order.totalAmount}\n\n`);
    });

    pdfDoc.end();

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales');

    // Add headers to the Excel worksheet
    worksheet.columns = [
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Games Purchased', key: 'gamesPurchased', width: 30 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
    ];

    // Add sales data to Excel worksheet
    orders.forEach((order) => {
      const gamesPurchased = order.gameItems.map((item) => `${item.gameId.name}: $${item.gameId.price}`).join(', ');
      worksheet.addRow({
        orderDate: order.orderDate,
        paymentMethod: order.paymentMethod,
        gamesPurchased,
        totalAmount: order.totalAmount,
      });
    });

    // Set response headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');

    // Generate Excel file and send as downloadable
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

adminController.adminLogout = (req, res) => {
  try {
    req.session.adminLogIn = false;
    res.redirect("/adminLogin");
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
 
};

module.exports = adminController;
