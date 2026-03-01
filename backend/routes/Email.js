const mongoose = require("mongoose");
const express = require('express');
const nodemailer = require('nodemailer');
const Produit = require('../models/Produit');      // adapte le chemin selon ta structure
const Favoris = require('../models/Favoris');
const Utilisateur = require('../models/Utilisateur');
const Boutique = require('../models/Boutique');
const router = express.Router();
require('dotenv').config();


const URL_HOST_BACK = process.env.URL_HOST_BACK;
const URL_HOST_FRONT = process.env.URL_HOST_FRONT;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,               // ← important : false pour 587
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  },
  family: 4,                   // toujours forcer IPv4 si besoin
  auth: {
    user: 'nyavorakotonirina5@gmail.com',
    pass: 'tbxt soxq hqwd mtjb'
  }
});

// Vérification de la connexion (optionnel – utile en développement)
transporter.verify((error, success) => {
  if (error) {
    console.error('Erreur de configuration SMTP :', error);
  } else {
    console.log('Serveur SMTP prêt → Gmail OK');
  }
});

/**
 * POST /api/email/send
 * Body attendu :
 * {
 *   "to": "destinataire@example.com",
 *   "subject": "Inscription M1P13",
 *   "text": "Version texte simple (optionnel)",
 *   "html": "<p>Contenu HTML ici</p>"   ← ou on utilise le template par défaut
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Adresse email destinataire manquante' });
    }

    const mailOptions = {
      from: {
        name: 'M1P13 – MEAN Tsiry Irina',
        address: 'nyavorakotonirina5@gmail.com'
      },
      to,
      subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur envoi email :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l’envoi de l’email',
      details: error.message
    });
  }
});


router.post('/notify-arrivage', async (req, res) => {
  try {
    const { produitId } = req.body;
    console.log("let's notify" + produitId + " ok")

    if (!produitId || !mongoose.isValidObjectId(produitId)) {
      return res.status(400).json({
        success: false,
        error: 'ID produit invalide ou manquant'
      });
    }

    // 1. Récupérer le produit + sa boutique
    const produit = await Produit.findById(produitId)
      .populate({
        path: 'id_boutique',
        select: 'nom image'  // on veut le nom et l'image de la boutique si besoin
      });

    if (!produit) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      });
    }

    // 2. Trouver tous les favoris pour ce produit
    const favoris = await Favoris.find({ id_produit: produitId })
      .populate({
        path: 'id_utilisateur',
        select: 'nom prenom email'  // on n'a besoin que de ça
      });

    if (favoris.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun utilisateur n’a ce produit en favoris → aucun email envoyé',
        count: 0
      });
    }

    // 3. Préparer les emails (on envoie un par un pour personnalisation et traçabilité)
    const emailsEnvoyes = [];
    const erreurs = [];

    for (const fav of favoris) {
      const user = fav.id_utilisateur;

      if (!user || !user.email) continue; // sécurité

      const prenom = user.prenom || 'Client';
      
      // Contenu HTML personnalisé
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Arrivage – ${produit.nom}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">Bonne nouvelle, ${prenom} !</h2>
            
            <p style="font-size: 1.1em;">
            La boutique <strong>${produit.id_boutique?.nom || 'votre boutique préférée'}</strong><br>
            vient de recevoir <strong>${produit.qt_actuel} unités</strong> du produit que vous aimez :
            </p>

            <h3 style="color: #e74c3c; margin: 20px 0 10px;">${produit.nom}</h3>
            
            ${produit.image ? `
            <img src="${ produit.image}" alt="${produit.nom}" 
                style="max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            ` : '<p style="color: #777;">[Image du produit non disponible]</p>'}

            <p style="font-size: 1.1em; margin: 20px 0;">
            Prix actuel : <strong>${produit.prix_actuel.toLocaleString('fr-MG')} Ar</strong><br>
            ${produit.description ? `<em>${produit.description.substring(0, 120)}${produit.description.length > 120 ? '...' : ''}</em>` : ''}
            </p>

            <a href="${URL_HOST_FRONT + "/produits" }" 
            style="display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            Voir le produit et venir en boutique →
            </a>

            <p style="font-size: 0.9em; color: #777; margin-top: 30px;">
            Cet email vous a été envoyé car vous avez ajouté ce produit à vos favoris.<br>
            M1P13 – MEAN Tsiry Irina
            </p>
        </div>
        </body>
        </html>
            `;

      const mailOptions = {
        from: {
          name: 'M1P13 – MEAN Tsiry Irina',
          address: 'nyavorakotonirina5@gmail.com'
        },
        to: user.email,
        subject: `Arrivage ! ${produit.nom} est de retour en stock`,
        html: htmlContent,
        // text fallback (optionnel)
        text: `Bonjour ${prenom},\n\nLa boutique ${produit.id_boutique?.nom || ''} vient de recevoir ${produit.qt_actuel} ${produit.nom}. Venez vite !\nPrix : ${produit.prix_actuel} Ar\n\nÀ bientôt !`
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        emailsEnvoyes.push({
          email: user.email,
          messageId: info.messageId
        });
      } catch (err) {
        erreurs.push({
          email: user.email,
          error: err.message
        });
        console.error(`Erreur envoi à ${user.email} :`, err);
      }
    }

    const rep = {
      success: true,
      message: `Notification arrivage traitée`,
      countTotalFavoris: favoris.length,
      countEnvoyes: emailsEnvoyes.length,
      envoyes: emailsEnvoyes,
      erreurs: erreurs.length > 0 ? erreurs : undefined
    };
    res.status(200).json(rep);

  } catch (error) {
    console.error('Erreur globale notify-arrivage :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la notification arrivage',
      details: error.message
    });
  }
});

module.exports = router;