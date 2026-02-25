[README.md](https://github.com/user-attachments/files/25552849/README.md)
# François Dalbavie — Portfolio

Site portfolio minimaliste, esthétique cinématographique.  
Vanilla HTML / CSS / JS — zéro dépendance, prêt pour **GitHub Pages**.

---

## Structure

```
dalbavie/
├── index.html        # Structure HTML, sections, contenu
├── css/
│   └── style.css     # Tous les styles (variables, layout, animations)
├── js/
│   └── main.js       # Curseur custom, scroll reveal, nav active
└── README.md
```

---

## Mise en ligne sur GitHub Pages

```bash
# 1. Créer un dépôt GitHub nommé exactement :
#    votre-username.github.io
#    (ex : francois-dalbavie.github.io)

# 2. Cloner et copier les fichiers
git clone https://github.com/votre-username/votre-username.github.io
cp -r dalbavie/* votre-username.github.io/

# 3. Push
cd votre-username.github.io
git add .
git commit -m "init: portfolio François Dalbavie"
git push origin main
```

Le site sera accessible à l'adresse :  
`https://votre-username.github.io`

---

## Photos Google Drive

Les images sont servies via l'API thumbnail de Google Drive :

```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w800
```

**Prérequis :** chaque fichier image doit être partagé en accès public  
(*"Tout le monde disposant du lien peut afficher"*) dans Google Drive.

Pour remplacer une image, modifiez uniquement l'attribut `id=` dans `index.html`.

---

## Personnalisation rapide

| Ce que vous voulez changer | Où |
|---|---|
| Couleurs | `css/style.css` → section `:root` |
| Taille des titres | `css/style.css` → `.hero__title`, `.section__title` |
| Ajouter une vidéo | `index.html` → copier un bloc `<article class="video-card">` |
| Ajouter une photo | `index.html` → copier un bloc `<figure class="photo-card">` |
| Email de contact | `index.html` → balise `<a class="contact__link" href="mailto:...">` |

---

## Compatibilité

- Chrome, Firefox, Safari, Edge (versions modernes)
- Responsive mobile
- `loading="lazy"` sur toutes les iframes et images
- Aucun framework, aucun build tool requis
