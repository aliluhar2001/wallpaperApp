const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const Wallpaper = require('./models/Wallpaper');  // Our MongoDB model for wallpapers

const app = express();
const port = process.env.PORT || 5000;




// Sync wallpapers in uploads folder to MongoDB
const syncUploadsToDatabase = async () => {
  try {
    const uploadFolder = path.join(__dirname, 'uploads');

    // Read all files in the uploads folder
    const files = fs.readdirSync(uploadFolder);

    for (const file of files) {
      const filePath = `/uploads/${file}`;

      // Check if the file is already in the database
      const existingWallpaper = await Wallpaper.findOne({ imagePath: filePath });

      if (!existingWallpaper) {
        // Add the file to the database if it doesn't exist
        const newWallpaper = new Wallpaper({ imagePath: filePath });
        await newWallpaper.save();
        console.log(`Added ${filePath} to the database.`);
      }
    }
  } catch (error) {
    console.error('Error syncing uploads to database:', error);
  }
};

// Call the sync function when the server starts
syncUploadsToDatabase();


// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://aliluhar:Luhar123@cluster0.gji0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 50000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Set destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use unique filename
  },
});

const upload = multer({ storage });

// Wallpaper model for MongoDB (Model should be in models/Wallpaper.js)


// Route for uploading wallpapers
app.post('/upload', upload.single('wallpaper'), async (req, res) => {
  const { file } = req;
  const wallpaper = new Wallpaper({
    imagePath: `/uploads/${file.filename}`,  // Store the relative path
  });

  try {
    await wallpaper.save();
    res.status(200).json({ message: 'Wallpaper uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading wallpaper.' });
  }
});

// Route to fetch wallpapers from MongoDB
app.get('/wallpapers', async (req, res) => {
  try {
    const wallpapers = await Wallpaper.find();
    res.json(wallpapers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallpapers.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
