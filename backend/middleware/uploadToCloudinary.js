const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // ton fichier config existant
const streamifier = require('streamifier');

// Multer en mémoire (pas de disque !)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max – ajuste si besoin
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const extOk = allowed.test(file.originalname.toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Images uniquement (jpg, jpeg, png, webp, gif)'));
    }
  },
});

// Middleware qui fait l'upload stream vers Cloudinary
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(); // Pas d'image → on continue (produit sans image)
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const publicId = `produits/${req.user?.id || 'anonymous'}/${uniqueSuffix}`;

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'mon-app/produits', // ou 'produits' simplement
      public_id: publicId,
      resource_type: 'image',
      // Optionnel : transformations auto (compression, format auto)
      // transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      // overwrite: true,
    },
    (error, result) => {
      if (error) {
        console.error('Erreur Cloudinary upload:', error);
        return res.status(500).json({
          message: 'Erreur lors de l\'upload de l\'image sur Cloudinary',
          error: error.message,
        });
      }

      // Stocke les infos dans req pour la suite
      req.cloudinary = {
        url: result.secure_url,
        public_id: result.public_id,
        // tu peux ajouter width, height, format si besoin
      };

      next();
    }
  );

  // Pipe le buffer du fichier vers le stream Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

module.exports = { upload, uploadToCloudinary };