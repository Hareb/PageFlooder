# 🌊 DOM Flood - Extension Navigateur

**Inonde N'IMPORTE QUEL site web !** Une extension Chrome/Firefox qui transforme chaque page en aquarium interactif.

## 🎮 Concept

Va sur n'importe quel site (YouTube, Twitter, Reddit, etc.), active l'extension, et regarde la page se transformer en chaos aquatique !

Les éléments réagissent selon leur **densité** :
- 📹 **Vidéos & iframes** → Très lourdes, coulent en premier
- 📷 **Images** → Lourdes, coulent rapidement
- 🔘 **Boutons & formulaires** → Densité moyenne, flottent un peu
- 📝 **Textes & titres** → Légers, flottent facilement

## 🚀 Installation

### Chrome / Edge / Brave

1. Télécharge ou clone ce repo
2. Ouvre Chrome et va dans `chrome://extensions/`
3. Active le **Mode développeur** (coin supérieur droit)
4. Clique sur **Charger l'extension non empaquetée**
5. Sélectionne le dossier `PageFlooder`

### Firefox

1. Télécharge ou clone ce repo
2. Ouvre Firefox et va dans `about:debugging#/runtime/this-firefox`
3. Clique sur **Charger un module complémentaire temporaire**
4. Sélectionne le fichier `manifest.json` dans le dossier `PageFlooder`

### Générer les icônes (optionnel)

1. Ouvre `icons/generate-icons.html` dans ton navigateur
2. Télécharge les 3 icônes générées (16x16, 48x48, 128x128)
3. Place-les dans le dossier `icons/` avec les noms `icon16.png`, `icon48.png`, `icon128.png`

## 🕹️ Comment utiliser

1. **Active l'extension** : Clique sur l'icône 🌊 dans la barre d'outils
2. **Clique sur "Activer l'inondation"**
3. Un panneau de contrôle apparaît en haut à droite de la page
4. **Utilise le slider** pour contrôler le niveau d'eau (0-100%)
5. **Regarde le chaos** : Les éléments flottent et coulent en temps réel !

### 🎭 Deux Modes de Jeu

**🌊 Mode Chaos** (défaut)
- Physique réaliste basée sur la densité
- Les éléments lourds coulent, les légers flottent
- Effet de balancement (wobble) pour les éléments flottants
- Submersion progressive

**🧘 Mode Zen**
- Animation douce et harmonieuse
- Tous les éléments flottent doucement
- Mouvement sinusoïdal apaisant
- Parfait pour relaxer

## 🎨 Effets Visuels

- 🌊 **Eau animée** avec vagues et reflets
- 🎈 **Flottaison réaliste** avec effet de balancement
- 💧 **Submersion progressive** avec blur et transparence
- ⚛️ **Physique en temps réel** - 50ms de mise à jour
- 📊 **Stats en direct** (éléments détectés, éléments flottants)

## 🛠️ Structure du Projet

```
PageFlooder/
├── manifest.json           # Configuration de l'extension
├── popup.html             # Interface de la popup
├── popup.js               # Logique de la popup
├── content.js             # Script injecté (moteur de jeu)
├── content.css            # Styles injectés (eau + UI)
├── icons/
│   ├── icon.svg           # Icône source
│   ├── generate-icons.html # Générateur d'icônes
│   ├── icon16.png         # Icône 16x16
│   ├── icon48.png         # Icône 48x48
│   └── icon128.png        # Icône 128x128
└── README.md              # Ce fichier
```

## 🧠 Détection Intelligente des Éléments

L'extension analyse automatiquement le DOM de n'importe quelle page et assigne une densité à chaque élément basée sur :

### Very Heavy (coule à 30% d'eau)
- `<video>`, `<iframe>`, `<object>`, `<embed>`
- Classes contenant : "video", "player", "embed"

### Heavy (coule à 45% d'eau)
- `<img>`, `<picture>`, `<canvas>`, `<svg>`, `<footer>`
- Classes contenant : "image", "photo", "banner", "ad"

### Medium (flotte jusqu'à 60% d'eau)
- `<button>`, `<input>`, `<form>`, `<nav>`, `<section>`, `<div>`
- Classes contenant : "card", "box", "container", "widget"

### Light (flotte jusqu'à 75% d'eau)
- `<h1>` à `<h6>`, `<p>`, `<span>`, `<a>`, `<li>`, `<header>`
- Classes contenant : "text", "title", "heading", "label"

## 🎯 Exemples de Sites à Inonder

**Sites recommandés :**
- 🎬 **YouTube** - Regarde les vidéos couler !
- 🐦 **Twitter/X** - Les tweets flottent comme des bulles
- 📘 **Facebook** - Les posts deviennent des bateaux
- 🎮 **Reddit** - Les threads nagent
- 📰 **Sites d'actualités** - Les articles dérivent
- 🛒 **Sites e-commerce** - Les produits coulent ou flottent

**Particulièrement satisfaisant sur :**
- Pages avec beaucoup d'images (Instagram, Pinterest)
- Sites avec beaucoup de texte (Wikipedia, blogs)
- Dashboards et applications web (Gmail, Notion)

## 🔧 Configuration Technique

### Densités et Physique

```javascript
densityConfig = {
    'very-heavy': {
        sinkSpeed: 4,           // Vitesse de noyade
        floatThreshold: 30,     // % d'eau avant de couler
        buoyancy: -40           // Force de flottaison (négative = coule)
    },
    'heavy': { sinkSpeed: 3, floatThreshold: 45, buoyancy: -20 },
    'medium': { sinkSpeed: 1, floatThreshold: 60, buoyancy: 5 },
    'light': { sinkSpeed: -1, floatThreshold: 75, buoyancy: 25 }
};
```

### Z-Index

- **Eau** : `2147483646` (juste en dessous de l'UI)
- **UI de contrôle** : `2147483647` (maximum possible)
- Garantit que l'extension fonctionne sur tous les sites

## 🐛 Dépannage

**L'extension ne s'affiche pas ?**
- Vérifie que tu as bien activé le mode développeur
- Recharge l'extension dans `chrome://extensions/`
- Rafraîchis la page web

**Les éléments ne bougent pas ?**
- Certains sites utilisent `position: fixed` qui résiste à l'eau
- Augmente le niveau d'eau à 50%+ pour voir l'effet
- Essaie le Mode Zen pour une animation plus universelle

**L'extension ralentit la page ?**
- Normal sur les pages avec beaucoup d'éléments (>1000)
- Désactive l'extension quand tu ne l'utilises pas
- Le moteur physique tourne à 20 FPS pour économiser les ressources

## 🚀 Améliorations Futures

- [ ] Power-ups (tsunami, évaporation, ancre, bouée)
- [ ] Mode "Vague" - créer des ondulations en cliquant
- [ ] Persistance des paramètres par site
- [ ] Raccourcis clavier (Espace = monte l'eau, Ctrl+Espace = descend)
- [ ] Mode "Aquarium" - les éléments nagent
- [ ] Sons d'eau ASMR (optionnel)
- [ ] Partage de screenshots/vidéos
- [ ] Thèmes (lave, espace, slime)
- [ ] Mode "Pluie" - gouttes qui tombent

## 💡 Inspiration

Transforme n'importe quel site web en terrain de jeu aquatique. Visualise la structure du DOM de façon poétique et chaotique. Parfait pour :
- Se détendre
- Comprendre la structure des sites
- Troller tes amis (partage ton écran)
- Faire des screenshots artistiques

## 📝 Licence

Open source - Fais-en ce que tu veux !

---

**Développé avec ❤️ et beaucoup d'eau 🌊**

*Noie tes problèmes, pas tes sites web !*
