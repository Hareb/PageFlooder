# 🌊 DOM Flood - Contrôle le Chaos

Un jeu interactif où tu contrôles le niveau d'eau pour inonder une page web et accomplir des objectifs précis.

## 🎮 Concept

L'eau monte progressivement et les éléments de la page réagissent selon leur **densité** :
- 📷 **Images & vidéos** → Très lourdes, coulent rapidement
- 🔘 **Boutons & cartes** → Densité moyenne, flottent un peu
- 📝 **Textes** → Légers, flottent facilement

## 🕹️ Comment jouer

1. Ouvre `index.html` dans ton navigateur
2. Utilise le **slider** pour contrôler le niveau d'eau (0-100%)
3. Accomplis l'objectif de chaque niveau
4. La ligne rouge indique la zone cible (quand applicable)

## 🎯 Les 5 Niveaux

### Niveau 1 : Sauve le Logo
Fais flotter le logo au-dessus de la ligne rouge sans le noyer.

### Niveau 2 : Submerge les Publicités
Noie toutes les publicités (cartes dorées) sous l'eau.

### Niveau 3 : Équilibre Parfait
Fais flotter le header SANS noyer le hero. Un défi de précision !

### Niveau 4 : Tri Sélectif
Noie les images lourdes tout en gardant les textes à flot.

### Niveau 5 : Chaos Contrôlé
Maintiens exactement 50% du site sous l'eau (tolérance ±2%).

## 🎨 Effets Visuels

- **Eau animée** avec vagues et reflets
- **Flottaison réaliste** avec effet de balancement (wobble)
- **Submersion progressive** avec blur et transparence
- **Physique basée sur la densité** - chaque élément réagit différemment

## 🏆 Système de Score

- **+50 points** par objectif complété
- **+100 points** par niveau terminé
- **Bonus temps** : Plus tu es rapide, plus tu gagnes de points

## 🛠️ Structure du Projet

```
PageFlooder/
├── index.html    # Page du jeu avec site de démo
├── style.css     # Styles + animations d'eau
├── script.js     # Moteur de physique et logique de jeu
└── README.md     # Ce fichier
```

## 🔧 Densités des Éléments

Les éléments HTML ont un attribut `data-density` :

- `very-heavy` : Vidéos (coule à 40% d'eau)
- `heavy` : Images, footer (coule à 50% d'eau)
- `medium` : Boutons, cartes (flotte jusqu'à 60%)
- `light` : Textes, liens (flotte jusqu'à 70%)

## 🚀 Prochaines Améliorations Possibles

- Mode bac à sable (joue librement sans objectif)
- Inonder n'importe quel site web (bookmarklet)
- Power-ups (tsunami, évaporation, ancre)
- Niveaux personnalisés
- Leaderboard en ligne
- Sons d'eau ASMR
- Mode multijoueur (course contre la montre)

## 💡 Inspiration

Ce jeu visualise la structure du DOM de façon poétique et chaotique. Chaque site web devient un aquarium interactif où la physique rencontre le design web.

---

**Développé avec ❤️ et beaucoup d'eau 🌊**
