const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  imagePath: String,
});

const Wallpaper = mongoose.model('Wallpaper', wallpaperSchema);

module.exports = Wallpaper;
