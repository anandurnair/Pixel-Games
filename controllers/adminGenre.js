const Genres = require("../Models/genre");

const adminGenre = {};

adminGenre.genreList = async (req, res) => {
  if (req.session.adminLogIn) {
    const genres = await Genres.find();
    res.render("admin/pages/genreList", { genres, message: "" });
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
    const genres = await Genres.find({
      genreName: new RegExp("^" + genreName, "i"),
    });

    if (req.session.adminLogIn) {
      if (genres.length > 0) {
        res.render("admin/pages/genreList", { genres, message: "", err: "" });
      } else {
        res.render("admin/pages/genreList", {
          genres,
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