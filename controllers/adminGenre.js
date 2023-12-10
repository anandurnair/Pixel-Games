const Genres = require("../Models/genre");

const adminGenre = {};

adminGenre.genreList = async (req, res) => {
  if (req.session.adminLogIn) {
    let currentPage = parseInt(req.query.page) || 1;
    const perPage = 8;
    if (currentPage < 1) {
      currentPage = 1; // Reset to 1 if currentPage is less than 1
    }

    const skipValue = (currentPage - 1) * perPage;

    const totalGenres = await Genres.countDocuments();
    const totalPages = Math.ceil(totalGenres / perPage);


    const genres = await Genres.find()
    .skip(skipValue)
    .limit(perPage);
    
    res.render("admin/pages/genreList", { genres,currentPage, totalPages, message: "" });
  } else {
    res.redirect("/adminLogin");
  }
};

adminGenre.unlistGenre = async (req, res) => {
  try {
    const genre = await Genres.findById(req.params.id);
    genre.unlistGenre = true; // Assuming you have a 'unlist' property in your Games model
    await genre.save();
    res.redirect("/genreList"); // Redirect back to the game list page or another suitable page
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGenre.listGenre = async (req, res) => {
  try {
    const genre = await Genres.findById(req.params.id);
    genre.unlistGenre = false; // Assuming you have a 'unlist' property in your Games model
    await genre.save();
    res.redirect("/genreList"); // Redirect back to the game list page or another suitable page
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGenre.searchGenre = async (req, res) => {
  const { genreName } = req.query;
  try {
    let currentPage = parseInt(req.query.page) || 1;
    const perPage = 8;
    if (currentPage < 1) {
      currentPage = 1; // Reset to 1 if currentPage is less than 1
    }

    const skipValue = (currentPage - 1) * perPage;

    const totalGenres = await Genres.countDocuments();
    const totalPages = Math.ceil(totalGenres / perPage);
    const genres = await Genres.find({
      genreName: new RegExp("^" + genreName, "i"),
    }).skip(skipValue)
    .limit(perPage);

    if (req.session.adminLogIn) {
      if (genres.length > 0) {
        res.render("admin/pages/genreList", { genres,currentPage, totalPages, message: "", err: "" });
      } else {
        res.render("admin/pages/genreList", {
          genres,currentPage, totalPages,   
          message: "No users found with that genre name",
          err: "",
        });
      }
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.error("Error searching for genre:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGenre.insertGenre = async (req, res) => {
  if (req.session.adminLogIn) {
    res.render("admin/pages/insertGenre", { message1: "" });
  } else {
    res.redirect("/adminLogin");
  }
};

adminGenre.insertGenreData = async (req, res) => {
  try {
    const { genreName } = req.body;
    const genre = await Genres.findOne({ genreName });
    const newGenre = new Genres({
      genreName,
    });

    if (!genre) {
      const savedGenre = await newGenre.save();
      res.redirect("/genreList");
    } else {
      res.render("admin/pages/insertGenre", {
        message1: "Genre is already exists",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

adminGenre.editGenre = async (req, res) => {
  if (req.session.adminLogIn) {
    try {
      const genre = await Genres.findById(req.params.id);
      res.render("admin/pages/editGenre", { genre, message1: "" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.redirect("/adminLogin");
  }
};

adminGenre.editGenreData = async (req, res) => {
  try {
    const { genreName } = req.body;
    const genre = await Genres.findOne({ _id: req.params.id });
    const genres = await Genres.findOne({ genreName });
    if (!genres) {
      await Genres.findByIdAndUpdate(req.params.id, req.body);
      res.redirect("/genreList");
    } else {
      res.render("admin/pages/editGenre", {
        genre,
        message1: "Genre is already exists",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = adminGenre;
