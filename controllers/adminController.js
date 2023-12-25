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
const fs = require('fs')
const Excel = require('exceljs');


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

const moment = require('moment'); // If you're not already using it, install the 'moment' library: npm install moment

adminController.revenue= async (req, res) => {
  try {
    const revenueData = await getRevenueData();
    console.log(revenueData)
    res.status(200).json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
async function getRevenueData() {
  try {
    const today = moment(); 
const sevenDaysAgo = moment().subtract(7, 'days'); 
    const revenuePerDate = await Orders.aggregate([
      {
        $match: {
          orderStatus: 'Downloaded',
          orderDate: { $gte: new Date(sevenDaysAgo), $lte: new Date(today) }, 
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
    console.log("dates ",dates)
    console.log("revenues : ",revenueValues)
    return { dates, revenueValues };
  } catch (error) {
    console.error('Error getting revenue data for the last 7 days:', error);
    throw error;
  }
}


adminController.PDFReport=async  (req,res)=>{
  try {
    const salesData = await Orders.find({
      orderDate: {
        $gte: new Date('2023-01-01'),
        $lte: new Date('2023-12-31'),
      },
    }).populate('userId').populate('gameItems.gameId')

    const doc = new PDFDocument();
    const fileName = 'sales_report_2023.pdf';
    const stream = doc.pipe(fs.createWriteStream(fileName));

    doc.fontSize(18).text('Sales Report for 2023', { align: 'center' });

    salesData.forEach((order, index) => {
      let gameCounter = 1
      doc.moveDown().fontSize(12).text(`Order ${index + 1}`);
      doc.text(`Order ID: ${order._id}`);
      doc.text(`costumer : ${order.userId.fullName}`)
      order.gameItems.forEach(game=>{
        doc.text(`Game ${gameCounter}: ${game.gameId.gameName}`)
        gameCounter++
      })
      doc.text(`Total Amount: ${order.totalAmount}`);
      doc.text(`Order date : ${order.orderDate.toDateString()}`)
      // Add more order details as needed
    });

    doc.end();
    stream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.download(fileName, (err) => {
        if (err) {
          console.error('Error sending PDF:', err);
        }
        fs.unlinkSync(fileName); // Remove the generated file after download
      });
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

adminController.ExcelReport = async (req, res) => {
  try {
    const salesData = await Orders.find({
      orderDate: {
        $gte: new Date('2023-01-01'),
        $lte: new Date('2023-12-31'),
      },
    }).populate('userId').populate('gameItems.gameId');

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.addRow(['Order Number', 'Order ID', 'Customer', 'Game Name', 'Total Amount', 'Order Date']);

    salesData.forEach((order, index) => {
      order.gameItems.forEach((game) => {
        worksheet.addRow([
          index + 1,
          order._id.toString(),
          order.userId.fullName,
          game.gameId.gameName,
          order.totalAmount,
          order.orderDate.toDateString(),
        ]);
      });
    });

    const fileName = 'sales_report_2023.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    workbook.xlsx.write(res)
      .then(() => {
        res.end();
      })
      .catch((error) => {
        console.error('Error sending Excel:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
