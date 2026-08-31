# Prompts — modifier les données & le design de Hack Tank

Copie-colle un bloc ci-dessous dans le chat pour demander la modification.
Chaque prompt cible un fichier précis du projet.

---

## 1. Données de l'événement

### Infos générales (nom, dates, lieu, compte à rebours)
```
Dans src/data.ts, mets à jour l'objet EVENT avec les vraies infos :
- name, org, tagline
- location = "<ville, pays réels>"
- dates = "<dates réelles>"
- startsAt = "<date ISO réelle, ex: 2025-06-14T09:00:00>" (utilisé par le compte à rebours)
```

### Statistiques
```
Dans src/data.ts, remplace le tableau STATS par nos vrais chiffres
(participants, tracks, montant des prix, nombre de sharks). Garde le format { value, label }.
```

---

## 2. Tracks, prix, timeline

### Tracks
```
Dans src/data.ts, remplace le tableau TRACKS par nos vrais thèmes.
Pour chaque track : id (slug), icon (1 caractère/symbole), name, pitch (1 phrase),
color (hex). Garde exactement 6 tracks pour l'alignement de la grille.
```

### Prix
```
Dans src/data.ts, mets à jour PRIZES avec les vrais montants et avantages.
Pour chaque prix : rank, tier, amount, unit, glyph, className (garde prize-gold/silver/bronze),
et perks = liste des avantages réels.
```

### Timeline
```
Dans src/data.ts, remplace TIMELINE par le vrai déroulé.
Chaque étape : phase ("01".."06"), title, date, detail (1 phrase).
```

---

## 3. Personnes et contenu

### Sharks (jury / mentors) — vraies personnes
```
Dans src/data.ts, remplace SHARKS par les vrais membres du panel.
Pour chacun : name, role, company, expertise, initials (2 lettres),
color (hex), linkedin (URL réelle). Ajoute autant de personnes que nécessaire.
```

### Idées du mur d'idées
```
Dans src/data.ts, remplace IDEAS par de vraies idées de projets.
Chaque idée : title, track (doit correspondre à un name de TRACKS), author, blurb, seeking.
```

### FAQ et contact
```
Dans src/data.ts, mets à jour FAQS avec nos vraies questions/réponses.
Puis dans src/components/Footer.tsx et src/pages/Faq.tsx, remplace
l'email hello@hacktank.tn, le téléphone +216 00 000 000 et les liens réseaux
par nos vraies coordonnées.
```

---

## 4. Design et couleurs

### Palette globale
```
Dans src/styles.css, modifie les variables :root pour appliquer notre palette :
--blue, --gold, --navy, --cream. Garde un bon contraste (texte clair sur fond foncé).
Ne change pas les noms des variables, seulement les valeurs hex.
```

### Ambiance claire au lieu de sombre
```
Dans src/styles.css, passe le hero et les sections sombres (.hero, .sharks, .ideas,
.footer, .page-dark) vers un thème plus clair, tout en gardant l'or comme accent.
Vérifie la lisibilité du texte après le changement.
```

### Typographie
```
Dans src/styles.css, remplace les polices Syne et DM Mono par <polices choisies>.
Mets à jour l'@import Google Fonts en haut du fichier et les font-family
dans :root et les sélecteurs qui utilisent 'DM Mono'.
```

### Logo / marque
```
Dans src/components/Brand.tsx, remplace le monogramme "HT" et le texte "HACK TANK"
par notre logo (image dans src/assets/ importée) ou notre vrai nom.
```
