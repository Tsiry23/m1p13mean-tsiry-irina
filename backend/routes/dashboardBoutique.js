const express = require('express');
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const Utilisateur = require('../models/Utilisateur');
const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const DetailVente = require('../models/DetailVente');
const Vente = require('../models/Vente');
const Favoris = require('../models/Favoris');

// ────────────────────────────────────────────────
// Fonctions utilitaires pour les dates
// ────────────────────────────────────────────────

function obtenirPlageDates(query) {
  let debut = query.start_date ? new Date(query.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let fin = query.end_date ? new Date(query.end_date) : new Date();
  fin.setDate(fin.getDate() + 1);;

  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    throw new Error('Dates invalides');
  }

  if (debut > fin) {
    throw new Error('La date de début doit être antérieure à la date de fin');
  }

  return { debut, fin };
}

function obtenirPlagesFixes() {
  const maintenant = new Date();
  return {
    debutAnnee:   new Date(maintenant.getTime() - 365 * 24 * 60 * 60 * 1000),
    debutMois:    new Date(maintenant.getTime() - 30  * 24 * 60 * 60 * 1000),
    debutSemaine: new Date(maintenant.getTime() - 7   * 24 * 60 * 60 * 1000),
    maintenant,
  };
}

// ────────────────────────────────────────────────
// Récupération du contexte de la boutique
// ────────────────────────────────────────────────

async function recupererContexteBoutique(idUtilisateur) {
  const utilisateur = await Utilisateur.findById(idUtilisateur)
    .select('id_boutique')
    .lean();

  if (!utilisateur?.id_boutique) {
    throw new Error('Utilisateur non associé à une boutique');
  }

  const boutique = await Boutique.findById(utilisateur.id_boutique).lean();
  if (!boutique) {
    throw new Error('Boutique non trouvée');
  }

  const produits = await Produit.find({ id_boutique: utilisateur.id_boutique })
    .select('_id nom qt_actuel')
    .lean();

  if (produits.length === 0) {
    return { id_boutique: utilisateur.id_boutique, produits: [], idsProduits: [], vide: true };
  }

  const idsProduits = produits.map(p => p._id);
  const mapProduits = new Map(produits.map(p => [p._id.toString(), p]));

  return { id_boutique: utilisateur.id_boutique, produits, idsProduits, mapProduits, vide: false };
}

// ────────────────────────────────────────────────
// Fonctions d'agrégation réutilisables
// ────────────────────────────────────────────────

async function calculerChiffreAffairesPeriode(idsProduits, debut, fin) {
  const resultat = await DetailVente.aggregate([
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    { $group: { _id: null, ca: { $sum: { $multiply: ['$qt', '$prix_vente'] } } } }
  ]);
  return resultat[0]?.ca || 0;
}

async function compterNombreVentes(idsProduits, debut, fin) {
  const resultat = await DetailVente.aggregate([
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    { $group: { _id: '$id_vente' } },
    { $count: 'count' }
  ]);
  return resultat[0]?.count || 0;
}

async function compterClientsUniques(idsProduits, debut, fin) {
  const aggVentes = await DetailVente.aggregate([
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    { $group: { _id: '$id_vente' } }
  ]);

  if (aggVentes.length === 0) return 0;

  const idsVentes = aggVentes.map(v => v._id);
  const resultat = await Vente.aggregate([
    { $match: { _id: { $in: idsVentes }, id_client: { $exists: true } } },
    { $group: { _id: '$id_client' } },
    { $count: 'count' }
  ]);

  return resultat[0]?.count || 0;
}

async function calculerCAParTypePaiement(idsProduits, debut, fin) {
  return await DetailVente.aggregate([
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    { $group: { _id: '$vente.id_type_paiement', ca: { $sum: { $multiply: ['$qt', '$prix_vente'] } } } },
    { $lookup: { from: 'typepaiements', localField: '_id', foreignField: '_id', as: 'type' } },
    { $unwind: '$type' },
    { $project: { type_paiement: '$type.nom', ca: 1, _id: 0 } }
  ]);
}

async function obtenirProduitsPlusVendus(idsProduits, debut, fin, limite = 10) {
  return await DetailVente.aggregate([
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    { $group: { _id: '$id_produit', quantite_vendue: { $sum: '$qt' }, ca_genere: { $sum: { $multiply: ['$qt', '$prix_vente'] } } } },
    { $sort: { quantite_vendue: -1 } },
    { $limit: limite },
    { $lookup: { from: 'produits', localField: '_id', foreignField: '_id', as: 'produit' } },
    { $unwind: '$produit' },
    { $project: { id_produit: '$_id', nom: '$produit.nom', quantite_vendue: 1, ca_genere: 1, _id: 0 } }
  ]);
}

async function obtenirProduitsMoinsPerformants(id_boutique, debut, fin, limite = 10) {
  return await Produit.aggregate([
    { $match: { id_boutique } },
    {
      $lookup: {
        from: 'detailventes',
        let: { idProd: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$id_produit', '$$idProd'] }, id_vente: { $exists: true } } },
          { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
          { $unwind: '$vente' },
          { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
          { $project: { qt: 1, prix_vente: 1 } }
        ],
        as: 'details'
      }
    },
    {
      $project: {
        nom: 1,
        quantite_vendue: { $reduce: { input: '$details', initialValue: 0, in: { $add: ['$$value', '$$this.qt'] } } },
        ca_genere: { $reduce: { input: '$details', initialValue: 0, in: { $add: ['$$value', { $multiply: ['$$this.qt', '$$this.prix_vente'] }] } } }
      }
    },
    { $sort: { quantite_vendue: 1 } },
    { $limit: limite },
    { $project: { id_produit: '$_id', nom: '$nom', quantite_vendue: 1, ca_genere: 1, _id: 0 } }
  ]);
}

async function obtenirProduitsPlusApprecies(idsProduits, limite = 10) {
  return await Favoris.aggregate([
    { $match: { id_produit: { $in: idsProduits } } },
    { $group: { _id: '$id_produit', nombre_favoris: { $sum: 1 } } },
    { $sort: { nombre_favoris: -1 } },
    { $limit: limite },
    { $lookup: { from: 'produits', localField: '_id', foreignField: '_id', as: 'produit' } },
    { $unwind: '$produit' },
    { $project: { id_produit: '$_id', nom: '$produit.nom', nombre_favoris: 1, _id: 0 } }
  ]);
}

async function obtenirEvolutionVentes(idsProduits, debut, fin, formatDate, inclurePanierMoyen = true) {
  const pipelineBase = [
    { $match: { id_produit: { $in: idsProduits }, id_vente: { $exists: true } } },
    { $lookup: { from: 'ventes', localField: 'id_vente', foreignField: '_id', as: 'vente' } },
    { $unwind: '$vente' },
    { $match: { 'vente.date': { $gte: debut, $lte: fin } } },
    {
      $group: {
        _id: { $dateToString: { format: formatDate, date: '$vente.date' } },
        ca: { $sum: { $multiply: ['$qt', '$prix_vente'] } },
        ventes: { $addToSet: '$id_vente' }
      }
    }
  ];

  if (!inclurePanierMoyen) {
    pipelineBase.push({ $project: { periode: '$_id', ca: 1, _id: 0 } });
  } else {
    pipelineBase.push(
      { $addFields: { nombre_ventes: { $size: '$ventes' } } },
      {
        $project: {
          periode: '$_id',
          ca: 1,
          nombre_ventes: 1,
          panier_moyen: { $cond: [{ $gt: ['$nombre_ventes', 0] }, { $divide: ['$ca', '$nombre_ventes'] }, 0] },
          _id: 0
        }
      }
    );
  }

  pipelineBase.push({ $sort: { periode: 1 } });

  return await DetailVente.aggregate(pipelineBase);
}

function obtenirProduitsStockFaible(produits, seuil = 10) {
  return produits
    .filter(p => p.qt_actuel < seuil)
    .map(p => ({ id_produit: p._id, nom: p.nom, qt_actuel: p.qt_actuel }))
    .sort((a, b) => a.qt_actuel - b.qt_actuel);
}

// ────────────────────────────────────────────────
// Route principale
// ────────────────────────────────────────────────

router.get('/', authMiddleware, async (req, res) => {
  try {
    let { debut, fin } = obtenirPlageDates(req.query);
    const { debutAnnee, debutMois, debutSemaine, maintenant } = obtenirPlagesFixes();

    const contexte = await recupererContexteBoutique(req.user.id);

    if (contexte.vide) {
      return res.json({
        ca_periode: 0,
        panier_moyen_periode: 0,
        evolution_ventes_annee: [],
        evolution_ventes_mois: [],
        evolution_ventes_semaine: [],
        produits_plus_vendus: [],
        produits_moins_performants: [],
        produits_plus_apprecies: [],
        ca_par_type_paiement: [],
        nombre_ventes_periode: 0,
        clients_uniques_periode: 0,
        produits_stock_faible: []
      });
    }

    const { idsProduits, produits, id_boutique } = contexte;

    const [
      ca_periode,
      nombre_ventes_periode,
      clients_uniques_periode,
      ca_par_type_paiement,
      produits_plus_vendus,
      produits_moins_performants,
      produits_plus_apprecies,
      evolution_ventes_annee,
      evolution_ventes_mois,
      evolution_ventes_semaine
    ] = await Promise.all([
      calculerChiffreAffairesPeriode(idsProduits, debut, fin),
      compterNombreVentes(idsProduits, debut, fin),
      compterClientsUniques(idsProduits, debut, fin),
      calculerCAParTypePaiement(idsProduits, debut, fin),
      obtenirProduitsPlusVendus(idsProduits, debut, fin),
      obtenirProduitsMoinsPerformants(id_boutique, debut, fin),
      obtenirProduitsPlusApprecies(idsProduits),
      obtenirEvolutionVentes(idsProduits, debutAnnee, maintenant, '%Y-%m'),
      obtenirEvolutionVentes(idsProduits, debutMois, maintenant, '%Y-%m-%d'),
      obtenirEvolutionVentes(idsProduits, debutSemaine, maintenant, '%Y-%m-%d')
    ]);

    const panier_moyen_periode = nombre_ventes_periode > 0 ? ca_periode / nombre_ventes_periode : 0;
    const produits_stock_faible = obtenirProduitsStockFaible(produits);

    res.json({
      ca_periode,
      panier_moyen_periode,
      nombre_ventes_periode,
      clients_uniques_periode,
      ca_par_type_paiement,
      produits_plus_vendus,
      produits_moins_performants,
      produits_plus_apprecies,
      evolution_ventes_annee,
      evolution_ventes_mois,
      evolution_ventes_semaine,
      produits_stock_faible
    });

  } catch (erreur) {
    console.error('Erreur dashboard :', erreur);
    const statut = erreur.message.includes('invalides') || erreur.message.includes('antérieure') ? 400 : 500;
    const message = statut === 500 ? 'Erreur serveur' : erreur.message;
    res.status(statut).json({ message });
  }
});

module.exports = router;