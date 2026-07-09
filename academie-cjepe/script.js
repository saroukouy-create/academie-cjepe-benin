/* ======================================================================
   ACADEMIE CJEPE-BENIN — moteur d'application
   ====================================================================== */

/* ---------- Données de recherche/quiz remplies plus bas ---------- */
const TRACKS = [];

/* ---------- Utilitaires ---------- */
function esc(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function mdlite(s){
  // gras **x** et code `x` dans le texte courant
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/`([^`]+?)`/g,'<code>$1</code>');
  return s;
}
function p(text){ return '<p>'+mdlite(text)+'</p>'; }
function h3(text){ return '<h3>'+esc(text)+'</h3>'; }
function h4(text){ return '<h4>'+esc(text)+'</h4>'; }
function ul(items,ordered){
  const tag = ordered?'ol':'ul';
  return '<'+tag+'>'+items.map(i=>'<li>'+mdlite(i)+'</li>').join('')+'</'+tag+'>';
}
function callout(kind,title,text){
  const icons={analogie:'💡',cle:'★',attention:'⚠',astuce:'✓'};
  const body = Array.isArray(text)?text.map(t=>'<p>'+mdlite(t)+'</p>').join(''):'<p>'+mdlite(text)+'</p>';
  return '<div class="callout callout-'+kind+'"><span class="cicon">'+icons[kind]+'</span><div><p class="callout-title">'+esc(title)+'</p>'+body+'</div></div>';
}
function table(head,rows){
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+head.map(hh=>'<th>'+mdlite(hh)+'</th>').join('')+
    '</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+mdlite(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function checklist(items){
  return '<ul class="checklist">'+items.map(i=>'<li>'+mdlite(i)+'</li>').join('')+'</ul>';
}
function code(lang,src,label){
  src = src.replace(/^\n/,'').replace(/\n+$/,'');
  return '<div class="codeblock" data-lang="'+lang+'"><div class="codeblock-bar"><span>'+esc(label||lang)+'</span>'+
    '<button class="copy-btn" onclick="copyCode(this)">Copier</button></div><pre><code>'+highlight(lang,src)+'</code></pre></div>';
}

/* ---------- Coloration syntaxique légère ---------- */
const KEYWORDS = {
  html:['DOCTYPE','html','head','body','div','span','a','img','ul','li','ol','table','tr','td','th','thead','tbody','form','input','label','button','link','script','meta','title','h1','h2','h3','h4','p','header','footer','main','nav','section','article','aside','figure','figcaption','video','audio','source','br','strong','em'],
  css:['display','flex','grid','position','absolute','relative','fixed','color','background','background-color','margin','padding','border','width','height','font-size','font-family','text-align','justify-content','align-items','grid-template-columns','transition','hover','media','max-width'],
  js:['const','let','var','function','return','if','else','for','while','do','break','continue','class','extends','new','this','import','export','from','default','async','await','try','catch','finally','throw','typeof','null','undefined','true','false','document','window','console'],
  python:['def','return','if','elif','else','for','while','in','import','from','class','try','except','finally','with','as','pass','break','continue','True','False','None','print','input','self','and','or','not'],
  c:['int','float','double','char','void','return','if','else','for','while','do','struct','typedef','include','define','main','printf','scanf','sizeof','const','static'],
  sql:['CREATE','TABLE','PRIMARY','KEY','NOT','NULL','UNIQUE','REFERENCES','DEFAULT','SELECT','FROM','WHERE','INSERT','INTO','VALUES','UPDATE','SET','DELETE','JOIN','AS'],
  bash:['sudo','apt','install','update','upgrade','cd','ls','mkdir','rm','cp','mv','git','npm','python','node','gcc'],
  json:[]
};
function highlight(lang,src){
  const kws = KEYWORDS[lang]||[];
  const kwRe = kws.length? new RegExp('\\b('+kws.join('|')+')\\b','g') : null;
  let out='';
  let i=0;
  const n=src.length;
  const isTagLang = lang==='html'||lang==='xml';
  while(i<n){
    const rest = src.slice(i);
    let m;
    if(lang!=='html'){
      const mm = rest.match(/^(\/\/[^\n]*)/)||((lang==='python'||lang==='bash')&&rest.match(/^(#[^\n]*)/));
      if(mm){ out+='<span class="tok-com">'+esc(mm[1])+'</span>'; i+=mm[1].length; continue; }
    }
    if(rest.startsWith('/*')){
      const end = rest.indexOf('*/'); const len = end===-1? rest.length : end+2;
      out+='<span class="tok-com">'+esc(rest.slice(0,len))+'</span>'; i+=len; continue;
    }
    if(rest.startsWith('--') && lang==='sql'){
      const end = rest.indexOf('\n'); const len = end===-1? rest.length : end;
      out+='<span class="tok-com">'+esc(rest.slice(0,len))+'</span>'; i+=len; continue;
    }
    if(m=rest.match(/^("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/)){
      out+='<span class="tok-str">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    if(isTagLang && (m=rest.match(/^<\/?[a-zA-Z][a-zA-Z0-9-]*/))){
      out+='<span class="tok-tag">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    if(isTagLang && (m=rest.match(/^[a-zA-Z-]+(?==)/))){
      out+='<span class="tok-attr">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    if(m=rest.match(/^\b\d+(\.\d+)?\b/)){
      out+='<span class="tok-num">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    if(kwRe && (m=rest.match(kwRe)) && rest.indexOf(m[0])===0){
      out+='<span class="tok-kw">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    if(m=rest.match(/^[A-Za-z_][A-Za-z0-9_]*(?=\()/)){
      out+='<span class="tok-fn">'+esc(m[0])+'</span>'; i+=m[0].length; continue;
    }
    out+=esc(src[i]); i++;
  }
  return out;
}
function copyCode(btn){
  const code = btn.closest('.codeblock').querySelector('code').innerText;
  navigator.clipboard && navigator.clipboard.writeText(code);
  const old = btn.textContent; btn.textContent='Copié ✓';
  setTimeout(()=>btn.textContent=old,1200);
}

/* ================================================================
   PARCOURS 1 — DÉVELOPPEUR WEB
   ================================================================ */
const WEB_M0 = {
  id:'w-m0', title:'Module 0 · Comprendre le Web', level:'Fondations',
  chapters:[
    { id:'w0-1', title:"Comment fonctionne Internet ?", subtitle:"Avant d'écrire une ligne de code, comprendre la machine derrière le rideau.",
      body:
        h3("Le Web comme une ville") +
        callout('analogie',"Analogie",
          "Imagine Internet comme une immense ville. Chaque site web est une maison, identifiée par une adresse unique (son URL). Ton navigateur (Chrome, Firefox…) est le taxi qui t'y conduit. La route qu'il emprunte, ce sont les câbles et antennes qui relient les ordinateurs du monde entier."
        ) +
        p("**Internet** est le réseau physique (câbles, satellites, box, antennes) qui relie des milliards d'appareils. Le **Web** (ou \"www\") est l'un des services qui circulent sur ce réseau : des pages, reliées entre elles par des liens. Il existe d'autres services sur Internet (email, streaming…), mais c'est le Web qui nous intéresse ici.") +
        h3("Client et serveur : la relation au cœur du Web") +
        p("Quand tu tapes une adresse dans ton navigateur, deux acteurs entrent en scène :") +
        table(["Rôle","Qui c'est","Ce qu'il fait"],[
          ["**Client**","Ton navigateur (Chrome, Firefox, Edge…)","Il **demande** une page web"],
          ["**Serveur**","Un ordinateur allumé en permanence, ailleurs dans le monde","Il **répond** en envoyant les fichiers de la page"]
        ]) +
        p("Ce va-et-vient s'appelle une **requête HTTP** (la demande) et une **réponse HTTP** (le contenu renvoyé : HTML, CSS, images…). HTTPS est la version sécurisée et chiffrée de ce protocole — c'est pour cela que tu vois un cadenas dans la barre d'adresse des sites sérieux.") +
        h3("Anatomie d'une URL") +
        code('bash', "https://www.cjepe-benin.com/formations/developpeur-web", "URL") +
        ul([
          "**https://** — le protocole utilisé (ici, sécurisé)",
          "**www.cjepe-benin.com** — le nom de domaine, l'adresse de la maison",
          "**/formations/developpeur-web** — le chemin vers une page précise à l'intérieur du site"
        ]) +
        callout('cle',"À retenir",
          "Le Web fonctionne toujours selon le même principe : un client demande, un serveur répond. Toute la suite du cours consiste à apprendre à construire ce que le serveur envoie (HTML, CSS, JS) puis, plus tard, comment le serveur lui-même est programmé (Python/Django, Node.js)."
        )
    },
    { id:'w0-2', title:"Les trois piliers : HTML, CSS, JavaScript", subtitle:"Trois langages, trois responsabilités, jamais mélangées.",
      body:
        p("Une page web bien construite sépare toujours trois responsabilités. C'est la première règle professionnelle à retenir, et tout le reste du parcours en découle.") +
        table(["Langage","Rôle","Question à laquelle il répond"],[
          ["**HTML**","Structure","Qu'est-ce qu'il y a sur la page ? (un titre, un paragraphe, une image…)"],
          ["**CSS**","Apparence","À quoi ça ressemble ? (couleurs, tailles, alignement…)"],
          ["**JavaScript**","Comportement","Que se passe-t-il quand j'interagis ? (clic, formulaire, animation…)"]
        ]) +
        callout('analogie',"Analogie",
          "HTML, c'est la charpente et les murs d'une maison. CSS, c'est la peinture, la décoration, l'agencement. JavaScript, c'est l'électricité : les interrupteurs, la sonnette, tout ce qui réagit à une action."
        ) +
        p("Sépare toujours ces trois responsabilités dans des fichiers différents (.html, .css, .js). C'est plus facile à lire, à corriger, et c'est ce que font tous les professionnels.") +
        h4("Comment un fichier HTML relie les deux autres") +
        code('html', '<link rel="stylesheet" href="style.css">\n<script src="script.js" defer></script>', "index.html") +
        p("L'attribut **defer** sur `<script>` indique au navigateur d'exécuter le JavaScript seulement après avoir fini de lire le HTML — une bonne pratique que tu retrouveras dans tout le cours.")
    },
    { id:'w0-3', title:"Installer son environnement de travail", subtitle:"Les outils avant le code : éditeur, navigateur, terminal.",
      body:
        p("Avant de coder, il faut équiper son poste. Trois outils suffisent pour commencer le Web.") +
        h4("1. Visual Studio Code (l'éditeur)") +
        ul([
          "Télécharge-le sur **code.visualstudio.com**",
          "Pendant l'installation, coche **Add to PATH** et **Open with Code**",
          "Installe l'extension **Live Server** : elle ouvre ta page HTML dans le navigateur et la recharge automatiquement à chaque sauvegarde"
        ]) +
        h4("2. Un navigateur avec ses outils développeur") +
        p("Chrome ou Firefox conviennent très bien. Le raccourci **F12** (ou clic droit → Inspecter) ouvre les **outils développeur** : tu peux y voir le HTML de n'importe quelle page, tester du CSS en direct, et lire les messages d'erreur JavaScript dans l'onglet **Console**. Prends l'habitude d'y jeter un œil dès qu'une page ne se comporte pas comme prévu.") +
        h4("3. Un dossier de projet organisé") +
        code('bash', "mon-site/\n├── index.html\n├── style.css\n└── script.js", "Structure recommandée") +
        callout('astuce',"Astuce",
          "Garde toujours ce trio de fichiers ensemble dans le même dossier pendant tes premiers projets. Une fois Git appris (module 4), tu sauras aussi versionner ce dossier proprement."
        )
    }
  ]
};

const WEB_M1 = {
  id:'w-m1', title:'Module 1 · HTML — Le squelette du Web', level:'Fondations',
  chapters:[
    { id:'w1-1', title:"La structure d'une page HTML", subtitle:"Le document minimal que tout navigateur sait lire.",
      body:
        p("Un fichier HTML commence toujours par la même ossature. Voici la base à connaître par cœur :") +
        code('html', '<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <meta charset="UTF-8">\n  <title>Mon premier site</title>\n</head>\n<body>\n\n  <h1>Bonjour le monde</h1>\n\n</body>\n</html>', "index.html") +
        table(["Balise","Rôle"],[
          ["`<!DOCTYPE html>`","Indique au navigateur qu'il lit du HTML5"],
          ["`<html lang=\"fr\">`","Balise racine ; `lang` aide l'accessibilité et le référencement"],
          ["`<head>`","Informations invisibles : titre d'onglet, encodage, liens CSS/JS"],
          ["`<body>`","Tout ce qui est visible à l'écran"]
        ]) +
        callout('cle',"À retenir","Rien de ce qui est dans <head> ne s'affiche sur la page. Tout ce qui doit être visible va dans <body>.")
    },
    { id:'w1-2', title:"Titres, paragraphes et mise en valeur du texte",
      body:
        h3("Les titres <h1> à <h6>") +
        code('html', "<h1>Titre principal</h1>\n<h2>Sous-titre</h2>\n<h3>Titre de niveau 3</h3>") +
        p("Leur rôle est de **hiérarchiser** le contenu, un peu comme le plan d'un document Word. Deux règles à respecter toujours :") +
        ul([
          "Un seul `<h1>` par page (le titre principal)",
          "Ne jamais sauter de niveau (ne pas passer directement d'un `<h1>` à un `<h3>`) — c'est important pour le SEO et pour les lecteurs d'écran utilisés par les personnes malvoyantes"
        ]) +
        h3("Le paragraphe <p>") +
        code('html', "<p>Ceci est un paragraphe de texte.</p>") +
        p("Il contient du texte courant et se termine toujours par un retour à la ligne automatique.") +
        h3("Mettre en valeur : <strong> et <em>") +
        code('html', "<p><strong>Important</strong> et <em>mis en valeur</em>.</p>") +
        ul([
          "`<strong>` : importance sémantique (le lecteur d'écran insiste dessus, et cela compte pour le SEO)",
          "`<em>` : emphase, une nuance de ton"
        ]) +
        h3("Retour à la ligne : <br>") +
        code('html', "Texte ligne 1<br>Texte ligne 2") +
        callout('attention',"Attention","<br> est une balise orpheline (elle ne se ferme pas) et doit rester rare : pour espacer des blocs, utilise plutôt le CSS (module 2), pas des <br> en série.")
    },
    { id:'w1-3', title:"Liens et médias : <a>, <img>, <video>",
      body:
        h3("Le lien hypertexte <a>") +
        code('html', '<a href="https://example.com" target="_blank" title="Visiter">Visiter le site</a>') +
        table(["Attribut","Rôle"],[
          ["**href**","L'adresse de destination (obligatoire)"],
          ["**target=\"_blank\"**","Ouvre le lien dans un nouvel onglet"],
          ["**title**","Info-bulle affichée au survol"]
        ]) +
        h3("L'image <img>") +
        code('html', '<img src="image.jpg" alt="Description de l\'image">') +
        callout('cle',"À retenir","<img> est une balise orpheline. **src** (la source) et **alt** (le texte alternatif) sont tous les deux obligatoires : alt sert à l'accessibilité et au référencement — décris toujours ce que montre l'image.") +
        h3("Vidéo et audio") +
        code('html', '<video controls>\n  <source src="video.mp4" type="video/mp4">\n</video>') +
        p("L'attribut **controls** affiche les boutons de lecture. La balise peut contenir plusieurs `<source>` pour proposer différents formats au navigateur.")
    },
    { id:'w1-4', title:"Listes et tableaux",
      body:
        h3("Liste non ordonnée <ul>") +
        code('html', "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>") +
        h3("Liste ordonnée <ol>") +
        code('html', "<ol>\n  <li>Étape 1</li>\n  <li>Étape 2</li>\n</ol>") +
        h3("Le tableau <table>") +
        code('html', "<table>\n  <thead>\n    <tr><th>Nom</th><th>Âge</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Alice</td><td>25</td></tr>\n  </tbody>\n</table>") +
        table(["Balise","Rôle"],[
          ["`<thead>`","En-tête du tableau"],
          ["`<tbody>`","Corps du tableau"],
          ["`<tr>`","Une ligne (table row)"],
          ["`<th>`","Une cellule d'en-tête"],
          ["`<td>`","Une cellule de donnée"]
        ])
    },
    { id:'w1-5', title:"Les formulaires",
      body:
        p("Un formulaire recueille des informations saisies par l'utilisateur et les envoie quelque part (un serveur, plus tard Django ou Node.js).") +
        code('html', '<form action="traitement.php" method="post">\n  <label for="email">Email</label>\n  <input type="email" id="email" name="email">\n\n  <button type="submit">Envoyer</button>\n</form>') +
        p("Le `<label for=\"email\">` doit toujours correspondre à l'`id` du champ : c'est ce qui permet, en cliquant sur le texte, de placer le curseur dans le champ — indispensable pour l'accessibilité.") +
        h4("Les types de <input> les plus courants") +
        ul(["text","email","password","checkbox","radio","submit"]) +
        callout('astuce',"Astuce","Teste toujours tes formulaires au clavier seul (Tab, Entrée) : c'est le meilleur moyen de vérifier qu'ils restent utilisables par tout le monde.")
    },
    { id:'w1-6', title:"Sémantique, accessibilité et bonnes pratiques", subtitle:"Écrire un HTML que les machines (et les humains) comprennent bien.",
      body:
        h3("Balises sémantiques") +
        p("Plutôt que d'empiler des `<div>` partout, HTML propose des balises qui décrivent le **sens** du contenu :") +
        code('html', "<header>...</header>\n<main>...</main>\n<aside>\n  <p>Infos complémentaires</p>\n</aside>\n<figure>\n  <img src=\"photo.jpg\" alt=\"Photo\">\n  <figcaption>Légende</figcaption>\n</figure>\n<footer>...</footer>") +
        h3("Accessibilité : les 3 réflexes de base") +
        checklist([
          "Toujours utiliser **alt** sur les images",
          "Toujours associer `<label>` à son `<input>`",
          "Utiliser les balises sémantiques (header, main, footer…) plutôt que des `<div>` génériques"
        ]) +
        h3("Le <head> technique") +
        code('html', '<link rel="stylesheet" href="style.css">\n<script src="script.js" defer></script>\n<link rel="icon" href="favicon.ico">') +
        h3("Les commentaires") +
        code('html', "<!-- Ceci est un commentaire -->") +
        p("Invisible pour le visiteur, utile pour toi ou tes collègues afin d'expliquer une partie du code.")
    }
  ],
  quiz:[
    {q:"Que fait obligatoirement l'attribut alt sur une balise <img> ?", options:["Il agrandit l'image","Il décrit l'image pour l'accessibilité et le SEO","Il change la couleur de l'image","Il ralentit le chargement"], correct:1},
    {q:"Combien de balises <h1> doit contenir une page HTML bien structurée ?", options:["Autant que de sections","0","Une seule","6 maximum"], correct:2},
    {q:"Quel attribut relie un <label> à son <input> ?", options:["name / id","for / id","href / src","class / id"], correct:1},
    {q:"Où placer les balises invisibles comme <title> ou <meta charset> ?", options:["Dans <body>","Dans <head>","N'importe où","Dans <footer>"], correct:1}
  ]
};

const WEB_M2 = {
  id:'w-m2', title:'Module 2 · CSS — L\'apparence', level:'Fondations',
  chapters:[
    { id:'w2-1', title:"Où et comment écrire le CSS", subtitle:"HTML = structure. CSS = apparence.",
      body:
        p("CSS (Cascading Style Sheets) sert à gérer la mise en forme : couleurs, tailles, disposition des éléments HTML. Il existe trois façons de l'écrire, une seule est recommandée en pratique.") +
        h3("1. CSS externe (RECOMMANDÉ)") +
        code('html', '<link rel="stylesheet" href="style.css">') +
        code('css', "body {\n  background-color: white;\n}", "style.css") +
        h3("2. CSS interne") +
        code('html', "<style>\n  body { color: black; }\n</style>") +
        h3("3. CSS en ligne (à éviter)") +
        code('html', '<p style="color:red">Texte</p>') +
        callout('attention',"Attention","Le CSS en ligne mélange structure et apparence dans la même balise : difficile à maintenir. Toujours préférer un fichier .css externe.") +
        h3("Les sélecteurs CSS") +
        code('css', "p { color: blue; }\n\n#id { }\n.classe { }\nh1 { }") +
        p("Un sélecteur cible les éléments à styliser : une balise (`h1`), une classe (`.classe`, réutilisable sur plusieurs éléments) ou un identifiant unique (`#id`, une seule fois par page).")
    },
    { id:'w2-2', title:"Couleurs, texte et le modèle de boîte",
      body:
        h3("Couleurs et texte") +
        code('css', "color: red;\nbackground-color: #000;\nfont-size: 16px;\nfont-family: Arial;\ntext-align: center;") +
        h3("Le modèle de boîte (Box Model)") +
        callout('analogie',"Analogie","Chaque élément HTML est une boîte : le contenu, entouré d'un espace intérieur (padding), d'une bordure (border), puis d'un espace extérieur qui le sépare des autres boîtes (margin).") +
        code('css', "margin: 10px;\npadding: 20px;\nborder: 1px solid black;") +
        p("**margin** pousse les autres éléments plus loin ; **padding** agrandit l'espace entre le contenu et la bordure, à l'intérieur de la boîte.")
    },
    { id:'w2-3', title:"Unités et positionnement",
      body:
        h3("Tailles et unités") +
        code('css', "width: 100%;\nheight: 50vh;\nfont-size: 1rem;") +
        table(["Unité","Signification"],[
          ["**px**","Pixels — taille fixe"],
          ["**%**","Pourcentage de l'élément parent"],
          ["**em**","Relatif à la taille de police du parent"],
          ["**rem**","Relatif à la taille de police de la racine (plus prévisible qu'em)"],
          ["**vh / vw**","Pourcentage de la hauteur / largeur de l'écran (viewport)"]
        ]) +
        h3("Le positionnement") +
        code('css', "position: relative;\nposition: absolute;\nposition: fixed;") +
        ul([
          "**relative** : décalé par rapport à sa position normale, sans sortir du flux",
          "**absolute** : positionné par rapport à son parent positionné le plus proche",
          "**fixed** : reste à l'écran même quand on scrolle (utile pour un menu collant)"
        ])
    },
    { id:'w2-4', title:"Flexbox et Grid — la mise en page moderne", subtitle:"Les deux outils que tout développeur front-end utilise au quotidien.",
      body:
        h3("Flexbox (ESSENTIEL)") +
        code('css', ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}", "Centrer parfaitement un élément") +
        p("Flexbox aligne des éléments sur **une seule ligne** (ou colonne). `justify-content` gère l'axe principal, `align-items` l'axe secondaire. C'est l'outil numéro un pour centrer, espacer ou aligner des éléments.") +
        h3("Grid CSS") +
        code('css', ".grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}") +
        p("Grid organise les éléments en **lignes et colonnes**, comme un tableau — idéal pour des mises en page en deux dimensions (galeries, tableaux de bord).") +
        callout('cle',"À retenir","Flexbox pour aligner en une dimension (une rangée ou une colonne), Grid pour construire une vraie grille en deux dimensions.")
    },
    { id:'w2-5', title:"Responsive design et effets",
      body:
        h3("Rendre un site responsive") +
        code('css', "@media (max-width: 768px) {\n  body { font-size: 14px; }\n}") +
        p("Une **media query** applique des règles CSS uniquement sous une certaine largeur d'écran — c'est ce qui permet à un même site de s'adapter du grand écran au smartphone.") +
        h3("Effets et transitions") +
        code('css', "button:hover {\n  background: red;\n}\ntransition: all 0.3s ease;") +
        p("`:hover` cible un élément survolé par la souris. `transition` adoucit le changement (ici, sur 0.3 seconde) au lieu d'un changement brutal.")
    }
  ],
  quiz:[
    {q:"Quelle méthode d'écriture du CSS est recommandée en pratique ?", options:["CSS en ligne (style=\"\")","CSS interne (<style>)","CSS externe (fichier .css lié)","Peu importe"], correct:2},
    {q:"Que fait `display:flex` sur un conteneur ?", options:["Il cache l'élément","Il aligne ses enfants sur un axe (ligne ou colonne)","Il change la police","Il ajoute une bordure"], correct:1},
    {q:"À quoi sert une media query comme @media (max-width:768px) ?", options:["À charger une image différente","À appliquer du CSS selon la largeur de l'écran","À accélérer le site","À changer la langue"], correct:1},
    {q:"Quelle unité est relative à la taille de police de l'élément racine ?", options:["px","vh","rem","%"], correct:2}
  ]
};

const WEB_M3 = {
  id:'w-m3', title:'Module 3 · JavaScript — L\'interactivité', level:'Fondations',
  chapters:[
    { id:'w3-1', title:"Variables, types et opérations", subtitle:"JavaScript permet de rendre une page interactive, de réagir aux actions et de modifier le HTML/CSS en direct.",
      body:
        h3("Où écrire le JavaScript") +
        code('html', '<script src="script.js" defer></script>') +
        h3("Déclarer une variable") +
        code('js', 'let nom = "Jean";\nconst age = 25;') +
        p("**let** déclare une variable qui peut changer de valeur ; **const** déclare une valeur qui ne changera plus. Par défaut, préfère toujours `const`, et n'utilise `let` que si la valeur doit évoluer.") +
        h3("Les types de données") +
        ul(["string (texte)","number (nombre)","boolean (vrai / faux)","array (liste)","object (objet)"]) +
        h3("Les opérations") +
        code('js', "let total = 5 + 3;")
    },
    { id:'w3-2', title:"Conditions et boucles",
      body:
        h3("Les conditions") +
        code('js', 'if (age >= 18) {\n  console.log("Adulte");\n}') +
        h3("Les boucles") +
        code('js', "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}") +
        p("Une boucle `for` répète un bloc de code un nombre défini de fois — ici, elle affiche les nombres de 0 à 4.")
    },
    { id:'w3-3', title:"Les fonctions",
      body:
        p("Une fonction regroupe un bloc de code réutilisable, qu'on peut déclencher à volonté.") +
        code('js', 'function direBonjour() {\n  alert("Bonjour");\n}\n\ndireBonjour();') +
        callout('astuce',"Astuce","Donne à tes fonctions un nom qui décrit une action (direBonjour, calculerTotal, afficherErreur) : le code se relit ensuite presque comme une phrase.")
    },
    { id:'w3-4', title:"Le DOM : manipuler le HTML depuis JavaScript", subtitle:"Le DOM (Document Object Model) est la représentation en mémoire de ta page, que JavaScript peut lire et modifier.",
      body:
        code('js', 'document.querySelector("h1").textContent = "Nouveau titre";') +
        p("**querySelector** trouve un élément dans la page grâce à un sélecteur CSS (une balise, une `.classe` ou un `#id`), puis on peut lire ou changer son contenu, son style, ou ses attributs.") +
        callout('cle',"À retenir","Le JavaScript ne réécrit jamais ton fichier HTML : il modifie la page **déjà chargée dans le navigateur**, en direct, sous les yeux de l'utilisateur.")
    },
    { id:'w3-5', title:"Événements et formulaires",
      body:
        h3("Écouter un événement") +
        code('js', 'button.addEventListener("click", function () {\n  alert("Cliqué");\n});') +
        p("`addEventListener` déclenche une fonction quand un événement précis se produit sur un élément : un clic, une saisie clavier, une soumission de formulaire…") +
        h3("Intercepter un formulaire") +
        code('js', 'form.addEventListener("submit", function(e) {\n  e.preventDefault();\n});') +
        p("`e.preventDefault()` empêche le comportement par défaut du formulaire (recharger la page) : indispensable dès qu'on veut valider ou envoyer les données soi-même en JavaScript.")
    },
    { id:'w3-6', title:"Tableaux, objets et JavaScript moderne",
      body:
        h3("Tableaux et objets") +
        code('js', 'const fruits = ["pomme", "mangue", "ananas"];\nconst utilisateur = { nom: "Awa", age: 22 };') +
        h3("JavaScript moderne") +
        ul([
          "**Arrow functions** : une écriture courte pour les fonctions, `const addition = (a, b) => a + b;`",
          "**Promises** : représentent une valeur qui arrivera plus tard (ex. une réponse de serveur)",
          "**Async / Await** : une façon plus lisible d'écrire du code qui attend une réponse asynchrone"
        ]) +
        code('js', 'async function chargerDonnees() {\n  const reponse = await fetch("/api/employes");\n  const donnees = await reponse.json();\n  console.log(donnees);\n}')
    },
    { id:'w3-7', title:"Mini-projets guidés", subtitle:"Trois petits projets pour mettre en pratique ce que tu viens d'apprendre.",
      body:
        h3("1. Calculatrice") +
        p("Un formulaire avec deux champs `<input type=\"number\">` et un bouton. Au clic, lis les deux valeurs avec `document.querySelector`, additionne-les, et affiche le résultat dans un `<p>` grâce à `.textContent`.") +
        h3("2. Formulaire interactif") +
        p("Un champ email : à chaque frappe (`addEventListener(\"input\", ...)`), vérifie que la valeur contient bien un `@` et affiche un message d'erreur en direct si ce n'est pas le cas.") +
        h3("3. Liste de tâches (To-do list)") +
        p("Un champ texte + un bouton \"Ajouter\". Chaque clic crée un `<li>` avec le texte saisi et l'ajoute à un `<ul>` grâce à `appendChild`. Ajoute un bouton \"Supprimer\" sur chaque tâche.") +
        callout('astuce',"Bonnes pratiques JavaScript", ["Toujours utiliser `defer` sur la balise `<script>`","Séparer HTML, CSS et JS dans des fichiers différents","Commenter le code pour expliquer le **pourquoi**, pas le **quoi**"])
    }
  ],
  quiz:[
    {q:"Quelle est la différence entre let et const ?", options:["Aucune différence","let est pour les nombres, const pour le texte","const ne peut plus être réassignée après sa création","let est plus rapide"], correct:2},
    {q:"Que fait document.querySelector(\"h1\") ?", options:["Il crée un nouveau titre","Il sélectionne le premier élément <h1> de la page","Il supprime le titre","Il compte les titres"], correct:1},
    {q:"À quoi sert e.preventDefault() sur un formulaire ?", options:["À vider le formulaire","À empêcher le rechargement automatique de la page à la soumission","À valider automatiquement les champs","À fermer la page"], correct:1},
    {q:"Quel mot-clé écoute un clic sur un bouton ?", options:["onClick()","listenEvent()","addEventListener(\"click\", ...)","watch(\"click\")"], correct:2}
  ]
};

const WEB_M4 = {
  id:'w-m4', title:'Module 4 · Git & GitHub — Versionner et publier', level:'Fondations',
  chapters:[
    { id:'w4-1', title:"Pourquoi Git ? Git contre GitHub", subtitle:"Ce cours est destiné aux débutants absolus, même sans expérience du terminal.",
      body:
        h3("Le problème que Git résout") +
        p("**Sans Git** : tu perds des fichiers, tu multiplies les copies (\"projet_final_v2_definitif\"), et il est impossible de revenir en arrière proprement.") +
        p("**Avec Git** : chaque modification est sauvegardée dans un historique, tu peux revenir à n'importe quelle version, et travailler seul ou en équipe sans écraser le travail des autres.") +
        callout('cle',"À retenir","Git = historique + sécurité.") +
        h3("Git n'est pas GitHub") +
        table(["Outil","C'est quoi ?"],[
          ["**Git**","Un logiciel installé sur ton ordinateur, qui suit l'historique de ton projet"],
          ["**GitHub**","Un site web qui héberge ton code en ligne et permet de le partager"]
        ]) +
        callout('analogie',"Image mentale","Git, c'est ton cahier de bord. GitHub, c'est ton coffre-fort dans le cloud.")
    },
    { id:'w4-2', title:"Installer et configurer Git",
      body:
        h3("Télécharger et installer") +
        ul(["Va sur **git-scm.com**","Clique sur **Download for Windows**","Lance le fichier, clique **Next** à chaque étape sans changer les options, puis **Install** et **Finish**"]) +
        h3("Vérifier l'installation") +
        code('bash', "git --version") +
        p("Si un numéro de version s'affiche, c'est bon.") +
        h3("Se présenter à Git (obligatoire)") +
        code('bash', 'git config --global user.name "Ton Nom"\ngit config --global user.email "ton@email.com"') +
        p("Git doit savoir qui fait les modifications : vérifie ensuite avec `git config --list` que ton nom et ton email apparaissent bien.")
    },
    { id:'w4-3', title:"Créer un projet et les premières commandes", subtitle:"Les commandes que tu utiliseras tous les jours.",
      body:
        h3("Créer le dossier du projet") +
        code('bash', "mkdir mon-site\ncd mon-site") +
        h3("Initialiser Git dans le dossier") +
        code('bash', "git init") +
        p("Résultat : Git commence à suivre ce dossier.") +
        h3("Le cycle à trois commandes") +
        code('bash', "git status\ngit add .\ngit commit -m \"Premier commit\"") +
        table(["Commande","Rôle"],[
          ["**git status**","Affiche les fichiers modifiés ou non suivis"],
          ["**git add .**","Ajoute tous les fichiers modifiés à la prochaine sauvegarde"],
          ["**git commit -m \"...\"**","Crée un point de sauvegarde avec un message explicatif"]
        ])
    },
    { id:'w4-4', title:"Publier son projet sur GitHub",
      body:
        h3("Créer un compte GitHub") +
        p("Va sur **github.com**, clique sur **Sign up**, renseigne un nom d'utilisateur, un email et un mot de passe, puis valide ton email.") +
        h3("Créer un dépôt (repository) en ligne") +
        ul(["Clique sur **New repository**","Nom : `mon-site`","Visibilité : **Public**","Clique **Create**"]) +
        h3("Lier ton projet local à GitHub") +
        code('bash', "git remote add origin https://github.com/ton-nom/mon-site.git\ngit push -u origin main") +
        p("**git push** envoie tes commits locaux vers GitHub : ton code devient visible en ligne.")
    },
    { id:'w4-5', title:"Mettre à jour le projet et .gitignore",
      body:
        h3("Le cycle de mise à jour") +
        p("Après avoir modifié un fichier (par exemple `index.html`), le cycle est toujours le même :") +
        code('bash', "git add .\ngit commit -m \"Modifie la page d'accueil\"\ngit push") +
        h3("Le fichier .gitignore") +
        p("Il empêche Git d'envoyer des fichiers inutiles ou sensibles (dossiers de dépendances, fichiers temporaires…).") +
        code('bash', "node_modules/\n.env\n*.log", ".gitignore") +
        h3("Bonnes pratiques") +
        checklist(["Un commit = une action logique, pas un fourre-tout","Des messages de commit clairs et au présent (\"Ajoute le formulaire de contact\")","Vérifier `git status` souvent, avant chaque commit"])
    },
    { id:'w4-6', title:"Déployer avec GitHub Pages", subtitle:"Mettre son site en ligne gratuitement, en quelques clics.",
      body:
        h3("Activer GitHub Pages") +
        ul(["Dans ton dépôt GitHub, va dans **Settings**","Clique sur **Pages**","Choisis la branche **main** et le dossier **/root**","Clique **Save**"]) +
        p("Ton site devient accessible à une adresse du type `https://ton-nom.github.io/mon-site/`.") +
        h3("Projet final du module") +
        p("Crée un site vitrine ou un portfolio avec ce que tu as appris (modules 1 à 3), publie-le sur GitHub, puis déploie-le avec GitHub Pages. Tu sais maintenant utiliser Git, GitHub, et mettre un site en ligne — la base de tout développeur web.")
    }
  ],
  quiz:[
    {q:"Quelle commande crée un point de sauvegarde dans l'historique Git ?", options:["git save","git commit -m \"...\"","git push","git backup"], correct:1},
    {q:"Quelle est la différence entre Git et GitHub ?", options:["Aucune, ce sont des synonymes","Git est un logiciel local, GitHub héberge le code en ligne","GitHub remplace Git","Git est payant, GitHub est gratuit"], correct:1},
    {q:"À quoi sert le fichier .gitignore ?", options:["À supprimer des fichiers du disque","À empêcher Git de suivre certains fichiers","À créer un commit automatique","À changer de branche"], correct:1},
    {q:"Quelle commande envoie tes commits locaux vers GitHub ?", options:["git pull","git fetch","git push","git send"], correct:2}
  ]
};

const WEB_M5 = {
  id:'w-m5', title:'Module 5 · Langage C — Comprendre la machine', level:'Fondamentaux',
  chapters:[
    { id:'w5-1', title:"Pourquoi le C ? Installer les outils", subtitle:"Le langage idéal pour comprendre comment un ordinateur fonctionne réellement.",
      body:
        p("Le langage **C** est rapide et très proche du matériel. On l'utilise pour les systèmes d'exploitation, les logiciels embarqués, les applications performantes — et c'est la base de nombreux langages modernes (C++, Java, Python).") +
        p("Dans un projet informatique, le C sert à écrire la logique principale, gérer la mémoire, effectuer des calculs rapides et créer des programmes autonomes (sans navigateur).") +
        h3("Les outils nécessaires") +
        ul(["Un compilateur C → **GCC** (via MinGW)","Un éditeur de code → **Visual Studio Code**","Les extensions **C/C++ (Microsoft)** et **Code Runner** dans VS Code"]) +
        h3("Installer le compilateur (GCC via MinGW)") +
        ul([
          "Télécharge **MinGW-w64** depuis mingw-w64.org",
          "Choisis Architecture **x86_64**, Threads **posix**, Exception **seh**, dossier `C:\\mingw64`",
          "Ajoute `C:\\mingw64\\bin` au **PATH** système (obligatoire)",
          "Vérifie avec `gcc --version` dans l'invite de commande : si une version s'affiche, l'installation est réussie"
        ])
    },
    { id:'w5-2', title:"Premier programme et variables",
      body:
        h3("Structure minimale") +
        code('c', '#include <stdio.h>\nint main() {\n  printf("Bonjour le monde");\n  return 0;\n}') +
        table(["Élément","Rôle"],[
          ["`#include <stdio.h>`","Permet d'utiliser printf"],
          ["**main()**","Le point d'entrée du programme"],
          ["**printf()**","Affiche du texte à l'écran"],
          ["**return 0;**","Indique une fin normale du programme"]
        ]) +
        h3("Déclarer une variable") +
        code('c', 'int age = 25;\nprintf("%d", age);') +
        p("**int** est le type entier ; **%d** est le \"format\" utilisé par printf pour afficher un entier.") +
        h3("Les types de variables") +
        table(["Type","Description","Exemple"],[
          ["**int**","entier","10"],
          ["**float**","décimal","3.14"],
          ["**double**","décimal précis","3.14159"],
          ["**char**","caractère","'A'"],
          ["**char[]**","texte","\"Bonjour\""]
        ]) +
        code('c', 'int age = 30;\nfloat taille = 1.75;\nchar sexe = \'M\';\nchar nom[] = "Jean";') +
        h3("Afficher et lire une saisie") +
        code('c', 'printf("Nom: %s\\n", nom);\nprintf("Age: %d ans\\n", age);\nprintf("Taille: %.2f m\\n", taille);') +
        code('c', 'int age;\nscanf("%d", &age);') +
        callout('attention',"Attention","Avec scanf, le `&` devant la variable est obligatoire : il indique l'adresse mémoire où stocker la valeur saisie.")
    },
    { id:'w5-3', title:"Conditions, boucles et fonctions",
      body:
        h3("Conditions") +
        code('c', 'if (age >= 18) {\n  printf("Vous êtes majeur");\n} else {\n  printf("Vous êtes mineur");\n}') +
        h3("Boucles for et while") +
        code('c', 'for (int i = 1; i <= 5; i++) {\n  printf("%d\\n", i);\n}') +
        code('c', 'int i = 1;\nwhile (i <= 5) {\n  i++;\n}') +
        h3("Fonctions") +
        code('c', 'int addition(int a, int b) {\n  return a + b;\n}')
    },
    { id:'w5-4', title:"Tableaux, structures et architecture d'un projet",
      body:
        h3("Tableaux") +
        code('c', "int notes[5] = {10, 12, 15, 18, 20};") +
        h3("Structures") +
        code('c', 'struct Employe {\n  char nom[50];\n  int age;\n  float salaire;\n};') +
        p("Une **structure** regroupe plusieurs informations liées sous un même nom — la base de l'organisation des données en C.") +
        h3("Organiser un projet C") +
        code('bash', "projet_c/\n├── main.c\n├── fonctions.c\n├── fonctions.h\n└── README.txt") +
        h3("Compiler et exécuter") +
        code('bash', "gcc main.c -o programme\n./programme")
    },
    { id:'w5-5', title:"Mini-projet : gestion d'un employé", subtitle:"Pourquoi apprendre le C ?",
      body:
        code('c', '#include <stdio.h>\nint main() {\n  char nom[50];\n  float salaire;\n\n  scanf("%s", nom);\n  scanf("%f", &salaire);\n\n  printf("%s : %.2f FCFA", nom, salaire);\n  return 0;\n}') +
        h3("Pourquoi apprendre le C ?") +
        ul(["Comprendre la mémoire","Une base solide pour le génie logiciel","Une performance maximale","Indispensable pour : les systèmes, l'électronique, la cybersécurité"]) +
        callout('cle',"Résumé final", [
          "**C** → puissance et contrôle",
          "**main()** → point d'entrée",
          "**printf / scanf** → interaction avec l'utilisateur",
          "**if / for / while** → la logique",
          "**struct** → l'organisation des données"
        ])
    }
  ],
  quiz:[
    {q:"À quoi sert `#include <stdio.h>` au début d'un programme C ?", options:["À définir la fonction main","À permettre l'utilisation de printf/scanf","À compiler le programme","À créer une variable"], correct:1},
    {q:"Pourquoi écrit-on &age dans scanf(\"%d\", &age) ?", options:["C'est une erreur fréquente à éviter","Pour indiquer l'adresse mémoire où stocker la valeur saisie","Pour multiplier age par 2","Ce n'est pas obligatoire"], correct:1},
    {q:"Que regroupe une struct en C ?", options:["Des fonctions uniquement","Plusieurs informations liées sous un même nom","Des fichiers","Des boucles"], correct:1},
    {q:"Quelle commande compile main.c en un programme exécutable nommé programme ?", options:["gcc main.c -o programme","run main.c","python main.c","make programme"], correct:0}
  ]
};

const WEB_M6 = {
  id:'w-m6', title:'Module 6 · Python — Les bases de la programmation', level:'Fondamentaux',
  chapters:[
    { id:'w6-1', title:"Découvrir Python et l'installer", subtitle:"Un langage simple à apprendre, lisible, et utilisé partout : web, IA, data, automatisation.",
      body:
        ul(["Installer Python depuis **python.org**","Vérifier l'installation avec `python --version`","Installer un éditeur : **VS Code** (recommandé)"]) +
        h3("Afficher et lire une saisie") +
        code('python', 'nom = "John"\nprint(nom)') +
        p("On donne une valeur à un mot (une **variable**), et `print()` l'affiche à l'écran. Résultat : `John`.") +
        code('python', 'nom = input("Quel est ton nom ? ")\nprint("Bonjour", nom)')
    },
    { id:'w6-2', title:"Variables, types et opérateurs",
      body:
        h3("Les types de base") +
        table(["Type","Exemple"],[
          ["**int** (entier)","`age = 25`"],
          ["**float** (décimal)","`prix = 3.14`"],
          ["**str** (texte)","`nom = \"John\"`"],
          ["**bool** (vrai/faux)","`est_majeur = True`"]
        ]) +
        h3("Les opérateurs") +
        ul(["Arithmétiques : `+ - * / %`","Comparaison : `== != > <`","Logiques : `and`, `or`, `not`"]) +
        code('python', 'age = 25\nprint("J\'ai", age, "ans")')
    },
    { id:'w6-3', title:"Conditions et boucles",
      body:
        code('python', 'if age < 13:\n    print("Enfant")\nelif age < 18:\n    print("Adolescent")\nelse:\n    print("Adulte")') +
        code('python', 'for i in range(5):\n    print(i)') +
        code('python', 'i = 0\nwhile i < 5:\n    i += 1')
    },
    { id:'w6-4', title:"Listes, tuples et dictionnaires",
      body:
        h3("Listes (modifiables)") +
        code('python', 'nombres = [1, 2, 3]\nnombres.append(4)') +
        h3("Tuples (non modifiables)") +
        code('python', "coordonnees = (5, 10)") +
        h3("Dictionnaires (clé / valeur)") +
        code('python', 'personne = {"nom": "John", "age": 25}\nprint(personne["nom"])') +
        callout('cle',"À retenir","Liste = une collection ordonnée qu'on peut modifier. Tuple = une collection figée. Dictionnaire = des données retrouvées par un nom (clé) plutôt que par une position.")
    },
    { id:'w6-5', title:"Les fonctions",
      body:
        code('python', 'def addition(a, b):\n    return a + b\n\nresultat = addition(3, 4)\nprint(resultat)') +
        p("Une fonction se définit avec **def**, reçoit des paramètres entre parenthèses, et peut renvoyer une valeur avec **return**.")
    },
    { id:'w6-6', title:"Programmation orientée objet (POO)", subtitle:"Modéliser le monde réel avec des classes et des objets.",
      body:
        code('python', 'class Employe:\n    def __init__(self, nom, salaire):\n        self.nom = nom\n        self.salaire = salaire\n\n    def payer(self):\n        print(self.nom, "reçoit", self.salaire, "FCFA")\n\ne = Employe("Awa", 150000)\ne.payer()') +
        table(["Notion","Rôle"],[
          ["**Classe**","Le modèle (ex : Employe)"],
          ["**Objet**","Une instance concrète de la classe (ex : e)"],
          ["**Attribut**","Une donnée de l'objet (nom, salaire)"],
          ["**Méthode**","Une fonction propre à la classe (payer)"],
          ["**__init__**","Le constructeur : s'exécute à la création de l'objet"]
        ])
    },
    { id:'w6-7', title:"Fichiers et gestion des erreurs",
      body:
        h3("Lire et écrire des fichiers") +
        code('python', 'with open("notes.txt", "w") as f:\n    f.write("Bonjour")\n\nwith open("notes.txt", "r") as f:\n    contenu = f.read()') +
        h3("Gérer les erreurs avec try / except") +
        code('python', 'try:\n    resultat = 10 / 0\nexcept ZeroDivisionError:\n    print("Impossible de diviser par zéro")') +
        callout('astuce',"Astuce","try/except évite qu'une erreur inattendue ne fasse planter tout le programme : on \"attrape\" l'erreur et on décide comment réagir.")
    }
  ],
  quiz:[
    {q:"Quel mot-clé Python définit une fonction ?", options:["function","def","func","def()"], correct:1},
    {q:"Quelle structure de données Python utilise des paires clé/valeur ?", options:["list","tuple","dict","set"], correct:2},
    {q:"Que fait __init__ dans une classe Python ?", options:["Il supprime l'objet","C'est le constructeur, exécuté à la création de l'objet","Il affiche l'objet","Il compare deux objets"], correct:1},
    {q:"À quoi sert un bloc try/except ?", options:["À répéter du code","À gérer proprement les erreurs sans faire planter le programme","À définir une fonction","À importer un module"], correct:1}
  ]
};

const WEB_M7 = {
  id:'w-m7', title:'Module 7 · Django — Applications web avec Python', level:'Back-end',
  chapters:[
    { id:'w7-1', title:"Qu'est-ce que Django ? L'architecture MTV",
      body:
        p("**Django** est un framework web Python qui permet de créer des sites web rapidement et proprement, en fournissant déjà les outils pour la base de données, l'authentification, les templates…") +
        h3("L'architecture MTV (Model-Template-View)") +
        table(["Brique","Rôle"],[
          ["**Model**","Décrit les données et parle à la base de données"],
          ["**Template**","Le fichier HTML affiché à l'utilisateur"],
          ["**View**","La logique : elle relie le Model au Template"]
        ]) +
        callout('analogie',"Analogie","Le Model, c'est le garde-manger. La View, c'est le cuisinier qui va y chercher les ingrédients. Le Template, c'est l'assiette dressée pour le client.")
    },
    { id:'w7-2', title:"Installer Django et créer son premier projet",
      body:
        code('bash', "pip install django\ndjango-admin startproject rh_benin\ncd rh_benin\npython manage.py runserver") +
        p("`runserver` lance un serveur local : ouvre **http://127.0.0.1:8000/** dans ton navigateur pour voir la page de bienvenue de Django.") +
        h3("Créer une application") +
        code('bash', "python manage.py startapp employees") +
        p("Un **projet** Django peut contenir plusieurs **applications** (employees, payroll, leaves…), chacune centrée sur une fonctionnalité.")
    },
    { id:'w7-3', title:"Modèles et base de données", subtitle:"L'ORM Django : écrire du Python plutôt que du SQL.",
      body:
        code('python', 'from django.db import models\n\nclass Employee(models.Model):\n    nom = models.CharField(max_length=100)\n    email = models.EmailField(unique=True)\n    date_embauche = models.DateField()\n\n    def __str__(self):\n        return self.nom', "employees/models.py") +
        p("L'**ORM** (Object-Relational Mapping) traduit automatiquement ces classes Python en tables de base de données — tu écris du Python, Django génère le SQL.") +
        h3("Les migrations") +
        code('bash', "python manage.py makemigrations\npython manage.py migrate") +
        p("**makemigrations** prépare les changements de structure, **migrate** les applique réellement à la base de données.") +
        h3("L'interface d'administration") +
        code('python', 'from django.contrib import admin\nfrom .models import Employee\n\nadmin.site.register(Employee)', "employees/admin.py") +
        p("Après `python manage.py createsuperuser`, l'admin Django (`/admin`) offre une interface toute prête pour ajouter, modifier ou supprimer des employés — sans écrire une seule ligne de HTML.")
    },
    { id:'w7-4', title:"Vues, URLs et templates",
      body:
        h3("Une vue") +
        code('python', 'from django.shortcuts import render\nfrom .models import Employee\n\ndef employee_list(request):\n    employees = Employee.objects.all()\n    return render(request, "employees/list.html", {"employees": employees})', "employees/views.py") +
        h3("Le routage (urls.py)") +
        code('python', 'from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path("employees/", views.employee_list, name="employee_list"),\n]', "employees/urls.py") +
        h3("Le template") +
        code('html', '{% for e in employees %}\n  <p>{{ e.nom }} — {{ e.email }}</p>\n{% endfor %}', "list.html") +
        p("`{{ e.nom }}` affiche une donnée envoyée par la vue ; `{% for %}` est une balise Django qui permet de boucler directement dans le HTML.")
    },
    { id:'w7-5', title:"Formulaires et authentification",
      body:
        p("Django fournit des outils prêts à l'emploi pour la connexion, l'inscription et les formulaires liés à un modèle (`ModelForm`), avec validation automatique côté serveur.") +
        code('python', 'from django import forms\nfrom .models import Employee\n\nclass EmployeeForm(forms.ModelForm):\n    class Meta:\n        model = Employee\n        fields = ["nom", "email", "date_embauche"]') +
        callout('cle',"À retenir","Un ModelForm génère automatiquement les champs du formulaire à partir du modèle, **et** revalide les données côté serveur — même si le JavaScript côté client a déjà vérifié, ne jamais faire confiance uniquement au navigateur.") +
        h3("Projet pratique") +
        p("À ce stade, tu peux construire un site de gestion complet (blog, école, petite entreprise) : modèles, vues, templates, formulaires et interface admin suffisent pour un vrai projet fonctionnel.")
    }
  ],
  quiz:[
    {q:"Que signifie MTV dans l'architecture Django ?", options:["Model-Template-View","Main-Test-Verify","Multi-Thread-View","Model-Type-Validator"], correct:0},
    {q:"À quoi sert `python manage.py migrate` ?", options:["À lancer le serveur","À appliquer les changements de structure à la base de données","À créer un superutilisateur","À installer Django"], correct:1},
    {q:"Que fait `admin.site.register(Employee)` ?", options:["Il crée un nouvel employé","Il rend le modèle Employee gérable depuis l'interface d'administration","Il supprime le modèle","Il envoie un email"], correct:1},
    {q:"Dans un template Django, comment afficher une variable ?", options:["<?= variable ?>","{{ variable }}","${variable}","#variable#"], correct:1}
  ]
};

const WEB_M8 = {
  id:'w-m8', title:'Module 8 · Node.js — JavaScript côté serveur', level:'Back-end',
  chapters:[
    { id:'w8-1', title:"Qu'est-ce que Node.js ? Installer et npm",
      body:
        p("**Node.js** permet d'exécuter du JavaScript **côté serveur** — le même langage que dans le navigateur, mais pour construire des serveurs, des API, des scripts.") +
        code('bash', "node --version\nnpm init -y") +
        p("**npm** (Node Package Manager) installe et gère les librairies externes (**modules**) dont ton projet a besoin.") +
        code('bash', "npm install express")
    },
    { id:'w8-2', title:"Modules et création d'un serveur",
      body:
        h3("Modules internes et externes") +
        p("Node.js fournit des **modules internes** (`fs` pour les fichiers, `http` pour le réseau…) et permet d'installer des **modules externes** via npm (comme Express).") +
        h3("Un serveur HTTP minimal") +
        code('js', 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.end("Bonjour depuis Node.js");\n});\n\nserver.listen(3000);') +
        h3("Avec Express (plus simple)") +
        code('js', 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n  res.send("Bonjour depuis Express");\n});\n\napp.listen(3000, () => console.log("Serveur lancé sur le port 3000"));') +
        callout('cle',"À retenir","Express simplifie énormément la création de routes et de serveurs par rapport au module http natif — c'est le choix par défaut de la majorité des projets Node.js.")
    },
    { id:'w8-3', title:"API REST et base de données",
      body:
        h3("Créer une API REST") +
        code('js', 'app.get("/api/employes", (req, res) => {\n  res.json([{ nom: "Awa" }, { nom: "Kofi" }]);\n});\n\napp.post("/api/employes", (req, res) => {\n  // Créer un employé à partir de req.body\n  res.status(201).json({ message: "Employé créé" });\n});') +
        table(["Méthode HTTP","Usage"],[
          ["**GET**","Lire des données"],
          ["**POST**","Créer une donnée"],
          ["**PUT / PATCH**","Modifier une donnée"],
          ["**DELETE**","Supprimer une donnée"]
        ]) +
        p("Une réponse **JSON** (`res.json(...)`) est le format d'échange standard entre un serveur et une application front-end ou mobile.") +
        h3("Se connecter à une base de données") +
        p("Avec **MongoDB** (une base NoSQL très utilisée avec Node.js), on stocke des documents proches d'objets JavaScript, via une librairie comme Mongoose.") +
        code('js', 'mongoose.connect("mongodb://localhost:27017/rh_benin");') +
        h3("Projet Node.js") +
        p("Avec ce que tu viens de voir (Express, routes, JSON), tu peux construire une API complète de gestion d'utilisateurs : lister, créer, modifier, supprimer.")
    }
  ],
  quiz:[
    {q:"Que permet Node.js de faire ?", options:["Exécuter du CSS côté serveur","Exécuter du JavaScript côté serveur","Compiler du Python","Remplacer HTML"], correct:1},
    {q:"À quoi sert npm ?", options:["À styliser une page","À gérer les modules/librairies d'un projet Node.js","À créer des bases de données","À remplacer Git"], correct:1},
    {q:"Quelle méthode HTTP utilise-t-on pour créer une nouvelle ressource ?", options:["GET","POST","DELETE","OPTIONS"], correct:1},
    {q:"Quel framework simplifie la création de serveurs et de routes en Node.js ?", options:["Django","Express","Flask","React"], correct:1}
  ]
};

const WEB_M9 = {
  id:'w-m9', title:'Module 9 · Projet fil rouge — Le Logiciel RH du Bénin', level:'Projet complet',
  chapters:[
    { id:'w9-1', title:"Le projet et son architecture globale", subtitle:"Un vrai cahier des charges : un logiciel de gestion RH pour une entreprise béninoise.",
      body:
        p("Ce module réunit **tout** ce que tu as appris : HTML/CSS/JS pour l'interface, Django pour la logique métier et la base de données, Node.js pour le temps réel — au service d'un seul projet réaliste, un logiciel de gestion des ressources humaines adapté au contexte du Bénin (CNSS, IRPP, FCFA).") +
        h3("Vue d'ensemble de l'architecture") +
        code('bash',
"UTILISATEUR FINAL (Directeur RH, Employés)\n        │\n   [Navigateur web]\n        │\n   FRONTEND — ce que l'utilisateur voit\n   • HTML  → structure de la page\n   • CSS   → apparence et design\n   • JS    → interactivité\n        │\n   [Requêtes HTTP / API]\n        │\n   BACKEND — le cerveau de l'application\n   • Django   → gestion principale, base de données, admin\n   • Node.js  → temps réel, notifications, emails\n   • Base de données → stockage des informations",
"Architecture") +
        callout('cle',"Le rôle de chaque brique", [
          "**Django** gère la logique métier centrale : employés, contrats, règles de paie, interface d'administration.",
          "**Node.js** prend en charge ce qui doit réagir instantanément : notifications, emails automatiques, tâches planifiées.",
          "**HTML/CSS/JS** forment l'interface que voit et manipule l'utilisateur final."
        ])
    },
    { id:'w9-2', title:"Le même concept, quatre langages", subtitle:"Comparer Python, Django, JavaScript et Node.js sur un exemple simple.",
      body:
        p("Django est un framework web **pour Python** ; Node.js est un environnement d'exécution **pour JavaScript**, souvent utilisé avec le framework Express. En résumé : si tu aimes Python, Django est un excellent choix pour le web ; si tu préfères JavaScript, Node.js est l'option naturelle.") +
        h3("Déclarer une variable et l'afficher, dans chaque langage") +
        code('python', 'nom = "John"\nprint(nom)', "Python") +
        code('html', '<!-- Dans le template Django -->\n{{ nom }}', "Django (template)") +
        code('js', 'let nom = "John";\nconsole.log(nom);', "JavaScript / Node.js") +
        h3("Les types de variables, comparés") +
        table(["Python","JavaScript / Node.js"],[
          ["int → `5`","Number → `5`"],
          ["float → `3.14`","Number → `3.14`"],
          ["str → `\"hello\"`","String → `\"hello\"`"],
          ["bool → `True`","Boolean → `true`"],
          ["list → `[1, 2, 3]`","Array → `[1, 2, 3]`"],
          ["dict → `{\"nom\": \"John\"}`","Object → `{nom: \"John\"}`"]
        ])
    },
    { id:'w9-3', title:"La base de données du projet", subtitle:"Le stockage permanent de toutes les informations RH.",
      body:
        code('bash', "TABLES PRINCIPALES\n├── employees        → informations des employés\n├── contracts        → contrats de travail\n├── payroll          → historique des paies\n├── leave_requests   → demandes de congé\n├── attendances      → pointages et présences\n├── departments      → départements\n├── positions        → postes et grades\n├── evaluations      → évaluations de performance\n└── users            → utilisateurs du système") +
        h3("Exemple de structure : la table employés") +
        code('sql',
"CREATE TABLE employees (\n  id SERIAL PRIMARY KEY,\n  nom VARCHAR(100) NOT NULL,\n  prenom VARCHAR(100) NOT NULL,\n  cni_number VARCHAR(50) UNIQUE,      -- Carte Nationale d'Identité\n  cnss_number VARCHAR(50) UNIQUE,     -- Numéro CNSS\n  date_naissance DATE NOT NULL,\n  telephone VARCHAR(20),\n  email VARCHAR(100) UNIQUE,\n  poste_id INTEGER REFERENCES positions(id),\n  departement_id INTEGER REFERENCES departments(id),\n  salaire_base DECIMAL(12,2),         -- en FCFA\n  date_embauche DATE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);") +
        h3("La table de paie, avec les cotisations béninoises") +
        code('sql',
"CREATE TABLE payroll (\n  id SERIAL PRIMARY KEY,\n  employee_id INTEGER REFERENCES employees(id),\n  mois INTEGER NOT NULL,\n  annee INTEGER NOT NULL,\n  salaire_brut DECIMAL(12,2),\n  cnss_employe DECIMAL(12,2),   -- 4.5%\n  cnss_employeur DECIMAL(12,2), -- 6.5%\n  irpp DECIMAL(12,2),           -- calcul progressif\n  net_a_payer DECIMAL(12,2),\n  statut VARCHAR(20) DEFAULT 'en_attente'\n);") +
        callout('astuce',"Astuce","Remarque les commentaires `-- ...` : documenter directement dans le schéma SQL les règles métier locales (taux CNSS, IRPP) évite bien des erreurs plus tard.")
    },
    { id:'w9-4', title:"Comment tout communique : trois scénarios", subtitle:"Suivre une donnée, du clic de l'utilisateur jusqu'à la base de données.",
      body:
        h3("Scénario 1 — Ajouter un nouvel employé") +
        code('bash',
"1. UTILISATEUR   → remplit le formulaire HTML\n2. JAVASCRIPT    → valide les données en temps réel\n3. JAVASCRIPT    → envoie les données à Django via une API\n4. DJANGO        → valide côté serveur, enregistre en base\n5. DJANGO        → déclenche des actions (génération du contrat)\n6. NODE.JS       → envoie un email de bienvenue (asynchrone)\n7. NODE.JS       → notifie les managers en temps réel\n8. JAVASCRIPT    → met à jour l'interface sans recharger la page") +
        h3("Scénario 2 — Calcul de la paie mensuelle") +
        code('bash',
"1. CRON JOB (Node.js) → se déclenche le 1er du mois\n2. NODE.JS             → récupère les employés actifs via l'API Django\n3. DJANGO              → fournit les données et la logique métier\n4. NODE.JS             → calcule la paie de chaque employé\n5. DJANGO              → enregistre les résultats en base\n6. NODE.JS             → génère les PDF de fiche de paie\n7. NODE.JS             → envoie les fiches par email\n8. JAVASCRIPT          → met à jour le tableau de bord en temps réel") +
        h3("Scénario 3 — Demande de congé") +
        code('bash',
"1. EMPLOYÉ    → remplit le formulaire de congé\n2. JAVASCRIPT → calcule les jours disponibles\n3. DJANGO     → valide selon les règles métier\n4. BASE DE DONNÉES → enregistre la demande\n5. NODE.JS    → notifie le manager en temps réel (WebSocket)\n6. MANAGER    → approuve ou rejette depuis l'interface\n7. DJANGO     → met à jour le statut\n8. NODE.JS    → envoie un SMS de confirmation à l'employé") +
        callout('cle',"À retenir","Dans les trois scénarios, le même schéma se répète : **Django porte la vérité et les règles métier**, **Node.js gère le temps réel et les communications**, **JavaScript côté navigateur garde l'interface réactive**.")
    },
    { id:'w9-5', title:"Construire pas à pas : le modèle Employé", subtitle:"De zéro à une vraie page qui affiche des employés depuis la base de données.",
      body:
        p("Voici l'enchaînement concret pour faire vivre la fiche employé dans le projet Django `rh_benin`, application `employees`.") +
        h4("1. Le modèle") +
        code('python',
'from django.db import models\n\nclass Employee(models.Model):\n    nom = models.CharField(max_length=100)\n    prenom = models.CharField(max_length=100)\n    poste = models.CharField(max_length=100)\n    salaire_base = models.DecimalField(max_digits=12, decimal_places=2)\n    date_embauche = models.DateField()\n\n    def __str__(self):\n        return f"{self.prenom} {self.nom}"', "employees/models.py") +
        h4("2. Les URLs") +
        code('python',
'from django.urls import path\nfrom . import views\n\napp_name = "employees"\nurlpatterns = [\n    path("", views.home, name="home"),\n    path("employees/", views.employee_list, name="employee_list"),\n    path("employees/<int:employee_id>/", views.employee_detail, name="employee_detail"),\n]', "employees/urls.py") +
        h4("3. La vue détail") +
        code('python',
'from django.shortcuts import render, get_object_or_404\nfrom .models import Employee\n\ndef employee_detail(request, employee_id):\n    employee = get_object_or_404(Employee, id=employee_id)\n    return render(request, "employees/detail.html", {"employee": employee})', "employees/views.py") +
        h4("4. Le template") +
        code('html',
'<h1>{{ employee.prenom }} {{ employee.nom }}</h1>\n<p>Poste : {{ employee.poste }}</p>\n<p>Salaire de base : {{ employee.salaire_base }} FCFA</p>\n\n<a href="{% url \'employees:employee_list\' %}">↩ Retour à la liste</a>', "employees/detail.html") +
        h4("5. Tester") +
        ul([
          "Redémarre le serveur : `python manage.py runserver`",
          "**/** → page d'accueil",
          "**/employees/** → liste des employés",
          "**/employees/1/** → détail du premier employé",
          "**/admin/** → interface d'administration"
        ]) +
        callout('astuce',"Si tu as une erreur", ["Copie le message d'erreur exact","Vérifie que chaque étape précédente a bien été suivie","Redémarre le serveur après chaque modification du code Python"])
    },
    { id:'w9-6', title:"Bilan et prochaines étapes", subtitle:"Félicitations : tu as construit la base d'un vrai système RH.",
      body:
        p("À ce stade du projet fil rouge, tu disposes déjà :") +
        checklist([
          "D'un serveur Django fonctionnel",
          "D'une base de données avec un modèle Employee",
          "D'une interface d'administration complète",
          "De pages web fonctionnelles : accueil, liste des employés, détail employé",
          "D'un design propre en CSS et d'une navigation entre les pages"
        ]) +
        h3("Pour aller plus loin") +
        ul([
          "Ajoute des données de test depuis l'admin (5-6 employés)",
          "Construis le module **payroll** (paie) avec les calculs CNSS/IRPP vus au chapitre précédent",
          "Branche Node.js pour l'envoi d'email de bienvenue à la création d'un employé",
          "Ajoute une recherche et un filtre sur la liste des employés"
        ]) +
        callout('cle',"Le mot de la fin","Tu es parti d'un `printf(\"Bonjour le monde\")` en C jusqu'à un vrai logiciel métier avec base de données, back-end et front-end connectés. C'est exactement le chemin d'un développeur web professionnel — continue de construire, un module à la fois.")
    }
  ],
  quiz:[
    {q:"Dans le projet RH, quel rôle joue principalement Django ?", options:["Le design des pages uniquement","La logique métier centrale et la base de données","L'envoi des SMS uniquement","Le stockage des images"], correct:1},
    {q:"Dans le scénario \"calcul de la paie mensuelle\", qu'est-ce qui déclenche le processus le 1er du mois ?", options:["Un clic de l'utilisateur","Un CRON JOB (Node.js)","Une requête HTML","Le fichier .gitignore"], correct:1},
    {q:"Pourquoi documenter les taux CNSS/IRPP directement en commentaire dans le schéma SQL ?", options:["Ce n'est pas utile","Pour éviter des erreurs de calcul plus tard dans le projet","Pour ralentir la base de données","Pour remplacer Django"], correct:1},
    {q:"Que fait get_object_or_404 dans la vue employee_detail ?", options:["Il crée un nouvel employé","Il récupère un employé ou affiche une erreur 404 s'il n'existe pas","Il supprime un employé","Il envoie un email"], correct:1}
  ]
};

TRACKS.push({
  id:'web', color:'web', tag:'Parcours Développeur', shortLabel:'Développeur Web',
  label:'Développeur Web — Programmation, Web & Design',
  tagline:"HTML, CSS, JavaScript, Git, C, Python, Django et Node.js : le parcours complet pour devenir développeur, du premier \"Bonjour le monde\" à un vrai logiciel métier.",
  description:"Le parcours phare de l'institut : Programmation Web, Développement mobile et Webdesign. Ce module numérique couvre en profondeur la Programmation Web (front-end, back-end, bases de données) à travers 10 modules progressifs, jusqu'à un projet complet — un logiciel de gestion RH pour une entreprise béninoise.",
  meta:["🗓️ <b>7 mois</b> de formation","💻 Programmation Web","📱 Développement mobile","🎨 Webdesign"],
  modules:[WEB_M0, WEB_M1, WEB_M2, WEB_M3, WEB_M4, WEB_M5, WEB_M6, WEB_M7, WEB_M8, WEB_M9]
});

/* ================================================================
   PARCOURS 2 — CYBERSÉCURITÉ
   ================================================================ */
const CY_M0 = {
  id:'cy-m0', title:'Module 0 · Introduction', level:'Bienvenue',
  chapters:[
    { id:'cy0-1', title:"Bienvenue dans ce cours de cybersécurité", subtitle:"Conçu pour des débutants complets — aucun prérequis technique n'est nécessaire.",
      body:
        p("Nous allons apprendre ensemble, pas à pas, les bases essentielles pour te protéger dans le monde numérique. Ce parcours ne demande aucune connaissance préalable : chaque notion est expliquée avec des mots simples et des analogies du quotidien.") +
        callout('cle',"Ce que tu vas apprendre", [
          "Comprendre ce que sont les données, les menaces et les protections de base",
          "Sécuriser ton réseau domestique, tes comptes et ta navigation",
          "Reconnaître le phishing, les malwares et les techniques de manipulation",
          "Construire des routines simples pour rester protégé au quotidien"
        ]) +
        p("La cybersécurité n'est pas une affaire d'experts : c'est une **compétence citoyenne**. Chaque geste que tu appliqueras protège non seulement tes données, mais aussi celles de tes proches et de ton entreprise.")
    }
  ]
};

const CY_M1 = {
  id:'cy-m1', title:'Module 1 · Les fondamentaux', level:'Fondations',
  chapters:[
    { id:'cy1-1', title:"Chapitre 1 — Qu'est-ce que la cybersécurité ?",
      body:
        callout('cle',"Définition simple",
          "La cybersécurité, c'est l'ensemble des techniques, outils et bonnes pratiques qui permettent de protéger tes informations, tes appareils et ta vie privée contre les attaques, les vols ou les dommages sur Internet."
        ) +
        callout('analogie',"Analogie",[
          "Imagine ta maison :",
          "Les serrures = mots de passe",
          "Les fenêtres fermées = paramètres de confidentialité",
          "L'alarme = antivirus",
          "La surveillance = veille de sécurité"
        ]) +
        h3("Les 3 objectifs fondamentaux (le triangle CIA)") +
        table(["Lettre","Signification","Explication simple"],[
          ["**C**","Confidentialité","Seules les personnes autorisées accèdent aux données"],
          ["**I**","Intégrité","Les données ne sont pas modifiées illégalement"],
          ["**A**","Disponibilité","Les données sont accessibles quand on en a besoin"]
        ])
    },
    { id:'cy1-2', title:"Chapitre 2 — Qu'est-ce qu'une donnée ?",
      body:
        p("Une **donnée** est toute information stockée ou transmise sous forme numérique : tes photos de famille, tes messages WhatsApp, tes coordonnées bancaires, ton historique de navigation, tes documents, tes identifiants de connexion.") +
        h3("Pourquoi les données ont-elles de la valeur ?") +
        table(["Pour qui ?","Pourquoi ça les intéresse"],[
          ["**Les pirates**","Revente, chantage, usurpation d'identité"],
          ["**Les entreprises**","Marketing, analyse, concurrence"],
          ["**Toi**","Souvenirs, travail, vie privée"]
        ])
    },
    { id:'cy1-3', title:"Chapitre 3 — Les types de données",
      body:
        h3("Classification par sensibilité") +
        table(["Type","Exemples","Niveau de protection"],[
          ["Publiques","Article de blog, photo publique","Basique"],
          ["Internes","Documents d'entreprise, notes personnelles","Moyen"],
          ["Confidentielles","Mot de passe, numéro de carte bancaire","Élevé"],
          ["Critiques","Données médicales, secrets d'État","Maximum"]
        ]) +
        h3("Classification par format") +
        ul(["**Texte** : emails, documents","**Multimédia** : photos, vidéos, audio","**Structurées** : bases de données, tableaux Excel","**Métadonnées** : informations sur les informations (date, lieu, appareil)"])
    },
    { id:'cy1-4', title:"Chapitre 4 — Les risques sur les données",
      body:
        h3("Les 5 grandes menaces") +
        table(["Menace","Comment ça arrive"],[
          ["**1. Vol de données**","Piratage de compte, interception de données"],
          ["**2. Fuites accidentelles**","Envoi au mauvais destinataire, perte d'appareil"],
          ["**3. Corruption / modification**","Virus, ransomware, manipulation malveillante"],
          ["**4. Indisponibilité**","Attaque DDoS, panne, suppression accidentelle"],
          ["**5. Surveillance non désirée**","Espionnage, traçage publicitaire, phishing"]
        ]) +
        callout('attention',"Statistiques à connaître",[
          "Un mot de passe faible est craqué en **moins de 10 secondes**",
          "91 % des cyberattaques commencent par un email de phishing",
          "Le coût moyen d'une fuite de données : **4,45 millions de dollars** (IBM 2023)"
        ])
    },
    { id:'cy1-5', title:"Chapitre 5 — La maintenance des données",
      body:
        h3("Les 3 règles d'or") +
        h4("1. Sauvegarde régulière — la règle 3-2-1") +
        ul(["**3** copies de tes données importantes","Sur **2** supports différents (ex : disque dur + cloud)","**1** copie stockée hors site (ex : cloud sécurisé)"]) +
        h4("2. Mise à jour constante") +
        ul(["Système d'exploitation : active les mises à jour automatiques","Applications : mets à jour dès qu'une nouvelle version est disponible","Antivirus : mises à jour quotidiennes des définitions de virus"]) +
        h4("3. Nettoyage et tri") +
        ul(["Supprime les données inutiles (moins de données = moins de risques)","Chiffre les données sensibles avant stockage cloud","Classe tes fichiers pour retrouver rapidement l'important"]) +
        h3("Checklist mensuelle") +
        checklist(["Vérifier que les sauvegardes fonctionnent","Mettre à jour tous les logiciels","Changer les mots de passe des comptes critiques","Supprimer les fichiers temporaires et caches","Vérifier les permissions des applications"])
    }
  ],
  quiz:[
    {q:"Que signifie le \"I\" du triangle CIA en cybersécurité ?", options:["Internet","Intégrité","Identité","Isolation"], correct:1},
    {q:"Quelle est la règle de sauvegarde recommandée ?", options:["1 copie sur 1 support","La règle 3-2-1 (3 copies, 2 supports, 1 hors site)","Aucune sauvegarde n'est nécessaire","Une sauvegarde annuelle suffit"], correct:1},
    {q:"En combien de temps un mot de passe faible peut-il être craqué ?", options:["En moins de 10 secondes","En 10 ans","Jamais","En 10 jours"], correct:0},
    {q:"Quel type de donnée nécessite le niveau de protection maximum ?", options:["Une photo de profil publique","Un article de blog","Des données médicales","Une note personnelle"], correct:2}
  ]
};

const CY_M2 = {
  id:'cy-m2', title:'Module 2 · Sécuriser son réseau et sa vie privée', level:'Protection',
  chapters:[
    { id:'cy2-1', title:"Chapitre 6 — Protection des données et du réseau",
      body:
        h3("Protection des données : les 5 piliers") +
        table(["Pilier","En pratique"],[
          ["**Chiffrement**","Transforme tes données en code illisible sans clé — ex : BitLocker (Windows), FileVault (Mac), VeraCrypt"],
          ["**Contrôle d'accès**","Qui peut voir / modifier / supprimer ? Applique le principe du moindre privilège"],
          ["**Politiques de sécurité**","Des règles claires (ex : \"pas de mots de passe simples\")"],
          ["**Formation et sensibilisation**","Tu es le premier rempart ! Apprends à reconnaître les menaces"],
          ["**Solutions techniques**","Antivirus, pare-feu, détection d'intrusion"]
        ]) +
        h3("Sécuriser sa Box Internet") +
        checklist([
          "Changer le mot de passe admin de la box (pas celui du WiFi !)",
          "Utiliser WPA3 ou WPA2 pour le WiFi (jamais WEP)",
          "Créer un réseau \"Invités\" pour les visiteurs",
          "Désactiver le WPS (vulnérable aux attaques)",
          "Mettre à jour le firmware de la box régulièrement"
        ]) +
        h3("Bonnes pratiques réseau") +
        ul(["Active le pare-feu de ton système","Évite les réseaux WiFi publics pour les opérations sensibles","Utilise un VPN sur les réseaux non fiables","Désactive le partage de fichiers quand il n'est pas utile"])
    },
    { id:'cy2-2', title:"Chapitre 7 — Protéger sa confidentialité en ligne",
      body:
        h3("Ce que tu exposes sans le savoir") +
        ul(["Ta localisation (photos, apps, navigation)","Tes centres d'intérêt (likes, recherches, achats)","Tes relations (contacts, amis, interactions)","Tes habitudes (heures de connexion, appareils utilisés)"]) +
        h3("10 actions immédiates pour plus de confidentialité") +
        checklist([
          "Vérifier les permissions des apps (Paramètres → Applications → Autorisations)",
          "Nettoyer son historique (navigation privée + suppression régulière)",
          "Activer la double authentification (2FA) sur tous les comptes",
          "Utiliser un email \"poubelle\" pour les inscriptions non importantes",
          "Limiter le partage sur les réseaux sociaux (profils \"Privé\" par défaut)",
          "Utiliser un moteur respectueux : DuckDuckGo, Qwant",
          "Installer un bloqueur de publicités : uBlock Origin",
          "Chiffrer ses messages : WhatsApp, Signal (chiffrement de bout en bout)",
          "Supprimer les comptes inutilisés (AccountKiller.com)",
          "Vérifier les apps en arrière-plan et désactiver celles qui collectent sans nécessité"
        ]) +
        h3("Réglages essentiels par plateforme") +
        table(["Plateforme","À vérifier"],[
          ["**Facebook / Instagram**","Qui peut voir vos publications → \"Amis\" · Qui peut vous trouver → \"Amis d'amis\" max · Désactiver le ciblage publicitaire"],
          ["**Gmail**","Historique des positions → désactiver si inutile · Vérification en deux étapes → activer impérativement"]
        ])
    },
    { id:'cy2-3', title:"Chapitre 8 — La navigation sur Internet",
      body:
        h3("Ce qui se passe quand tu navigues") +
        code('bash',
"Tu tapes \"www.banque.com\"\n     ↓\nTon ordinateur demande l'adresse au DNS (l'annuaire d'Internet)\n     ↓\nLe serveur du site t'envoie sa page\n     ↓\nTon navigateur affiche la page + exécute les scripts\n     ↓\nDes cookies et traceurs peuvent être déposés sur ton appareil") +
        h3("Les dangers de la navigation") +
        table(["Danger","Comment se protéger"],[
          ["**Phishing** — faux sites imitant les vrais","URL suspecte, fautes d'orthographe, urgence artificielle : vérifie toujours l'adresse"],
          ["**Traqueurs publicitaires**","Firefox + extensions Privacy Badger et uBlock Origin"],
          ["**Drive-by download** — malware juste en visitant un site compromis","Navigateur à jour + antivirus, ne pas cliquer n'importe où"],
          ["**Connexions non sécurisées** (HTTP sans \"S\")","Vérifier toujours \"https://\" et le cadenas dans la barre d'adresse"]
        ]) +
        h3("Checklist de navigation sécurisée") +
        checklist([
          "Utiliser un navigateur moderne et à jour",
          "Installer uBlock Origin, HTTPS Everywhere, Privacy Badger",
          "Vérifier le cadenas et l'URL exacte (attention aux fautes : \"g00gle.com\")",
          "Navigation privée pour les recherches sensibles",
          "Ne jamais enregistrer les mots de passe dans le navigateur",
          "Fermer les sessions après utilisation sur un ordinateur partagé"
        ])
    },
    { id:'cy2-4', title:"Chapitre 13 — L'adresse IP", subtitle:"Ton \"numéro de téléphone\" sur Internet.",
      body:
        callout('cle',"Définition simple","Une adresse IP est une série de chiffres qui identifie de façon unique chaque appareil connecté à un réseau (comme Internet)."),
      // suite ajoutée ci-dessous
    }
  ]
};
CY_M2.chapters[3].body +=
  h3("Deux types d'adresses IP") +
  table(["Type","Caractéristiques"],[
    ["**IP publique**","Visible depuis Internet · attribuée par ton fournisseur d'accès · peut changer (dynamique) ou être fixe · ex : 41.202.219.15"],
    ["**IP privée (locale)**","Utilisée uniquement dans ton réseau domestique · attribuée par ta box · plages réservées : 192.168.x.x, 10.x.x.x · ex : 192.168.1.25"]
  ]) +
  callout('analogie',"Analogie postale",[
    "IP publique = l'adresse de ton immeuble (visible par tous)",
    "IP privée = ton numéro d'appartement (seulement pour les résidents)",
    "Le routeur (NAT) = le gardien qui fait le tri et distribue le courrier"
  ]) +
  h3("Pourquoi c'est important en sécurité") +
  table(["Ce qu'un attaquant peut faire","Ce que tu peux faire"],[
    ["Localiser approximativement ta région via l'IP publique","Masquer ton IP avec un VPN"],
    ["Scanner ton IP pour trouver des services vulnérables","Configurer ton pare-feu pour rejeter les connexions non sollicitées"],
    ["Te cibler avec des attaques DDoS","Surveiller les logs pour repérer les scans suspects"]
  ]) +
  h3("Voir son adresse IP") +
  code('bash', "# IP publique : va sur \"mon-ip.com\"\n\n# IP privée (Windows) :\nipconfig\n\n# IP privée (Mac / Linux) :\nifconfig\nip a");

CY_M2.chapters.push(
  { id:'cy2-5', title:"Chapitre 14 — Ports réseau et scan de ports", subtitle:"Chaque service utilise une porte d'entrée logique différente.",
    body:
      callout('analogie',"Définition","Un **port** est comme une porte d'entrée logique sur ton appareil. Chaque service en utilise un spécifique.") +
      table(["Port","Service"],[
        ["**80 / 443**","Navigation web (HTTP / HTTPS)"],
        ["**25 / 587**","Envoi d'emails (SMTP)"],
        ["**110 / 995**","Réception d'emails (POP3)"],
        ["**21 / 22**","Transfert de fichiers (FTP / SFTP)"],
        ["**3389**","Bureau à distance (RDP)"]
      ]) +
      p("Un port ouvert = une porte potentiellement accessible depuis l'extérieur. Si le service derrière est mal configuré ou vulnérable, c'est une entrée pour les attaquants — par exemple, un port 3389 (RDP) ouvert avec un mot de passe faible peut permettre une prise de contrôle totale.") +
      h3("Scanner ses propres ports (légalement)") +
      code('bash', "# Scanner sa propre machine locale :\nnmap 127.0.0.1\n\n# Scanner un appareil du réseau :\nnmap 192.168.1.30\n\n# Scanner son IP publique (depuis l'extérieur) :\nnmap -Pn votre.ip.publique") +
      ul(["**open** → port accessible, à vérifier","**closed** → port fermé, tout va bien","**filtered** → port bloqué par le pare-feu, généralement bon signe"]) +
      h3("Ports courants à surveiller") +
      table(["Port","Service","Action recommandée"],[
        ["21","FTP (non chiffré)","Fermer ou remplacer par SFTP"],
        ["23","Telnet","FERMER impérativement (remplacer par SSH)"],
        ["3389","Bureau à distance","Restreindre par IP ou utiliser un VPN"],
        ["1433 / 3306 / 5432","Bases de données","Ne jamais exposer directement sur Internet"],
        ["22","SSH","OK si nécessaire, utiliser des clés + désactiver root"]
      ])
  },
  { id:'cy2-6', title:"Chapitre 12 — Les appliances de sécurité", subtitle:"Les gardiens matériels et logiciels de ton réseau.",
    body:
      callout('cle',"Définition","Une **appliance de sécurité** est un appareil (matériel ou logiciel) spécialisé dans la protection d'un réseau ou d'un système.") +
      h3("Pour la maison / une petite structure") +
      ul([
        "**Pare-feu intégré à la box** : filtre le trafic entrant/sortant — souvent activé par défaut, ne le désactive pas",
        "**Routeur sécurisé avec fonctions avancées** (ex : filtrage de contenu, détection d'intrusion basique)",
        "**Appliance tout-en-un** pour petites structures (gestion centralisée, VPN intégré)"
      ]) +
      h3("Pour les entreprises") +
      ul([
        "**Pare-feu nouvelle génération (NGFW)** — ex : pfSense (gratuit), FortiGate",
        "**IDS/IPS** : surveille le trafic pour repérer les attaques en temps réel",
        "**Passerelle de sécurité web/email** : filtre les sites malveillants et le phishing avant qu'ils n'arrivent"
      ]) +
      h3("Configuration minimale d'un pare-feu domestique") +
      checklist([
        "Activer le filtrage SPI (Stateful Packet Inspection)",
        "Désactiver l'administration à distance (WAN)",
        "Bloquer les ports inutiles",
        "Activer les logs pour surveiller les tentatives d'intrusion",
        "Mettre à jour régulièrement le firmware"
      ]) +
      callout('astuce',"Conseil débutant","Commence par bien configurer ta box actuelle avant d'investir dans du matériel dédié : pour un usage familial classique, c'est largement suffisant.")
  }
);
CY_M2.quiz = [
  {q:"Que signifie WPA3 par rapport au WiFi ?", options:["Le nom du routeur","Un protocole de sécurisation du WiFi, à privilégier (jamais WEP)","Un antivirus","Un type de câble réseau"], correct:1},
  {q:"Quelle est la différence entre IP publique et IP privée ?", options:["Aucune différence","L'IP publique est visible depuis Internet, l'IP privée reste dans le réseau local","L'IP privée change tout le temps","L'IP publique ne sert à rien"], correct:1},
  {q:"Que signifie un port marqué \"filtered\" lors d'un scan Nmap ?", options:["Le port est piraté","Le port est bloqué par le pare-feu — généralement bon signe","Le port est ouvert à tous","Le port n'existe pas"], correct:1},
  {q:"Avant d'investir dans une appliance de sécurité dédiée, que recommande le cours pour un usage familial classique ?", options:["Acheter plusieurs pare-feux","Bien configurer sa box actuelle","Désactiver le pare-feu","Ouvrir tous les ports"], correct:1}
];

const CY_M3 = {
  id:'cy-m3', title:'Module 3 · Comprendre les menaces', level:'Menaces',
  chapters:[
    { id:'cy3-1', title:"Chapitre 9 — Vulnérabilité, exploit, attaque",
      body:
        table(["Terme","Définition","Exemple"],[
          ["**Vulnérabilité**","Une faille, une faiblesse dans un logiciel ou système","Un programme qui accepte n'importe quel mot de passe"],
          ["**Exploit**","Le code ou la technique qui utilise cette faille pour attaquer","Un script qui profite de la faille pour prendre le contrôle"],
          ["**Attaque**","L'action réelle de l'exploit contre une cible",""]
        ]) +
        callout('analogie',"Analogie maison",[
          "Vulnérabilité = une fenêtre mal fermée",
          "Exploit = la technique pour ouvrir cette fenêtre sans casser",
          "Attaque = le cambrioleur qui entre par cette fenêtre"
        ]) +
        h3("Exemples célèbres") +
        table(["Faille","Type","Leçon"],[
          ["**Heartbleed** (2014)","Faille dans OpenSSL, vol de mots de passe et clés privées","Mettre à jour les bibliothèques critiques"],
          ["**WannaCry** (2017)","Exploit Windows non corrigé, ransomware mondial","Appliquer les correctifs de sécurité rapidement"],
          ["**Log4Shell** (2021)","Faille Java, prise de contrôle à distance","Surveiller les dépendances logicielles"]
        ]) +
        h3("Comment se protéger ?") +
        ul(["**Mises à jour** : la protection n°1 contre les exploits connus","**Antivirus / EDR** : détecte les comportements suspects","**Principe du moindre privilège** : limite les dégâts si une faille est exploitée","**Veille** : suivre les annonces de vulnérabilités (ANSSI, CERT)"])
    },
    { id:'cy3-2', title:"Chapitre 10 — Les malwares et leurs symptômes",
      body:
        callout('cle',"Définition","**Malware** = \"Malicious Software\" = logiciel malveillant conçu pour nuire.") +
        h3("Les 8 grandes familles") +
        table(["Famille","Comment ça agit","Symptômes"],[
          ["**Virus**","S'attache à un fichier légitime, se propage à l'exécution","Fichiers corrompus, ralentissements"],
          ["**Ver (worm)**","Se propage seul via le réseau, sans action de l'utilisateur","Réseau lent, envoi automatique de messages"],
          ["**Cheval de Troie**","Se fait passer pour un logiciel utile","Nouveau logiciel inconnu, activité suspecte"],
          ["**Ransomware**","Chiffre tes fichiers et demande une rançon","Fichiers inaccessibles, message de rançon"],
          ["**Spyware**","Espionne tes activités à ton insu","Publicités ciblées étranges, batterie qui se vide vite"],
          ["**Keylogger**","Enregistre tout ce que tu tapes","Comptes piratés sans phishing visible"],
          ["**Bot / Botnet**","Transforme ton appareil en \"zombie\"","Activité réseau anormale, appareil qui chauffe"],
          ["**Adware / Cryptominer**","Pubs intrusives ou minage de cryptomonnaie","Pop-ups incessants, ventilateur à fond"]
        ]) +
        h3("Reconnaître une infection") +
        checklist(["L'antivirus se désactive tout seul","Des fenêtres publicitaires apparaissent même hors navigateur","La page d'accueil a changé sans ton accord","L'ordinateur est anormalement lent","Message de rançon à l'écran"]) +
        h3("Que faire en cas de suspicion ?") +
        ul([
          "**Déconnecte** immédiatement l'appareil d'Internet (WiFi + câble)",
          "**Ne paye jamais** de rançon (aucune garantie de récupération)",
          "**Analyse** complètement avec un antivirus à jour",
          "**Utilise** un outil spécialisé (Malwarebytes, AdwCleaner)",
          "**Restaure** depuis une sauvegarde propre si nécessaire",
          "**Change** tous tes mots de passe depuis un appareil sain",
          "**Porte plainte** en cas de vol de données sensibles"
        ])
    },
    { id:'cy3-3', title:"Chapitre 15 — Le déroulement d'une cyberattaque", subtitle:"Comprendre le cycle de vie complet pour mieux couper l'attaque en route.",
      body:
        h3("Les 7 étapes du cycle de vie d'une attaque") +
        table(["Étape","Ce qui se passe"],[
          ["**1. Repérage**","L'attaquant collecte des infos : email, réseaux sociaux, technologies utilisées"],
          ["**2. Préparation**","Création de l'arme : email de phishing, malware personnalisé"],
          ["**3. Livraison**","Envoi de l'attaque : email, pièce jointe, lien, USB infecté"],
          ["**4. Exploitation**","L'attaque réussit : tu cliques, exécutes, ou la faille est exploitée"],
          ["**5. Installation**","Installation d'une backdoor, d'un keylogger, d'un ransomware…"],
          ["**6. Command & Control**","L'attaquant prend le contrôle à distance"],
          ["**7. Actions sur objectifs**","Vol de données, chiffrement pour rançon, espionnage…"]
        ]) +
        h3("Exemple concret : phishing + ransomware") +
        ul([
          "Un email : \"URGENT : votre compte sera suspendu dans 24h\", au ton professionnel",
          "Tu cliques sur \"Vérifier mon compte\" → faux site identique à la banque",
          "Tu entres tes identifiants → l'attaquant les récupère",
          "En parallèle, un téléchargement silencieux installe un ransomware",
          "Le ransomware chiffre tes fichiers, un message réclame une rançon en Bitcoin"
        ]) +
        h3("Couper le cycle : les points de rupture") +
        table(["Au niveau","Comment couper"],[
          ["Repérage","Limiter les infos personnelles publiques sur les réseaux sociaux"],
          ["Livraison","Se former à reconnaître le phishing, filtrage email anti-phishing"],
          ["Exploitation","Mises à jour systématiques, principe du moindre privilège"],
          ["Action","Sauvegardes régulières et testées, détection comportementale"]
        ]) +
        callout('attention',"Réflexe","En cas de doute sérieux pendant une attaque (souris qui bouge seule, processus inconnus, rançon à l'écran) : déconnecte immédiatement l'appareil du réseau.")
    },
    { id:'cy3-4', title:"Chapitre 16 — La sécurité comportementale", subtitle:"Tu es le maillon fort — ou le maillon faible. L'ingénierie sociale cible l'humain, pas la machine.",
      body:
        callout('attention',"Statistique clé","74% des violations de données impliquent un élément humain (rapport Verizon DBIR). Le pirate ne contourne pas toujours la technique : il persuade, manipule, profite de la confiance ou de la fatigue.") +
        h3("Les 5 pièges psychologiques") +
        table(["Piège","Exemple","Réflexe"],[
          ["**Urgence artificielle**","\"Votre compte sera supprimé dans 1 heure !\"","Prendre 30 secondes pour vérifier l'expéditeur et le lien"],
          ["**Curiosité / appât**","\"Vous avez gagné un iPhone ! Cliquez ici\"","Si c'est trop beau pour être vrai… c'est faux"],
          ["**Autorité / confiance**","Email semblant venir du DG ou de la banque","Vérifier l'adresse exacte, appeler par un canal connu"],
          ["**Sympathie / empathie**","\"Je suis en difficulté, aide-moi\" (faux collègue)","Confirmer l'identité par un autre moyen"],
          ["**Réciprocité**","\"Merci de confirmer réception de ce document\"","Ne pas répondre aux demandes non sollicitées"]
        ]) +
        h3("10 règles d'or de sécurité comportementale") +
        checklist([
          "Toujours vérifier l'expéditeur d'un email (adresse complète, pas juste le nom affiché)",
          "Ne jamais cliquer sur un lien sans survoler pour voir l'URL réelle",
          "Ne jamais ouvrir une pièce jointe inattendue, même d'un contact connu",
          "Toujours douter des messages créant un sentiment d'urgence",
          "Confirmer par un autre canal toute demande sensible",
          "Ne jamais communiquer de mot de passe, même à un faux \"support technique\"",
          "Verrouiller sa session (Windows+L) dès qu'on quitte son poste",
          "Ne pas utiliser son compte administrateur pour la navigation quotidienne",
          "Signaler tout comportement suspect",
          "Accepter de dire \"non\" ou \"je vérifie\" sans gêne"
        ]) +
        h3("Exercice pratique") +
        p("Tu reçois un email de **support@netfIix-secure.com** (remarque le \"I\" majuscule à la place du \"l\"), objet \"Action requise : mise à jour de votre moyen de paiement\", te pressant de cliquer avant 24h.") +
        ul(["**Premier indice de phishing ?** → Le domaine est suspect (netfIix-secure.com ≠ netflix.com)","**Que faire ?** → Ne pas cliquer, aller directement sur netflix.com via ton navigateur","**Que signaler ?** → L'email comme phishing à ton fournisseur de messagerie"]) +
        callout('astuce',"Bon réflexe","Toujours taper l'URL toi-même plutôt que de cliquer sur un lien reçu par email.")
    }
  ],
  quiz:[
    {q:"Quelle est la différence entre une vulnérabilité et un exploit ?", options:["Aucune différence","La vulnérabilité est la faille, l'exploit est la technique qui l'utilise","L'exploit est toujours légal","La vulnérabilité est un logiciel"], correct:1},
    {q:"Quel type de malware chiffre tes fichiers et réclame une rançon ?", options:["Spyware","Ransomware","Adware","Keylogger"], correct:1},
    {q:"À quelle étape du cycle d'une cyberattaque l'attaquant collecte-t-il des informations sur sa cible ?", options:["Installation","Repérage (reconnaissance)","Command & Control","Action sur objectifs"], correct:1},
    {q:"Quel piège psychologique utilise la phrase \"Votre compte sera supprimé dans 1 heure\" ?", options:["La réciprocité","L'urgence artificielle","La sympathie","L'autorité"], correct:1}
  ]
};

const CY_M4 = {
  id:'cy-m4', title:'Module 4 · Se défendre au quotidien', level:'Pratique',
  chapters:[
    { id:'cy4-1', title:"Chapitre 11 — Les mots de passe : ta première ligne de défense",
      body:
        callout('attention',"À savoir","81% des piratages de comptes utilisent des mots de passe faibles ou volés (Verizon DBIR 2023).") +
        h3("Les 5 erreurs fatales à éviter") +
        ul([
          "\"123456\", \"password\", \"azerty\" → craqués en moins d'1 seconde",
          "Utiliser le même mot de passe partout → une fuite compromet tous tes comptes",
          "Le noter sur un post-it sous le clavier",
          "Utiliser des infos personnelles devinables (date de naissance, nom de l'animal)",
          "Ne jamais les changer"
        ]) +
        h3("Créer un mot de passe fort") +
        h4("Méthode 1 : la phrase de passe (recommandée)") +
        code('bash', "Chaise-Violet-Pluie-Trompette-2024!") +
        p("4-5 mots aléatoires assemblés : facile à retenir, très long donc très difficile à craquer, résiste aux attaques par dictionnaire.") +
        h4("Méthode 2 : l'acronyme personnalisé") +
        p("Prends une phrase que tu aimes (\"Mon premier voyage à Cotonou était en décembre 2019 !\"), garde les premières lettres + chiffres + symbole :") +
        code('bash', "MpvàCéed2019!") +
        h3("Le gestionnaire de mots de passe : indispensable") +
        p("Impossible de retenir 50 mots de passe uniques et complexes. Un gestionnaire les stocke chiffrés derrière un seul master password, en génère de nouveaux automatiquement, et remplit tes formulaires de connexion.") +
        table(["Gestionnaire","Points forts"],[
          ["**Bitwarden**","Open-source, gratuit complet, toutes plateformes"],
          ["**KeePassXC**","Stockage local (pas de cloud), très sécurisé"],
          ["**Proton Pass**","Intégré à l'écosystème Proton, axé confidentialité"]
        ]) +
        h3("L'authentification à deux facteurs (2FA)") +
        callout('cle',"Le principe","Ce que tu SAIS (mot de passe) + ce que tu POSSÈDES (téléphone, clé de sécurité) = un compte 100x plus sécurisé.") +
        table(["Méthode 2FA","Niveau de sécurité"],[
          ["Clé de sécurité physique (YubiKey)","Protection maximale contre le phishing"],
          ["Application d'authentification (Authy, Google Authenticator)","Très bon compromis"],
          ["SMS","Mieux que rien, mais vulnérable au SIM swapping"],
          ["Email de validation","Peu sécurisé, à éviter si possible"]
        ]) +
        p("Active la 2FA en **priorité** sur : email principal, banque, réseaux sociaux, cloud de sauvegarde.")
    },
    { id:'cy4-2', title:"Chapitre 17 — Guide sur la sécurité : checklist opérationnelle",
      body:
        h3("Routine hebdomadaire") +
        table(["Jour","Action"],[
          ["**Lundi**","Vérifier les mises à jour (système, navigateur, antivirus)"],
          ["**Mardi**","Nettoyage numérique : emails suspects, cache, applications inutilisées"],
          ["**Mercredi**","Vérifier les dernières connexions sur les comptes importants"],
          ["**Jeudi**","Vérifier la sauvegarde automatique, tester une restauration"],
          ["**Vendredi**","Lire une actualité sécurité, noter une bonne pratique à appliquer"],
          ["**Week-end**","Pause numérique, réflexion sur les infos partagées dans la semaine"]
        ]) +
        h3("Avant toute action sensible") +
        checklist([
          "Avant de se connecter à un compte important : réseau de confiance, \"https://\" vérifié",
          "Avant un paiement en ligne : réputation du site vérifiée, capture de la confirmation gardée",
          "Avant d'ouvrir une pièce jointe : expéditeur légitime, extension sûre, scan VirusTotal si doute",
          "Avant d'envoyer des données sensibles : bon destinataire vérifié caractère par caractère, canal sécurisé"
        ]) +
        h3("Plan de réaction en cas d'incident (à garder sous la main)") +
        table(["Étape","Action"],[
          ["**1. Isoler**","Déconnecter l'appareil du réseau, éteindre si infection active"],
          ["**2. Évaluer**","Quel type d'incident ? Quelles données sont potentiellement touchées ?"],
          ["**3. Contenir**","Changer les mots de passe critiques depuis un appareil sain"],
          ["**4. Réparer**","Analyse antivirus complète, restauration depuis sauvegarde propre"],
          ["**5. Apprendre**","Noter ce qui a permis l'incident, mettre à jour ses procédures"]
        ])
    },
    { id:'cy4-3', title:"Chapitre 18 — Les outils de prévention et de détection",
      body:
        h3("Prévention") +
        table(["Catégorie","Outils gratuits"],[
          ["**Antivirus**","Windows Defender (intégré, très bon), Bitdefender Free"],
          ["**Pare-feu**","Pare-feu Windows/Mac (activé par défaut — ne pas le désactiver)"],
          ["**Navigation**","Firefox ou Brave + uBlock Origin, Privacy Badger + DuckDuckGo"],
          ["**Mots de passe**","Bitwarden, KeePassXC"],
          ["**Chiffrement**","VeraCrypt, BitLocker (Windows Pro), FileVault (Mac)"]
        ]) +
        h3("Détection") +
        table(["Besoin","Outil"],[
          ["Analyser un fichier suspect","VirusTotal.com (scanne avec 70+ antivirus)"],
          ["Vérifier une fuite de données","HaveIBeenPwned.com"],
          ["Scanner son réseau WiFi","Fing (application mobile)"],
          ["Surveillance réseau avancée","Wireshark (technique, pour progresser)"]
        ]) +
        h3("La stack minimale recommandée pour débuter") +
        checklist([
          "Windows Defender + pare-feu activé",
          "Firefox + uBlock Origin + Privacy Badger",
          "Bitwarden pour les mots de passe",
          "Sauvegarde automatique sur disque externe + cloud chiffré",
          "HaveIBeenPwned en favori pour des vérifications ponctuelles"
        ]) +
        callout('attention',"Pièges à éviter",[
          "Installer plusieurs antivirus en même temps → conflits, ralentissements",
          "Télécharger des \"optimisateurs système\" ou \"nettoyeurs de registre\" → souvent des arnaques",
          "Utiliser des outils crackés ou non officiels → risque de malware intégré"
        ])
    },
    { id:'cy4-4', title:"Chapitre 19 — L'hygiène informatique au quotidien",
      body:
        callout('analogie',"Analogie santé","La cybersécurité, c'est comme l'hygiène personnelle : de petits gestes répétés régulièrement, plutôt qu'un grand nettoyage une fois par an.") +
        h3("La checklist \"avant de quitter son poste\"") +
        checklist([
          "Verrouiller la session (Windows+L)",
          "Fermer les onglets contenant des données sensibles",
          "Déconnecter les clés USB / disques externes",
          "Éteindre ou mettre en veille les appareils non utilisés",
          "Vérifier qu'aucun document confidentiel n'est visible à l'écran"
        ]) +
        h3("Hygiène mobile : smartphone et tablette") +
        table(["Domaine","Bons réflexes"],[
          ["**Applications**","Installer uniquement depuis les stores officiels · vérifier les permissions demandées · désinstaller les apps inutilisées"],
          ["**Batterie / performance**","Une batterie qui se vide anormalement vite peut indiquer un malware en arrière-plan"],
          ["**Connexions**","Désactiver Bluetooth/WiFi quand non utilisés · éviter le WiFi public pour les opérations sensibles"],
          ["**Verrouillage**","Code PIN / biométrie activé · verrouillage automatique après 30 secondes"]
        ])
    },
    { id:'cy4-5', title:"Chapitre 20 — La veille en sécurité", subtitle:"Rester informé pour rester protégé : le paysage des menaces évolue chaque jour.",
      body:
        p("La veille sert à **anticiper plutôt que subir**, à adapter ses défenses avant d'être touché, et à gagner en sérénité numérique.") +
        h3("3 niveaux progressifs de veille") +
        table(["Niveau","Effort","Exemples"],[
          ["**1. Veille passive**","5 min/semaine","S'abonner aux newsletters ANSSI, CERT-FR, HaveIBeenPwned"],
          ["**2. Veille active**","15-30 min/semaine","Lire des articles de vulgarisation, écouter un podcast sécurité"],
          ["**3. Veille communautaire**","Pour aller plus loin","Rejoindre des forums (r/cybersecurity), partager une astuce apprise"]
        ]) +
        h3("Organiser sa veille") +
        ul(["Un agrégateur de flux RSS (Feedly) avec un dossier \"Cybersécurité\"","Des alertes Google sur des mots-clés précis","Un espace de notes (Notion, Obsidian) pour se constituer une base de connaissances","20 minutes chaque vendredi, et une action concrète notée pour la semaine suivante"])
    }
  ],
  quiz:[
    {q:"Quelle méthode de création de mot de passe est recommandée dans ce cours ?", options:["Un mot simple suivi d'un chiffre","La phrase de passe (plusieurs mots aléatoires assemblés)","Le nom de son animal","La même date partout"], correct:1},
    {q:"Que combine l'authentification à deux facteurs (2FA) ?", options:["Deux mots de passe identiques","Ce que tu sais (mot de passe) et ce que tu possèdes (téléphone, clé)","Deux comptes email","Deux antivirus"], correct:1},
    {q:"Que faut-il éviter absolument concernant les antivirus ?", options:["Les mettre à jour","En installer plusieurs en même temps sur le même appareil","Les utiliser gratuitement","Les désinstaller quand ils sont inutiles"], correct:1},
    {q:"Combien de temps par semaine suffit pour une veille de sécurité \"passive\" ?", options:["Aucun temps n'est nécessaire","Environ 5 minutes","3 heures","Une journée complète"], correct:1}
  ]
};

const CY_M5 = {
  id:'cy-m5', title:'Module 5 · Conclusion et feuille de route', level:'Bilan',
  chapters:[
    { id:'cy5-1', title:"Ton parcours de progression sur 3 mois",
      body:
        h3("Mois 1 — Les fondamentaux") +
        checklist([
          "Installer un gestionnaire de mots de passe + changer 5 mots de passe critiques",
          "Activer la 2FA sur l'email principal et les réseaux sociaux",
          "Vérifier que les sauvegardes automatiques fonctionnent",
          "Installer uBlock Origin + Privacy Badger sur son navigateur"
        ]) +
        h3("Mois 2 — Approfondissement") +
        checklist([
          "Scanner ses ports ouverts et fermer les inutiles",
          "Former son entourage à reconnaître le phishing (partager ce cours !)",
          "Tester la restauration d'une sauvegarde",
          "S'abonner à 2 sources de veille sécurité"
        ]) +
        h3("Mois 3 — Autonomie et partage") +
        checklist([
          "Réaliser un audit personnel complet avec la checklist du module 4",
          "Mettre en place une routine hebdomadaire de maintenance",
          "Contribuer à la communauté (signaler, aider, partager)",
          "Définir ses prochains objectifs (ex : apprendre les bases du chiffrement)"
        ]) +
        callout('cle',"Rappel essentiel","Il n'existe pas de \"protection absolue\", mais chaque geste compte : tu rends l'attaque plus difficile, plus longue, plus coûteuse pour l'attaquant. L'objectif n'est pas la paranoïa, mais la vigilance raisonnée.") +
        p("*\"Je ne peux pas tout contrôler, mais je peux rendre ma vie numérique dix fois plus difficile à attaquer que celle de mon voisin. Et ça, c'est déjà une énorme victoire.\"*") +
        h3("Pour continuer à apprendre") +
        ul(["**Cours en ligne** : OpenClassrooms \"Sécurisez votre vie numérique\", guides pratiques ANSSI","**Lectures** : \"La cybersécurité pour les Nuls\", guide ANSSI \"Les 12 règles d'or\"","**Outils à tester** : Bitwarden, Malwarebytes Free, HaveIBeenPwned, DuckDuckGo"]) +
        callout('astuce',"Le mot de la fin","Tu n'es plus un \"débutant complet\" : tu es un utilisateur averti. Continue à apprendre, à partager, à protéger — la cybersécurité est un processus, pas un produit.")
    }
  ]
};

TRACKS.push({
  id:'cyber', color:'cyber', tag:'Parcours Sécurité', shortLabel:'Cybersécurité',
  label:'Cybersécurité — Se protéger dans le monde numérique',
  tagline:"Un cours complet et pédagogique, pensé pour les débutants complets : aucun prérequis technique n'est nécessaire.",
  description:"20 chapitres regroupés en 5 modules progressifs : des fondamentaux (données, risques) à la défense au quotidien (mots de passe, checklist, veille), en passant par la sécurisation du réseau et la compréhension des menaces (malwares, ingénierie sociale, anatomie d'une attaque).",
  meta:["🛡️ Pour tout niveau","🎯 Aucun prérequis technique","📅 Feuille de route sur 3 mois"],
  modules:[CY_M0, CY_M1, CY_M2, CY_M3, CY_M4, CY_M5]
});

/* ================================================================
   PARCOURS 3 — LABO PRATIQUE : VIRTUALBOX & KALI LINUX
   ================================================================ */
const LAB_M1 = {
  id:'lab-m1', title:'Module 1 · Comprendre la virtualisation', level:'Fondations',
  chapters:[
    { id:'lab1-1', title:"Qu'est-ce que VirtualBox ?", subtitle:"Faire tourner un ordinateur à l'intérieur de ton ordinateur.",
      body:
        callout('cle',"Définition simple","Oracle VM VirtualBox est un programme qui crée des **machines virtuelles (VM)**. Une machine virtuelle, c'est un ordinateur simulé à l'intérieur de ton ordinateur réel.") +
        callout('analogie',"Analogie", [
          "Ton PC devient comme un immeuble.",
          "Le matériel réel = le terrain",
          "VirtualBox = le constructeur",
          "Les machines virtuelles = les appartements",
          "Chaque système (Windows, Linux…) = un locataire"
        ]) +
        h3("À quoi ça sert concrètement ?") +
        table(["Usage","Exemple"],[
          ["**Tester un système d'exploitation**","Découvrir Linux sans formater son PC : on l'installe dans VirtualBox"],
          ["**Tester des logiciels risqués**","Un programme douteux tourne dans la VM, le vrai PC reste protégé"],
          ["**Formation et apprentissage**","Très utilisé pour les réseaux, la cybersécurité, l'administration système, le développement"],
          ["**Environnements isolés**","Chaque VM est séparée du système principal"]
        ]) +
        h3("Comment ça fonctionne ?") +
        p("VirtualBox utilise le processeur, la RAM et le disque dur de ton PC réel, et les partage avec la machine virtuelle. Exemple : ton PC a 8 Go de RAM → tu en donnes 2 Go à la VM → elle fonctionne comme un vrai ordinateur avec 2 Go.") +
        h3("Le vocabulaire de VirtualBox") +
        table(["Élément","Rôle"],[
          ["**Machine virtuelle**","L'ordinateur simulé"],
          ["**ISO**","Le fichier d'installation du système"],
          ["**Disque virtuel (VDI)**","Le disque dur de la VM"],
          ["**Snapshot**","Une photo de l'état de la VM, pour revenir en arrière"]
        ]) +
        callout('cle',"Résumé ultra simple","VirtualBox = un logiciel gratuit qui transforme ton PC en plusieurs PC virtuels. Idéal pour apprendre, tester, et sécuriser tes expérimentations sans jamais casser ton vrai système.")
    }
  ],
  quiz:[
    {q:"Qu'est-ce qu'une machine virtuelle (VM) ?", options:["Un antivirus","Un ordinateur simulé à l'intérieur d'un ordinateur réel","Un type de câble réseau","Un navigateur web"], correct:1},
    {q:"À quoi sert un fichier ISO dans VirtualBox ?", options:["C'est le disque dur de la VM","C'est le fichier d'installation du système à installer","C'est une sauvegarde de la VM","C'est un antivirus"], correct:1},
    {q:"À quoi sert un Snapshot ?", options:["À accélérer la VM","À garder une photo de l'état de la VM pour pouvoir y revenir","À supprimer la VM","À se connecter à Internet"], correct:1},
    {q:"Pourquoi utiliser une machine virtuelle pour tester un logiciel douteux ?", options:["Ça n'a aucun intérêt","Le vrai PC reste protégé si le logiciel est dangereux","C'est plus rapide qu'en réel","Ça évite d'installer un antivirus"], correct:1}
  ]
};

const LAB_M2 = {
  id:'lab-m2', title:'Module 2 · Installer Kali Linux dans VirtualBox', level:'Pratique',
  chapters:[
    { id:'lab2-1', title:"Installer Kali Linux, étape par étape", subtitle:"Du téléchargement de l'ISO jusqu'au premier démarrage.",
      body:
        p("Deux prérequis avant de commencer : **VirtualBox installé** sur ton PC, et le **fichier ISO de Kali Linux** (on le télécharge ci-dessous).") +
        h4("Étape 1 — Télécharger Kali Linux") +
        ul(["Cherche \"Kali Linux download\" et va sur le site **officiel** (Offensive Security)","Télécharge l'image ISO : choisis la version **64-bit Installer**","Le fichier ressemble à `kali-linux-<version>-installer-amd64.iso`"]) +
        h4("Étape 2 — Créer une machine virtuelle") +
        ul(["Ouvre VirtualBox, clique sur **Nouvelle**","Nom : `Kali Linux` · Type : `Linux` · Version : `Debian (64-bit)`"]) +
        h4("Étape 3 — Allouer la mémoire (RAM)") +
        p("Choisis **2048 Mo** (2 Go) ou **4096 Mo** (4 Go) si possible. Ne dépasse pas la moitié de ta RAM réelle.") +
        h4("Étape 4 — Le disque dur virtuel") +
        ul(["Sélectionne **Créer un disque dur virtuel maintenant**","Type : **VDI** · Stockage : **Dynamiquement alloué** · Taille : **30 Go** ou plus"]) +
        h4("Étape 5 — Brancher l'ISO de Kali") +
        ul(["VM Kali → **Configuration** → **Stockage**","Sous Contrôleur IDE, clique sur l'icône du CD → **Choisir un fichier de disque**","Sélectionne ton fichier `kali-linux-….iso`"]) +
        h4("Étape 6 — Démarrer l'installation") +
        p("Clique **Démarrer**, choisis **Graphical install**, puis suis les étapes : langue, clavier, nom de l'ordinateur, mot de passe fort. Pour le disque, choisis **Guidé — utiliser tout le disque**, puis **Terminer et écrire sur le disque**.") +
        h4("Étape 7 à 9 — Installation et GRUB") +
        p("L'installeur copie les fichiers et configure le système. Quand on te le demande, choisis **Oui** pour installer le chargeur GRUB, sur `/dev/sda`. À la fin, clique **Continuer** : la machine redémarre.") +
        h4("Étape 10 — Premier démarrage") +
        p("Ta VM Kali démarre avec l'écran de connexion. Connecte-toi avec le nom d'utilisateur `kali` et le mot de passe que tu as défini.") +
        callout('astuce',"Bravo","Tu viens d'installer un système d'exploitation complet, isolé, sans aucun risque pour ton PC principal — exactement comme le font les professionnels de la cybersécurité pour s'entraîner.")
    }
  ],
  quiz:[
    {q:"Quelle version de l'ISO Kali Linux faut-il choisir pour un PC récent ?", options:["32-bit Live","64-bit Installer","Version ARM","Peu importe"], correct:1},
    {q:"Quel format de disque virtuel est utilisé pour créer la VM Kali ?", options:["ISO","VDI","MP4","ZIP"], correct:1},
    {q:"Que faut-il installer pour permettre à Kali de démarrer (bootloader) ?", options:["Guest Additions","GRUB","Nmap","Wireshark"], correct:1},
    {q:"Quel identifiant utilise-t-on pour se connecter à Kali au premier démarrage ?", options:["root / toor uniquement","Le nom d'utilisateur \"kali\" et le mot de passe défini à l'installation","admin / admin","Aucun identifiant n'est nécessaire"], correct:1}
  ]
};

const LAB_M3 = {
  id:'lab-m3', title:'Module 3 · Prise en main de Kali Linux', level:'Pratique',
  chapters:[
    { id:'lab3-1', title:"Les commandes de base dans Kali", subtitle:"Kali est basé sur Debian : beaucoup de commandes Linux classiques s'appliquent.",
      body:
        h3("Navigation") +
        table(["Commande","Rôle"],[
          ["`pwd`","Affiche le dossier actuel"],
          ["`ls`","Liste les fichiers"],
          ["`ls -la`","Tout afficher (même les fichiers cachés)"],
          ["`cd dossier`","Entrer dans un dossier"],
          ["`cd ..`","Revenir en arrière"],
          ["`clear`","Nettoyer l'écran"]
        ]) +
        h3("Fichiers et dossiers") +
        table(["Commande","Rôle"],[
          ["`mkdir test`","Créer un dossier"],
          ["`rm fichier`","Supprimer un fichier"],
          ["`rm -r dossier`","Supprimer un dossier"],
          ["`cp a.txt /home/kali`","Copier"],
          ["`mv a.txt b.txt`","Renommer / déplacer"]
        ]) +
        h3("Système") +
        table(["Commande","Rôle"],[
          ["`whoami`","Ton utilisateur actuel"],
          ["`sudo su`","Passer en administrateur"],
          ["`reboot`","Redémarrer"],
          ["`shutdown now`","Éteindre"],
          ["`history`","Historique des commandes"]
        ]) +
        h3("Réseau (très important dans Kali)") +
        table(["Commande","Rôle"],[
          ["`ip a`","Voir l'adresse IP"],
          ["`ping google.com`","Tester la connexion Internet"],
          ["`ifconfig`","Infos réseau (ancien mais utile)"],
          ["`netstat -tulnp`","Voir les ports ouverts"]
        ]) +
        h3("Installer et mettre à jour") +
        code('bash', "sudo apt update       # mettre à jour la liste des paquets\nsudo apt upgrade      # mettre à jour le système\nsudo apt install nom  # installer un outil\nsudo apt remove nom   # supprimer un outil") +
        h3("Outils Kali les plus populaires") +
        table(["Outil","Rôle"],[
          ["**nmap**","Scanner réseau"],
          ["**msfconsole**","Metasploit — framework d'exploitation"],
          ["**airmon-ng**","Audit WiFi"],
          ["**wireshark**","Analyse réseau"]
        ])
    },
    { id:'lab3-2', title:"Configurer Internet, capturer l'écran, partager un dossier",
      body:
        h3("Configurer Internet (méthode simple)") +
        ul([
          "Éteins la machine Kali",
          "Dans VirtualBox → **Configuration** → **Réseau**",
          "Carte 1 → Mode : **NAT** (recommandé) → **OK** → démarre Kali",
          "Dans Kali, teste avec `ip a` puis `ping google.com`"
        ]) +
        p("Si Internet ne fonctionne pas :") +
        code('bash', "sudo service networking restart\nsudo dhclient") +
        h3("Faire une capture d'écran") +
        ul(["**Dans Kali** : touche `PrtSc`, puis choisir où enregistrer","**Depuis VirtualBox** : menu de la fenêtre → Machine → Prendre une capture d'écran"]) +
        h3("Partager un dossier Windows ↔ Kali") +
        p("Nécessite d'abord d'installer les **Guest Additions** :") +
        code('bash', "sudo apt install build-essential dkms linux-headers-$(uname -r)\nsudo mkdir /media/cdrom\nsudo mount /dev/cdrom /media/cdrom\ncd /media/cdrom\nsudo sh VBoxLinuxAdditions.run\nreboot") +
        p("Puis dans VirtualBox : **Configuration → Dossiers partagés → Ajouter un dossier Windows**, en cochant **Montage automatique** et **Permanent**. Le dossier apparaît ensuite dans Kali sous `/media/sf_nomdudossier`. Si l'accès est refusé :") +
        code('bash', "sudo usermod -aG vboxsf kali\nreboot") +
        callout('cle',"Résumé rapide",["Commandes Linux = base de Kali","Internet = mode NAT dans VirtualBox","Capture = PrtSc ou menu VirtualBox","Partage = Guest Additions obligatoires"])
    }
  ],
  quiz:[
    {q:"Quelle commande liste tous les fichiers d'un dossier, y compris les fichiers cachés ?", options:["ls","ls -la","cd","pwd"], correct:1},
    {q:"Quelle commande affiche l'adresse IP de la machine Kali ?", options:["whoami","ip a","history","clear"], correct:1},
    {q:"Quel mode réseau VirtualBox est recommandé pour donner Internet à Kali simplement ?", options:["Bridge","NAT","Interne uniquement","Aucun"], correct:1},
    {q:"Que faut-il installer dans Kali avant de pouvoir partager un dossier avec Windows ?", options:["Wireshark","Les Guest Additions","Metasploit","Nmap"], correct:1}
  ]
};

const LAB_M4 = {
  id:'lab-m4', title:'Module 4 · Hacking éthique — les fondamentaux', level:'Sécurité',
  chapters:[
    { id:'lab4-1', title:"Qu'est-ce que le hacking éthique ?", subtitle:"Le vrai esprit Kali Linux : apprendre à sécuriser, pas à nuire.",
      body:
        callout('cle',"Définition","Un **hacker éthique** est quelqu'un qui attaque un système **avec autorisation** pour trouver des failles et les corriger. Mêmes techniques que les pirates, mais légal, autorisé, professionnel. On appelle ça le **pentesting** (test d'intrusion).") +
        callout('attention',"Règle n°1 — la plus importante", "Ne jamais tester un site, un WiFi ou un système sans autorisation écrite. Sinon, c'est un délit dans tous les pays. Entraîne-toi uniquement sur ta propre machine, des machines virtuelles, ou des plateformes d'entraînement légales.") +
        h3("Les 5 étapes du hacking éthique") +
        table(["Étape","But","Outils typiques"],[
          ["**1. Reconnaissance**","Savoir à qui on a affaire","`whois domaine.com`, `nslookup domaine.com`, theHarvester"],
          ["**2. Scan**","Découvrir IP, ports ouverts, services actifs","`nmap -sV -A 192.168.1.10`"],
          ["**3. Analyse des vulnérabilités**","Vérifier les faiblesses connues","nikto, wpscan, searchsploit"],
          ["**4. Exploitation (avec permission)**","Tester si la faille fonctionne réellement","msfconsole (Metasploit Framework)"],
          ["**5. Rapport**","Expliquer la faille, montrer le risque, proposer une solution","Document écrit — sans rapport, ce n'est pas professionnel"]
        ]) +
        h3("Où s'entraîner légalement") +
        table(["Plateforme","Rôle"],[
          ["**Hack The Box**","Machines vulnérables à attaquer"],
          ["**TryHackMe**","Formation progressive, du débutant à l'expert"],
          ["**VulnHub**","Machines vulnérables à télécharger"],
          ["**OWASP Juice Shop**","Site web volontairement vulnérable"]
        ]) +
        h3("Les outils de base à maîtriser") +
        table(["Outil","Utilité"],[
          ["**nmap**","Scanner réseau"],
          ["**burpsuite**","Analyse d'applications web"],
          ["**wireshark**","Sniffer réseau"],
          ["**hydra**","Test de robustesse de mots de passe"],
          ["**dirb**","Trouver des dossiers cachés sur un serveur web"]
        ]) +
        h3("Les compétences d'un bon hacker éthique") +
        ul(["Réseaux (IP, ports, DNS)","Linux","Web (HTML, HTTP)","Bases de données","Programmation — Python conseillé"]) +
        callout('cle',"Résumé simple","Le hacking éthique, c'est trouver les failles **avant** les criminels, pour protéger les systèmes — jamais pour nuire.")
    }
  ],
  quiz:[
    {q:"Quelle est la règle n°1 absolue du hacking éthique ?", options:["Toujours utiliser Kali Linux","Ne jamais tester un système sans autorisation écrite","Toujours travailler seul","Ne jamais utiliser Metasploit"], correct:1},
    {q:"Quelle étape du pentest vise à découvrir les IP, ports ouverts et services actifs ?", options:["Reconnaissance","Scan","Rapport","Exploitation"], correct:1},
    {q:"Quelle plateforme est conçue pour s'entraîner légalement au hacking, du débutant à l'expert ?", options:["Facebook","TryHackMe","Gmail","Wikipédia"], correct:1},
    {q:"Pourquoi l'étape \"Rapport\" est-elle indispensable après un test d'intrusion ?", options:["Ce n'est pas vraiment nécessaire","Sans rapport expliquant la faille et la solution, le travail n'est pas professionnel","Elle sert à effacer les traces de l'attaque","Elle remplace l'étape d'exploitation"], correct:1}
  ]
};

const LAB_M5 = {
  id:'lab-m5', title:'Module 5 · Premier labo pratique guidé', level:'Projet',
  chapters:[
    { id:'lab5-1', title:"Ton laboratoire de pentest isolé", subtitle:"Kali + Metasploitable : un labo 100% légal, car entièrement local.",
      body:
        callout('attention',"Rappel important avant de commencer","Tout ce qui suit est légal uniquement : sur ton propre labo virtuel, sur des plateformes d'entraînement dédiées, avec autorisation explicite. Jamais sur un système qui ne t'appartient pas.") +
        p("**Metasploitable** est une machine virtuelle volontairement truffée de failles, conçue pour l'entraînement. On l'installe comme une deuxième VM dans VirtualBox, à côté de Kali, toutes deux sur le même réseau interne.") +
        h4("1. Exploiter une faille avec Metasploit") +
        p("Objectif : ouvrir une session sur Metasploitable via une faille connue du service FTP.") +
        code('bash', "msfconsole\n\nsearch vsftpd\n# → exploit/unix/ftp/vsftpd_234_backdoor\n\nuse exploit/unix/ftp/vsftpd_234_backdoor\nset RHOST 192.168.56.101\nrun\n\n# Si réussi : \"Command shell session opened\"\nwhoami") +
        p("Si la commande réussit, tu es dans la machine cible — **dans ton labo**, jamais ailleurs.") +
        h4("2. Attaquer un site web vulnérable (local)") +
        p("Metasploitable héberge un site vulnérable (Mutillidae ou DVWA), accessible depuis le navigateur de Kali :") +
        code('bash', "# Dans le navigateur de Kali :\nhttp://192.168.56.101\n\n# Scanner les vulnérabilités connues :\nnikto -h http://192.168.56.101") +
        p("Nikto recherche les mauvaises configurations, les scripts vulnérables et les failles connues.") +
        h4("3. Analyser le réseau avec Wireshark") +
        code('bash', "wireshark\n# Choisis l'interface réseau (eth0), lance la capture\n# Depuis Metasploitable, envoie un ping vers Kali\n# → tu observes les paquets ICMP en direct") +
        h4("4. Tester la robustesse d'un mot de passe avec Hydra") +
        code('bash', "hydra -l msfadmin -P /usr/share/wordlists/rockyou.txt ssh://192.168.56.101") +
        p("Hydra essaie une liste de mots de passe jusqu'à trouver le bon — une démonstration concrète de pourquoi un mot de passe faible est si dangereux (voir le module Cybersécurité, chapitre 11).") +
        h3("Ce que tu viens d'apprendre") +
        table(["Étape","Compétence","Outil"],[
          ["Exploitation","Utiliser un exploit connu","Metasploit"],
          ["Web hacking","Scanner les vulnérabilités web","Nikto"],
          ["Analyse trafic","Observer les paquets réseau","Wireshark"],
          ["Bruteforce","Tester la robustesse d'un mot de passe","Hydra"]
        ]) +
        callout('cle',"Rappel final","Tout ceci n'est légal que sur ton labo personnel ou des plateformes d'entraînement dédiées. C'est exactement la même logique que le module Cybersécurité : comprendre l'attaque pour mieux savoir s'en défendre.")
    }
  ],
  quiz:[
    {q:"Pourquoi utilise-t-on Metasploitable dans ce labo ?", options:["C'est un vrai site d'entreprise","C'est une machine volontairement vulnérable, conçue pour l'entraînement légal","C'est un antivirus","C'est un navigateur"], correct:1},
    {q:"Que fait la commande `search vsftpd` dans msfconsole ?", options:["Elle supprime vsftpd","Elle cherche les modules Metasploit liés à vsftpd","Elle installe vsftpd","Elle scanne le WiFi"], correct:1},
    {q:"À quoi sert Nikto dans ce module ?", options:["À créer des mots de passe","À scanner un site web à la recherche de vulnérabilités connues","À capturer des paquets réseau","À installer Kali"], correct:1},
    {q:"Dans quelles conditions les techniques de ce module sont-elles légales ?", options:["Toujours, sur n'importe quel site","Uniquement sur son propre labo ou des plateformes d'entraînement autorisées","Uniquement la nuit","Jamais"], correct:1}
  ]
};

TRACKS.push({
  id:'lab', color:'lab', tag:'Parcours Pratique', shortLabel:'Labo VirtualBox / Kali',
  label:'Labo pratique — VirtualBox & Kali Linux',
  tagline:"Monte ton propre laboratoire de cybersécurité, 100% isolé et légal, pour t'entraîner au hacking éthique sans aucun risque.",
  description:"De l'installation de VirtualBox jusqu'à ton premier test d'intrusion sur une machine volontairement vulnérable : virtualisation, prise en main de Kali Linux, fondamentaux du hacking éthique et labo pratique guidé (Metasploit, Nikto, Wireshark, Hydra).",
  meta:["🖥️ Environnement 100% isolé","⚖️ Cadre légal et éthique","🎓 Complément pratique du parcours Cybersécurité"],
  modules:[LAB_M1, LAB_M2, LAB_M3, LAB_M4, LAB_M5]
});

/* ================================================================
   PARCOURS 4 — WEBDESIGN (pour développeurs)
   ================================================================ */
const DS_M0 = {
  id:'ds-m0', title:'Module 0 · Introduction', level:'Bienvenue',
  chapters:[
    { id:'ds0-1', title:"Pourquoi un développeur doit comprendre le webdesign", subtitle:"Ce parcours ne fait pas de toi un graphiste — il te donne le vocabulaire et les réflexes pour bien collaborer avec un designer, ou concevoir seul une interface propre.",
      body:
        p("Un développeur qui comprend le design gagne du temps : il pose les bonnes questions, repère les incohérences dans une maquette avant de coder, et sait traduire une intention visuelle en CSS sans perdre le sens du design d'origine.") +
        callout('cle',"Ce que tu vas apprendre", [
          "Les fondamentaux visuels : couleur, typographie, espacement",
          "Penser UX avant de dessiner un écran (utilisateur, parcours, hiérarchie)",
          "Construire des mises en page cohérentes et responsives",
          "Utiliser Figma comme un développeur : lire une maquette, en extraire le code",
          "Construire des design systems et des interfaces accessibles",
          "Un projet complet : du wireframe à la page en ligne"
        ]) +
        callout('analogie',"Analogie","Le design, c'est le plan d'architecte. Le développement, c'est la construction. Un maçon qui comprend un plan construit plus vite, avec moins d'allers-retours, et repère une erreur de plan avant de couler le béton.") +
        p("Ce module s'appuie directement sur ce que tu as déjà vu dans le parcours **Développeur Web** : CSS (couleurs, box model, Flexbox, Grid), HTML sémantique et accessibilité. Le webdesign te donne maintenant la méthode pour savoir **quoi** styliser, et **pourquoi**.")
    }
  ]
};

const DS_M1 = {
  id:'ds-m1', title:'Module 1 · Les fondamentaux visuels', level:'Fondations',
  chapters:[
    { id:'ds1-1', title:"La couleur : construire une palette qui fonctionne",
      body:
        h3("Teinte, saturation, luminosité") +
        p("Une couleur se décrit par trois valeurs : la **teinte** (rouge, bleu, vert — sa position sur le cercle chromatique), la **saturation** (son intensité, du gris pur à la couleur pure) et la **luminosité** (sa clarté, du noir au blanc). C'est exactement ce que représente le format CSS `hsl()`.") +
        code('css', "--accent: hsl(210, 55%, 22%);\n/* teinte 210° (bleu) · saturation 55% · luminosité 22% (foncé) */") +
        h3("La structure d'une palette de projet") +
        table(["Rôle","Usage"],[
          ["**Couleur primaire**","La couleur de marque — boutons principaux, liens, éléments actifs"],
          ["**Couleur secondaire / accent**","Met en valeur un élément précis, à utiliser avec parcimonie"],
          ["**Neutres**","Gris (ou teintés) pour le texte, les fonds, les bordures — 80% de l'interface"],
          ["**Couleurs sémantiques**","Succès (vert), avertissement (orange), erreur (rouge) — jamais réutilisées comme accent"]
        ]) +
        callout('attention',"Erreur fréquente","Utiliser la couleur de succès ou d'erreur ailleurs que pour un vrai état système (validation, alerte) prête à confusion : l'utilisateur associe une couleur à un sens précis, ne le détourne pas.") +
        h3("Le contraste : une question d'accessibilité, pas de goût") +
        p("Les normes **WCAG** définissent un ratio de contraste minimal entre le texte et son fond :") +
        table(["Contexte","Ratio minimum (AA)"],[
          ["Texte normal","4.5 : 1"],
          ["Grand texte (≥ 18px gras ou ≥ 24px)","3 : 1"],
          ["Éléments d'interface (icônes, bordures de champs)","3 : 1"]
        ]) +
        callout('astuce',"Astuce","Avant de valider une palette, vérifie chaque paire texte/fond avec un outil comme WebAIM Contrast Checker. Un joli bleu clair sur blanc peut être illisible pour une personne malvoyante — et c'est une non-conformité légale dans de nombreux contextes professionnels.")
    },
    { id:'ds1-2', title:"La typographie : hiérarchie et lisibilité",
      body:
        h3("Marier deux polices, pas dix") +
        p("Une interface efficace utilise en général **une police pour les titres** (avec du caractère) et **une police pour le texte courant** (très lisible, neutre) — parfois une seule police suffit, en jouant sur les graisses.") +
        h3("Construire une échelle typographique") +
        p("Plutôt que de choisir des tailles au hasard, on définit une échelle avec un ratio constant (ex : ×1.25) :") +
        code('css', "--text-xs:   0.75rem;   /* 12px */\n--text-sm:   0.875rem;  /* 14px */\n--text-base: 1rem;      /* 16px — le texte courant */\n--text-lg:   1.25rem;   /* 20px */\n--text-xl:   1.563rem;  /* 25px */\n--text-2xl:  1.953rem;  /* 31px */") +
        p("Tu reconnais cette logique : c'est exactement le rôle des unités **rem** vues dans le module CSS du parcours Développeur Web — une échelle basée sur `rem` reste cohérente même si l'utilisateur change la taille de police de son navigateur.") +
        h3("Les règles de lisibilité") +
        checklist([
          "Texte courant jamais en dessous de 16px sur le web",
          "Interligne (`line-height`) entre 1.4 et 1.6 pour du texte courant",
          "Largeur de ligne idéale : 45 à 75 caractères (au-delà, l'œil se perd)",
          "Ne jamais utiliser le blanc pur sur noir pur : préférer un gris très foncé sur un blanc cassé, moins fatigant"
        ])
    },
    { id:'ds1-3', title:"Espacement, alignement et la grille invisible",
      body:
        callout('cle',"Le principe","La différence entre une interface amateur et une interface professionnelle tient souvent à une seule chose : la **régularité** de l'espacement.") +
        h3("Un système d'espacement à base 8") +
        p("Plutôt que d'utiliser des valeurs arbitraires (13px, 22px, 7px…), on définit une échelle de multiples de 4 ou 8 :") +
        code('css', "--space-1: 4px;\n--space-2: 8px;\n--space-3: 16px;\n--space-4: 24px;\n--space-5: 32px;\n--space-6: 48px;") +
        p("Résultat : tous les espacements de l'interface (marges, paddings, écarts entre éléments) proviennent de cette échelle. L'œil perçoit inconsciemment cette cohérence.") +
        h3("Les lois de la Gestalt appliquées à l'écran") +
        table(["Loi","En pratique"],[
          ["**Proximité**","Des éléments proches sont perçus comme liés — un label collé à son champ, éloigné du champ suivant"],
          ["**Similarité**","Des éléments qui se ressemblent (couleur, forme) sont perçus comme un même groupe"],
          ["**Alignement**","Tout ce qui n'est pas aligné intentionnellement paraît être une erreur"]
        ]) +
        callout('astuce',"Astuce","Active toujours une grille ou des repères d'alignement dans ton outil de design (ou les outils développeur du navigateur) : l'œil humain détecte un décalage de 1 à 2 pixels, même sans savoir l'expliquer.")
    }
  ],
  quiz:[
    {q:"Selon les normes WCAG AA, quel est le ratio de contraste minimum pour du texte normal ?", options:["1.5 : 1", "3 : 1", "4.5 : 1", "10 : 1"], correct:2},
    {q:"Pourquoi utiliser des tailles de police en `rem` plutôt qu'en `px` ?", options:["C'est plus court à écrire", "L'échelle reste cohérente même si l'utilisateur change la taille de police du navigateur", "Ça charge plus vite", "Il n'y a aucune différence"], correct:1},
    {q:"Quelle loi de la Gestalt explique qu'un label collé à son champ de formulaire paraît lié à lui ?", options:["La loi de similarité", "La loi de proximité", "La loi de Fitts", "La loi de Hick"], correct:1},
    {q:"Pourquoi éviter de réutiliser la couleur \"succès\" (vert) comme simple couleur décorative ?", options:["Le vert est difficile à produire en CSS", "L'utilisateur associe cette couleur à un état précis (validation) ; la détourner crée de la confusion", "Le vert n'est pas accessible", "Il n'y a pas de raison particulière"], correct:1}
  ]
};

const DS_M2 = {
  id:'ds-m2', title:'Module 2 · Penser UX avant l\'écran', level:'Méthode',
  chapters:[
    { id:'ds2-1', title:"Personas et parcours utilisateur",
      body:
        callout('cle',"Définition","L'**UX** (User Experience) désigne tout ce que ressent une personne en utilisant un produit — avant même de parler de couleurs ou de boutons.") +
        h3("Le persona : pour qui construis-tu ?") +
        p("Un persona est un profil type d'utilisateur, construit à partir d'observations réelles (pas d'inventions), qui résume ses objectifs, ses contraintes et son niveau technique.") +
        callout('analogie',"Exemple concret","Pour le logiciel RH du parcours Développeur Web : \"Awa, 34 ans, responsable RH, utilise l'ordinateur au bureau toute la journée, n'est pas technique, doit pouvoir ajouter un employé en moins de 2 minutes sans formation.\" Ce persona oriente déjà des choix : formulaire simple, pas de jargon technique, validation immédiate.") +
        h3("Le parcours utilisateur (user journey)") +
        p("Avant de dessiner un écran, on liste les **étapes** que suit l'utilisateur pour atteindre son objectif — chaque étape est un point où l'interface peut aider... ou frustrer.") +
        code('bash', "1. Awa se connecte au logiciel RH\n2. Elle cherche \"Ajouter un employé\"\n3. Elle remplit le formulaire (nom, poste, salaire...)\n4. Elle valide\n5. Elle reçoit une confirmation\n6. Elle retrouve l'employé dans la liste", "Parcours utilisateur simplifié") +
        p("Chaque étape de ce parcours devient une exigence de design : à l'étape 2, le bouton doit être visible sans chercher ; à l'étape 5, une confirmation claire évite qu'Awa ne recommence l'opération par doute.")
    },
    { id:'ds2-2', title:"Wireframes et hiérarchie de l'information",
      body:
        callout('cle',"Définition","Un **wireframe** est une esquisse simplifiée d'un écran (rectangles, texte factice, pas de couleur ni de police définitive) qui se concentre uniquement sur la **structure** et la **hiérarchie**.") +
        h3("Pourquoi commencer sans couleur ni police ?") +
        p("Parce que ce sont les détails les plus faciles à changer, et les plus faciles à discuter en premier — parler de \"est-ce que ce bouton doit être ici\" avant de parler de \"quel bleu utiliser\" fait gagner un temps considérable.") +
        h3("La hiérarchie de l'information") +
        p("Sur une page, l'œil ne lit pas tout au même niveau d'attention. Deux schémas de lecture reviennent souvent :") +
        table(["Schéma","Contexte"],[
          ["**Motif en Z**","Pages simples, peu de texte (landing page) : l'œil balaie en Z, du coin haut-gauche au coin bas-droit"],
          ["**Motif en F**","Pages riches en texte (article, liste de résultats) : l'œil scanne les débuts de lignes"]
        ]) +
        p("Conséquence pratique : l'action la plus importante (bouton \"S'inscrire\", \"Ajouter\") se place naturellement là où le regard termine son parcours — souvent en haut à droite ou en bas à droite d'un bloc.")
    },
    { id:'ds2-3', title:"Principes d'utilisabilité", subtitle:"Des règles issues de la psychologie cognitive, valables depuis des décennies.",
      body:
        table(["Principe","Ce qu'il dit","Conséquence pour toi"],[
          ["**Loi de Fitts**","Le temps pour atteindre une cible dépend de sa taille et de la distance à parcourir","Les boutons d'action importants doivent être grands et proches du geste précédent (ex : bouton mobile ≥ 44×44px)"],
          ["**Loi de Hick**","Plus on propose de choix, plus la décision est lente","Limite les options visibles à la fois ; regroupe ou masque les options avancées"],
          ["**Loi de Jakob**","Les utilisateurs préfèrent que ton site fonctionne comme les sites qu'ils connaissent déjà","N'invente pas un nouveau symbole pour \"panier\" ou \"menu\" — les icônes standards existent pour une raison"],
          ["**Effet de position (Von Restorff)**","Un élément visuellement différent des autres attire l'attention en priorité","Réserve cet effet pour UNE action principale par écran, pas dix"]
        ]) +
        h3("Le feedback : ne jamais laisser l'utilisateur dans le doute") +
        checklist([
          "Un clic doit produire un effet visible immédiatement (changement d'état, chargement, confirmation)",
          "Une erreur doit expliquer quoi corriger, pas juste dire \"Erreur\"",
          "Une action destructive (supprimer) doit toujours être confirmée"
        ]) +
        callout('astuce',"Astuce","Ces principes sont les mêmes que ceux que tu retrouveras dans le module Accessibilité (module 5) : une interface pensée pour être utilisable rapidement par tous est presque toujours plus accessible aussi.")
    }
  ],
  quiz:[
    {q:"Que décrit un persona en UX ?", options:["Une palette de couleurs", "Un profil type d'utilisateur, basé sur des observations réelles", "Un composant Figma", "Un type de police"], correct:1},
    {q:"Pourquoi un wireframe évite-t-il volontairement les couleurs et polices définitives ?", options:["Par manque de temps", "Pour se concentrer d'abord sur la structure et la hiérarchie, plus faciles à discuter séparément", "Parce que c'est plus rapide à dessiner", "Ce n'est pas volontaire"], correct:1},
    {q:"Que dit la loi de Fitts ?", options:["Il faut limiter le nombre de choix proposés", "Le temps pour atteindre une cible dépend de sa taille et de sa distance", "Les utilisateurs préfèrent les standards qu'ils connaissent", "Le contraste doit être d'au moins 4.5:1"], correct:1},
    {q:"Que recommande la loi de Jakob ?", options:["D'inventer des icônes originales pour se démarquer", "De respecter les conventions que les utilisateurs connaissent déjà (icônes, emplacements standards)", "De limiter les couleurs à trois", "De toujours utiliser un menu en bas de l'écran"], correct:1}
  ]
};

const DS_M3 = {
  id:'ds-m3', title:'Module 3 · Mise en page et grilles', level:'Structure',
  chapters:[
    { id:'ds3-1', title:"La grille 12 colonnes et le responsive",
      body:
        callout('cle',"Pourquoi 12 colonnes ?","12 se divise par 2, 3, 4 et 6 — ce qui permet de créer des mises en page en moitiés, tiers, quarts ou sixièmes sans calculs compliqués.") +
        h3("Anatomie d'une grille") +
        table(["Élément","Rôle"],[
          ["**Colonnes**","Les bandes verticales qui structurent le contenu (12 en général)"],
          ["**Gouttière (gutter)**","L'espace fixe entre deux colonnes"],
          ["**Marge**","L'espace entre le contenu et le bord de l'écran"]
        ]) +
        p("En CSS, cette grille se construit directement avec ce que tu as déjà appris dans le parcours Développeur Web :") +
        code('css', ".grid {\n  display: grid;\n  grid-template-columns: repeat(12, 1fr);\n  gap: 24px;\n}\n.carte {\n  grid-column: span 4; /* occupe 4 colonnes sur 12, soit 1/3 de la largeur */\n}") +
        h3("Les points de rupture (breakpoints) standards") +
        table(["Appareil","Largeur indicative"],[
          ["Mobile","360 – 480px"],
          ["Tablette","768px"],
          ["Petit ordinateur","1024px"],
          ["Grand écran","1280px et plus"]
        ])
    },
    { id:'ds3-2', title:"Mobile-first : concevoir du petit vers le grand",
      body:
        callout('cle',"Le principe","Concevoir d'abord pour le plus petit écran, puis enrichir progressivement pour les écrans plus grands — plutôt que l'inverse.") +
        h3("Pourquoi ça change tout") +
        ul([
          "Ça force à identifier ce qui est **vraiment** essentiel (le petit écran ne pardonne rien)",
          "La majorité du trafic web mondial vient du mobile — concevoir pour lui en premier évite les mauvaises surprises",
          "En CSS, cela se traduit par des media queries qui **ajoutent** des styles à mesure que l'écran grandit, plutôt que d'en retirer"
        ]) +
        code('css', "/* Styles de base = mobile */\n.carte { width: 100%; }\n\n/* On enrichit à partir de 768px */\n@media (min-width: 768px) {\n  .carte { width: 50%; }\n}") +
        h3("Les zones tactiles") +
        p("Sur mobile, une cible cliquable doit mesurer au moins **44×44px** (recommandation Apple/Google) — en dessous, le doigt rate la cible plus souvent qu'il ne l'atteint. C'est une application directe de la loi de Fitts vue au module précédent.") +
        h3("Les zones du pouce") +
        p("Sur un grand smartphone tenu à une main, le pouce atteint facilement le bas et le centre de l'écran, difficilement les coins hauts — c'est pourquoi les actions principales des apps mobiles se trouvent souvent en bas de l'écran.")
    },
    { id:'ds3-3', title:"Atomic Design : construire par briques", subtitle:"Une méthode de Brad Frost qui fait le pont entre design et développement par composants.",
      body:
        p("**Atomic Design** découpe une interface en 5 niveaux, du plus simple au plus complexe :") +
        table(["Niveau","Définition","Exemple"],[
          ["**Atomes**","Les éléments qu'on ne peut plus diviser","Un bouton, un label, une couleur, une police"],
          ["**Molécules**","Un groupe d'atomes qui forme une unité simple","Un champ de recherche = un label + un input + un bouton"],
          ["**Organismes**","Un assemblage de molécules, une section complète","Un en-tête de site = logo + navigation + champ de recherche"],
          ["**Templates**","La structure d'une page, sans contenu réel","La maquette vide de la page \"Liste des employés\""],
          ["**Pages**","Le template rempli de vrai contenu","La page \"Liste des employés\" avec les vraies données"]
        ]) +
        callout('cle',"Le pont avec le développement","Cette méthode correspond exactement à l'approche par **composants** que tu utiliseras en React, Vue ou même en HTML/CSS réutilisable : un `<Button>` est un atome, un `<SearchBar>` une molécule, un `<Header>` un organisme. Penser en Atomic Design côté design facilite énormément le découpage en composants côté code.") +
        callout('astuce',"Astuce","Quand une maquette Figma est organisée en composants (atomes, molécules...), le passage au code est direct : chaque composant Figma devient un composant de code. Quand elle ne l'est pas, c'est souvent le signe d'un design encore à clarifier.")
    }
  ],
  quiz:[
    {q:"Pourquoi la grille CSS utilise-t-elle traditionnellement 12 colonnes ?", options:["C'est une limite technique du CSS", "12 se divise facilement par 2, 3, 4 et 6, ce qui simplifie les mises en page", "C'est la valeur par défaut du navigateur", "Aucune raison particulière"], correct:1},
    {q:"Que signifie concevoir \"mobile-first\" ?", options:["Ne concevoir que pour mobile", "Concevoir d'abord pour le plus petit écran, puis enrichir pour les écrans plus grands", "Utiliser uniquement des media queries max-width", "Interdire l'usage sur ordinateur"], correct:1},
    {q:"Quelle taille minimale recommandée pour une cible tactile sur mobile ?", options:["10×10px", "24×24px", "44×44px", "100×100px"], correct:2},
    {q:"Dans l'Atomic Design, qu'est-ce qu'une \"molécule\" ?", options:["Un élément indivisible comme un bouton", "Un groupe d'atomes formant une unité simple (ex : champ + label + bouton)", "Une page complète avec du vrai contenu", "Une couleur du design system"], correct:1}
  ]
};

const DS_M4 = {
  id:'ds-m4', title:'Module 4 · Figma pour développeurs', level:'Outil',
  chapters:[
    { id:'ds4-1', title:"Découvrir l'interface Figma",
      body:
        p("**Figma** est l'outil de design d'interface le plus utilisé en entreprise — gratuit pour un usage individuel, et collaboratif en temps réel comme un Google Docs du design.") +
        h3("Le vocabulaire de base") +
        table(["Élément","Équivalent en développement"],[
          ["**Frame**","Un conteneur (comme une `<div>`) — représente souvent un écran entier"],
          ["**Calque (layer)**","Un élément individuel à l'intérieur d'une frame"],
          ["**Page**","Un espace de travail séparé (ex : une page \"Web\", une page \"Mobile\")"],
          ["**Projet / Fichier**","Regroupe plusieurs pages liées à un même produit"]
        ]) +
        h3("Naviguer dans Figma") +
        ul([
          "Le panneau de gauche liste les **calques** (comme l'inspecteur DOM d'un navigateur)",
          "Le panneau de droite affiche les **propriétés** de l'élément sélectionné (position, taille, couleur, police…)",
          "Le raccourci `R` crée un rectangle, `T` un texte, `F` une frame — comme des raccourcis clavier d'un éditeur de code"
        ]) +
        callout('astuce',"Astuce","Le panneau de propriétés à droite ressemble énormément aux outils développeur d'un navigateur (onglet Styles) — ce n'est pas un hasard, les deux manipulent au fond les mêmes concepts : position, taille, couleur, typographie.")
    },
    { id:'ds4-2', title:"Composants et Auto Layout",
      body:
        h3("Les composants") +
        p("Un **composant** Figma est un élément réutilisable (un bouton, une carte) : on le modifie une fois dans le composant \"maître\", et toutes ses **instances** se mettent à jour automatiquement — exactement comme un composant React ou une classe CSS réutilisable.") +
        h3("Les variantes") +
        p("Un composant peut avoir des **variantes** : un bouton \"primaire / secondaire\", \"petit / grand\", \"actif / désactivé\" — cela correspond directement aux **props** d'un composant de code (`<Button variant=\"primary\" size=\"large\" />`).") +
        h3("Auto Layout : du Figma qui pense comme Flexbox") +
        p("**Auto Layout** fait qu'une frame se comporte comme un conteneur Flexbox : elle s'agrandit automatiquement selon son contenu, avec un espacement et un alignement définis.") +
        table(["Propriété Figma (Auto Layout)","Équivalent CSS"],[
          ["Direction (horizontale/verticale)","`flex-direction: row / column`"],
          ["Espacement entre éléments","`gap`"],
          ["Alignement","`justify-content` / `align-items`"],
          ["Padding interne","`padding`"]
        ]) +
        callout('cle',"À retenir","Une maquette qui utilise l'Auto Layout se traduit presque directement en Flexbox CSS — c'est le signe d'une maquette pensée pour être développée facilement.")
    },
    { id:'ds4-3', title:"Prototyper une interface",
      body:
        p("Le **prototypage** consiste à relier des frames entre elles pour simuler la navigation réelle, sans écrire une seule ligne de code.") +
        h3("Ce qu'un prototype permet de tester") +
        ul([
          "Le parcours a-t-il un sens du point de vue de l'utilisateur ?",
          "Les transitions et animations prévues sont-elles cohérentes ?",
          "Manque-t-il un état (chargement, erreur, liste vide) ?"
        ]) +
        callout('astuce',"Astuce pour développeur","Avant de coder un écran, demande toujours à voir (ou à tester) le prototype plutôt que la seule image statique : il révèle souvent des interactions ou des états invisibles sur une simple capture d'écran.") +
        callout('attention',"Piège fréquent","Une maquette statique ne montre presque jamais les états \"vides\" (aucune donnée), \"erreur\" ou \"chargement\". En tant que développeur, pose systématiquement la question : \"et si la liste est vide ?\", \"et si la requête échoue ?\"")
    },
    { id:'ds4-4', title:"Le mode Dev : lire une maquette et en extraire le code", subtitle:"L'endroit exact où design et développement se rencontrent.",
      body:
        p("Le **Dev Mode** de Figma (ou le panneau \"Inspect\") affiche, pour l'élément sélectionné, les valeurs exactes prêtes à copier :") +
        checklist([
          "Les couleurs, au format hexadécimal ou en variable de design token",
          "Les tailles, marges et paddings, en pixels",
          "La police, sa taille, son interligne, sa graisse",
          "Un aperçu du CSS déjà généré pour l'élément"
        ]) +
        code('css', "/* Exemple de CSS généré automatiquement par le mode Dev */\n.bouton-primaire {\n  background: #16324F;\n  border-radius: 8px;\n  padding: 12px 24px;\n  font-family: 'Inter';\n  font-size: 16px;\n  font-weight: 600;\n}") +
        callout('attention',"Ne jamais copier-coller aveuglément","Ce CSS généré est un excellent point de départ, mais il faut le passer au crible : remplacer les couleurs en dur par tes variables (`var(--accent)`), vérifier les unités (`px` → `rem` si besoin), et t'assurer que l'élément reste accessible (focus, contraste) — un outil de design ne connaît pas les contraintes de ton code.") +
        h3("Exporter les images et icônes") +
        p("Le mode Dev permet aussi d'exporter directement les visuels au bon format : **SVG** pour les icônes et illustrations vectorielles (léger, redimensionnable sans perte), **PNG** pour les photos, souvent en plusieurs résolutions (1x, 2x, 3x) pour les écrans à forte densité de pixels.")
    },
    { id:'ds4-5', title:"Fiche pratique : prendre Figma en main pas à pas", subtitle:"Résumé pratique du module — à garder sous la main pendant tes premières maquettes.",
      body:
        h3("Étape 1 — Créer ton compte et ton premier fichier") +
        ul([
          "Va sur **figma.com** et crée un compte gratuit (le plan \"Starter\" gratuit suffit largement pour apprendre)",
          "Aucune installation obligatoire : Figma fonctionne directement dans le navigateur (une application de bureau existe aussi, en option)",
          "Depuis ton espace de travail, clique sur **New design file** pour ouvrir un fichier vierge"
        ], true) +
        h3("Étape 2 — Les outils essentiels et leurs raccourcis") +
        table(["Touche","Outil","Usage"],[
          ["`V`","Déplacer / sélectionner","L'outil par défaut — toujours y revenir avec Échap"],
          ["`F`","Frame","Crée un conteneur d'écran (équivalent d'une `<div>` racine)"],
          ["`R`","Rectangle","Formes rectangulaires, boutons, cartes"],
          ["`O`","Ellipse","Cercles, avatars, puces"],
          ["`T`","Texte","Ajouter du texte éditable"],
          ["`P`","Plume (pen)","Tracés vectoriels et formes libres"],
          ["`Ctrl/Cmd + D`","Dupliquer","Copie l'élément sélectionné"],
          ["`Ctrl/Cmd + G`","Grouper","Regroupe la sélection"],
          ["`Shift + A`","Auto Layout","Transforme la sélection en conteneur Auto Layout (vu au chapitre précédent)"],
          ["`Ctrl/Cmd + Alt + K`","Créer un composant","Transforme la sélection en composant réutilisable"],
          ["`Ctrl/Cmd + /`","Recherche d'actions","Ouvre une barre de commandes universelle — tape ce que tu veux faire"]
        ]) +
        callout('astuce',"Le raccourci le plus rentable","`Ctrl/Cmd + /` ouvre une barre de recherche qui exécute n'importe quelle commande Figma tapée en texte libre (\"create component\", \"align left\"…) — plus besoin de mémoriser tous les menus au début.") +
        h3("Étape 3 — Exercice guidé : construire un bouton de A à Z") +
        ul([
          "Appuie sur `R` et dessine un rectangle — ce sera le fond du bouton",
          "Appuie sur `T` et clique à l'intérieur pour ajouter le texte du bouton (ex. \"S'inscrire\")",
          "Sélectionne le texte ET le rectangle ensemble, puis appuie sur `Shift + A` pour les transformer en Auto Layout",
          "Dans le panneau de droite, règle le padding horizontal et vertical de l'Auto Layout (ex. 24px / 12px)",
          "Arrondis les angles avec le champ **Corner radius** (ex. 8px)",
          "Applique une couleur de fond (**Fill**) — idéalement un **style de couleur partagé** plutôt qu'une valeur libre, exactement comme un design token vu au module 5",
          "Sélectionne le tout et appuie sur `Ctrl/Cmd + Alt + K` pour en faire un **composant**",
          "Dans le panneau **Variants**, ajoute une variante \"hover\" et une variante \"disabled\" en dupliquant puis en modifiant l'apparence"
        ], true) +
        p("Ce petit exercice résume, à lui seul, presque tout le module : Auto Layout (= Flexbox), styles partagés (= design tokens), composants et variantes (= composants de code avec props).") +
        h3("Organiser un fichier comme un professionnel") +
        checklist([
          "Nommer chaque calque clairement (\"Bouton / Primaire\", pas \"Rectangle 234\")",
          "Séparer le fichier en pages : Couverture, Design System, Écrans mobile, Écrans desktop",
          "Créer des **styles partagés** pour les couleurs et le texte (clic droit sur une valeur → Create style) plutôt que de ressaisir les mêmes valeurs partout",
          "Un fichier par produit, pas un fichier fourre-tout pour tous les projets"
        ]) +
        h3("Checklist avant de transmettre une maquette à un développeur") +
        checklist([
          "Tous les états des composants importants sont présents (par défaut, survol, focus, désactivé, erreur)",
          "L'Auto Layout est utilisé partout où la mise en page doit s'adapter au contenu",
          "Les couleurs et polices utilisent des styles nommés, pas des valeurs \"libres\" différentes à chaque écran",
          "Un prototype cliquable existe au moins pour le parcours principal",
          "Les icônes sont prêtes à exporter en SVG"
        ]) +
        callout('cle',"À retenir","Une bonne maquette n'est pas seulement \"jolie\" : elle est **organisée** comme le sera le code qui en découle. C'est cette organisation, plus que le talent artistique, qui fait gagner du temps à toute l'équipe.")
    }
  ],
  quiz:[
    {q:"Dans Figma, à quoi correspond une \"instance\" de composant ?", options:["Un fichier séparé", "Une copie liée à un composant maître, mise à jour automatiquement si le maître change", "Une page du projet", "Un export PNG"], correct:1},
    {q:"À quel concept CSS l'Auto Layout de Figma correspond-il le plus directement ?", options:["Grid", "Flexbox", "Position absolute", "Media queries"], correct:1},
    {q:"Pourquoi est-il important de tester un prototype et pas seulement regarder des images statiques ?", options:["Ce n'est pas vraiment utile", "Un prototype révèle des interactions, transitions et états manquants invisibles sur une image fixe", "C'est plus rapide", "Les images statiques ne s'ouvrent pas dans Figma"], correct:1},
    {q:"Que faut-il vérifier avant d'utiliser tel quel le CSS généré par le mode Dev de Figma ?", options:["Rien, il est prêt à l'emploi", "Remplacer les valeurs en dur par les variables du projet, adapter les unités, vérifier l'accessibilité", "Le supprimer et tout réécrire à la main systématiquement", "Il faut le convertir en JavaScript"], correct:1},
    {q:"Quel raccourci clavier transforme une sélection en conteneur Auto Layout ?", options:["Ctrl/Cmd + D", "Shift + A", "Ctrl/Cmd + G", "Ctrl/Cmd + /"], correct:1}
  ]
};

const DS_M5 = {
  id:'ds-m5', title:'Module 5 · Design systems et accessibilité', level:'Cohérence',
  chapters:[
    { id:'ds5-1', title:"Les tokens de design", subtitle:"Le pont direct entre le design et les variables CSS.",
      body:
        callout('cle',"Définition","Un **design token** est une valeur de design nommée (une couleur, un espacement, une taille de police) définie une seule fois et réutilisée partout — dans Figma comme dans le code.") +
        p("Tu connais déjà cette idée : ce sont exactement les variables CSS (`:root { --accent: ... }`) utilisées depuis le début de ce parcours webdesign, et dans le module CSS du parcours Développeur Web.") +
        code('css', "/* Design tokens = variables CSS */\n:root {\n  --color-primary: #16324F;\n  --color-danger: #C23B3B;\n  --space-md: 16px;\n  --radius-md: 8px;\n  --font-body: 'Inter', sans-serif;\n}") +
        h3("Pourquoi c'est essentiel à grande échelle") +
        ul([
          "Changer une couleur de marque devient **une seule modification**, partout à la fois",
          "Design et code parlent le **même langage** : un token \"space-md\" a le même sens des deux côtés",
          "Ça évite les dérives (\"encore un bleu légèrement différent\") qui rendent une interface incohérente avec le temps"
        ])
    },
    { id:'ds5-2', title:"Construire des composants réutilisables",
      body:
        p("Un bon composant d'interface (bouton, champ, carte…) documente **tous ses états**, pas seulement son apparence par défaut.") +
        h3("Les états à toujours prévoir") +
        table(["État","Description"],[
          ["**Par défaut**","L'apparence normale, au repos"],
          ["**Survol (hover)**","Retour visuel quand la souris passe dessus"],
          ["**Focus**","Indicateur visible pour la navigation au clavier — vu dans le module Accessibilité du parcours Développeur Web"],
          ["**Actif / pressé**","Pendant le clic"],
          ["**Désactivé (disabled)**","Grisé, non cliquable, avec une raison compréhensible si possible"],
          ["**Erreur**","Pour les champs de formulaire notamment, avec un message explicite"]
        ]) +
        callout('attention',"Erreur fréquente","Une maquette qui ne montre que l'état \"par défaut\" d'un bouton oblige le développeur à inventer les autres états lui-même — ce qui crée des incohérences. Demande toujours les 6 états ci-dessus avant de coder un composant important.") +
        h3("Documenter, pas seulement dessiner") +
        p("Dans une équipe, un design system s'accompagne souvent d'une documentation vivante (par exemple avec l'outil **Storybook** côté développement) qui montre chaque composant, ses variantes et son code d'utilisation — un peu comme une bibliothèque de composants qu'on peut consulter et copier.")
    },
    { id:'ds5-3', title:"Accessibilité : concevoir pour tout le monde", subtitle:"Le design et le développement partagent cette responsabilité à parts égales.",
      body:
        p("L'accessibilité n'est pas une case à cocher à la fin d'un projet : elle se décide dès la maquette.") +
        h3("Ce qui se joue dès le design") +
        checklist([
          "Le contraste des couleurs respecte les ratios WCAG (vu au module 1)",
          "L'information n'est jamais portée par la couleur seule (ex : pas \"le champ rouge est en erreur\" sans aussi un texte ou une icône)",
          "La taille de police reste lisible (16px minimum pour le texte courant)",
          "Les zones cliquables respectent une taille minimale (44×44px sur mobile)",
          "Un état de focus clairement visible est prévu pour chaque élément interactif"
        ]) +
        h3("Ce qui se joue ensuite dans le code") +
        p("Tu as déjà vu l'essentiel dans le parcours Développeur Web : HTML sémantique (`<header>`, `<nav>`, `<button>` plutôt que des `<div>` cliquables), attribut `alt` sur les images, `<label>` associé à chaque `<input>`, et un style `:focus-visible` explicite — exactement ce qui a été ajouté à l'application que tu es en train d'utiliser.") +
        h3("Tester rapidement l'accessibilité d'une interface") +
        ul([
          "Navigue uniquement au clavier (Tab, Entrée, Échap) : tout reste-t-il utilisable ?",
          "Réduis le zoom du navigateur à 200% : le texte reste-t-il lisible sans chevauchement ?",
          "Utilise un simulateur de daltonisme (disponible dans les outils développeur de Chrome/Firefox) sur ta palette"
        ]) +
        callout('cle',"À retenir","Une interface accessible n'est pas une interface \"en plus\" pour une minorité : c'est une interface plus claire, plus prévisible et plus robuste pour absolument tout le monde.")
    }
  ],
  quiz:[
    {q:"Qu'est-ce qu'un design token ?", options:["Un mot de passe Figma", "Une valeur de design nommée et réutilisable, partagée entre design et code (ex : une variable CSS)", "Un composant React uniquement", "Un plugin Figma payant"], correct:1},
    {q:"Pourquoi faut-il documenter l'état \"disabled\" (désactivé) d'un bouton dès la maquette ?", options:["Ce n'est pas nécessaire", "Sinon le développeur doit l'inventer lui-même, ce qui crée des incohérences", "Un bouton désactivé n'a pas besoin de style", "C'est purement décoratif"], correct:1},
    {q:"Pourquoi ne jamais faire porter une information uniquement par la couleur (ex : un champ en erreur juste en rouge) ?", options:["Le rouge est difficile à produire en CSS", "Les personnes daltoniennes ou malvoyantes risquent de ne pas percevoir l'information", "Ça ralentit le site", "Il n'y a pas de raison"], correct:1},
    {q:"Quel est l'intérêt principal des design tokens à l'échelle d'un projet ?", options:["Ils rendent le site plus rapide", "Modifier une valeur (couleur, espacement) se répercute automatiquement partout où elle est utilisée", "Ils remplacent le besoin de tester le site", "Ils sont obligatoires pour publier un site"], correct:1}
  ]
};

const DS_M6 = {
  id:'ds-m6', title:'Module 6 · Projet pratique', level:'Projet complet',
  chapters:[
    { id:'ds6-1', title:"Du wireframe à la page en ligne", subtitle:"Applique toute la méthode du parcours sur un cas réel : une page vitrine pour l'Institut CJEPE-BENIN.",
      body:
        callout('cle',"Le brief","Concevoir puis coder une landing page présentant la formation \"Développeur Web\" de l'institut — les mêmes informations que sur le flyer d'origine : programme, durée (7 mois), prix, contact.") +
        h3("Étape 1 — Cadrer avant de dessiner") +
        ul([
          "**Persona** : un jeune adulte à Cotonou, cherchant une formation professionnelle courte, consultant surtout depuis son téléphone",
          "**Objectif principal de la page** : une seule action prioritaire — \"S'inscrire\" ou \"Appeler pour plus d'infos\"",
          "**Contenu indispensable** : titre accrocheur, liste du programme, durée, prix, contact, un seul bouton d'action clair"
        ]) +
        h3("Étape 2 — Wireframe mobile-first") +
        p("Esquisse d'abord la version mobile, sans couleur : un bloc titre, un court paragraphe, une liste du programme, un bloc prix, un bouton d'action bien visible, les coordonnées en bas.") +
        h3("Étape 3 — Palette, typographie et espacement") +
        p("En t'appuyant sur le module 1 : une couleur primaire (ex. le bleu marine de l'institut), un accent (le doré du logo), une échelle typographique à deux niveaux (titres / texte), un système d'espacement à base 8.") +
        h3("Étape 4 — Maquette Figma en composants") +
        p("Construis les éléments comme des composants réutilisables (bouton, carte de programme) avec Auto Layout — en pensant déjà, comme au module 4, à leurs futurs équivalents en HTML/CSS.") +
        h3("Étape 5 — Coder la page") +
        p("Traduis la maquette avec ce que tu maîtrises déjà : HTML sémantique, variables CSS pour les tokens, Flexbox/Grid pour la mise en page, une media query pour le passage au format desktop.") +
        code('html',
"<section class=\"hero\">\n  <p class=\"eyebrow\">Institut de Formation Professionnelle</p>\n  <h1>Deviens Développeur Web</h1>\n  <p>Programmation Web · Développement mobile · Webdesign</p>\n  <a class=\"btn\" href=\"#contact\">S'inscrire — 15 000 F CFA</a>\n</section>", "index.html (extrait)") +
        code('css',
":root {\n  --color-primary: #16324F;\n  --color-accent: #A97E28;\n  --space-md: 16px;\n  --radius-md: 12px;\n}\n\n.hero {\n  display: flex;\n  flex-direction: column;\n  gap: var(--space-md);\n  padding: 32px 24px;\n}\n\n.btn {\n  background: var(--color-primary);\n  color: white;\n  padding: 12px 24px;\n  border-radius: var(--radius-md);\n}\n\n@media (min-width: 768px) {\n  .hero { padding: 64px 48px; max-width: 640px; }\n}", "style.css (extrait)") +
        h3("Étape 6 — Vérifier avant de livrer") +
        checklist([
          "Contraste texte/fond conforme (module 1)",
          "Zones cliquables ≥ 44×44px sur mobile (module 3)",
          "Navigation clavier complète, focus visible (module 5)",
          "La page reste claire sans aucune couleur (test en niveaux de gris)",
          "Un seul message principal ressort clairement de la page"
        ]) +
        callout('astuce',"Pour aller plus loin","Reprends ce mini-projet et connecte le formulaire de contact au back-end Django vu dans le parcours Développeur Web (module 7) : tu boucles alors tout le cycle — design, code front-end, et traitement des données côté serveur.")
    }
  ],
  quiz:[
    {q:"Dans ce projet, pourquoi commencer par le wireframe mobile plutôt que par la version desktop ?", options:["C'est plus joli", "Pour appliquer l'approche mobile-first : identifier l'essentiel avant d'enrichir pour le grand écran", "Le desktop n'est pas important", "Figma ne permet pas de faire du desktop en premier"], correct:1},
    {q:"Que doit vérifier le test \"en niveaux de gris\" d'une page avant de la livrer ?", options:["Que la page charge vite", "Que la hiérarchie de l'information reste claire même sans la couleur", "Que le CSS est valide", "Que les images sont bien compressées"], correct:1},
    {q:"Pourquoi construire les éléments de la maquette comme des composants réutilisables (bouton, carte) ?", options:["Ça n'a pas d'impact particulier", "Ça facilite directement la traduction en composants de code, cohérents partout où ils sont utilisés", "C'est une obligation de Figma", "Ça ralentit le travail de design"], correct:1}
  ]
};

TRACKS.push({
  id:'design', color:'design', tag:'Parcours Design', shortLabel:'Webdesign',
  label:'Webdesign — Concevoir des interfaces, pour développeurs',
  tagline:"Les fondamentaux du design d'interface pensés pour un développeur : comprendre, discuter et traduire une maquette en code, sans devenir graphiste.",
  description:"Couleur, typographie, UX, grilles responsives, Figma en mode développeur, design systems et accessibilité — jusqu'à un projet complet, du wireframe à la page en ligne, qui réutilise directement les acquis HTML/CSS du parcours Développeur Web.",
  meta:["🎨 Pensé pour développeurs","🧩 Relié au parcours Développeur Web","🧪 Se termine par un projet complet"],
  modules:[DS_M0, DS_M1, DS_M2, DS_M3, DS_M4, DS_M5, DS_M6]
});

/* ---------- État & routage ---------- */
const State = { trackId:null, moduleId:null, chapterId:null, openModules:new Set() };

function getTrack(id){ return TRACKS.find(t=>t.id===id); }
function getModule(t,id){ return t.modules.find(m=>m.id===id); }
function getChapter(m,id){ return m.chapters.find(c=>c.id===id); }
function allChaptersFlat(t){
  const out=[];
  t.modules.forEach(m=>m.chapters.forEach(c=>out.push({m,c})));
  return out;
}
function totalChapterCount(t){ return allChaptersFlat(t).length; }

/* progression (localStorage) */
function doneSet(){
  try{ return new Set(JSON.parse(localStorage.getItem('cjepe_done')||'[]')); }catch(e){ return new Set(); }
}
function saveDone(set){ localStorage.setItem('cjepe_done', JSON.stringify([...set])); }
function chapterKey(tid,mid,cid){ return tid+'::'+mid+'::'+cid; }
function isDone(tid,mid,cid){ return doneSet().has(chapterKey(tid,mid,cid)); }
function toggleDone(tid,mid,cid){
  const s = doneSet(); const k = chapterKey(tid,mid,cid);
  if(s.has(k)) s.delete(k); else s.add(k);
  saveDone(s);
}
function trackProgress(t){
  const s = doneSet(); const flat = allChaptersFlat(t);
  const n = flat.filter(x=>s.has(chapterKey(t.id,x.m.id,x.c.id))).length;
  return {done:n, total:flat.length, pct: flat.length? Math.round(100*n/flat.length):0};
}
function moduleProgress(t,m){
  const s = doneSet();
  const n = m.chapters.filter(c=>s.has(chapterKey(t.id,m.id,c.id))).length;
  return {done:n, total:m.chapters.length, pct: m.chapters.length? Math.round(100*n/m.chapters.length):0};
}

function setHash(h){ location.hash = h; }
function parseHash(){
  const raw = location.hash.replace(/^#\/?/,'');
  const parts = raw.split('/').filter(Boolean);
  return parts;
}
function go(where){
  if(where==='home'){ setHash(''); }
}
window.addEventListener('hashchange', render);

/* ---------- Rendu topbar / tabs ---------- */
function renderTabs(){
  const el = document.getElementById('trackTabs');
  el.innerHTML = TRACKS.map(t=>{
    const active = State.trackId===t.id ? 'active':'';
    return '<button class="track-tab '+active+'" onclick="setHash(\''+t.id+'\')">'+
      '<span class="dot" style="background:var(--'+t.color+')"></span>'+t.shortLabel+'</button>';
  }).join('');
}

/* ---------- Rendu sidebar ---------- */
function renderSidebar(){
  const sb = document.getElementById('sidebar');
  if(!State.trackId){ sb.classList.add('sidebar-hidden'); sb.innerHTML=''; return; }
  sb.classList.remove('sidebar-hidden');
  const t = getTrack(State.trackId);
  const prog = trackProgress(t);
  let html = '<div class="side-track-title"><span class="swatch" style="background:var(--'+t.color+')"></span>'+
    '<h2>'+t.shortLabel+'</h2><span class="progress-pill">'+prog.done+'/'+prog.total+'</span></div>';
  t.modules.forEach((m,mi)=>{
    const open = State.openModules.has(m.id) || State.moduleId===m.id;
    const mp = moduleProgress(t,m);
    html += '<div class="side-module">';
    html += '<button class="side-module-btn '+(open?'open':'')+'" onclick="toggleModule(\''+m.id+'\')">'+
      '<span class="side-module-num">'+(mi+1)+'</span><span>'+esc(m.title)+'</span>'+
      '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>';
    html += '<ul class="side-chapters '+(open?'open':'')+'">';
    m.chapters.forEach(c=>{
      const active = (State.moduleId===m.id && State.chapterId===c.id) ? 'active':'';
      const done = isDone(t.id,m.id,c.id);
      html += '<li><a class="'+active+'" href="#/'+t.id+'/'+m.id+'/'+c.id+'"><span class="chk '+(done?'done':'')+'"></span>'+esc(c.title)+'</a></li>';
    });
    html += '</ul></div>';
  });
  sb.innerHTML = html;
}
function toggleModule(mid){
  if(State.openModules.has(mid)) State.openModules.delete(mid); else State.openModules.add(mid);
  renderSidebar();
}
function toggleMobileSidebar(){
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('scrim').classList.toggle('show');
}

/* ---------- Vue: accueil global ---------- */
function viewHome(){
  let html = '<div class="hero-banner"><div class="hero-eyebrow">Institut de Formation Professionnelle</div>'+
    '<h1>Bienvenue à l’Académie CJEPE-BENIN</h1>'+
    '<p>Trois parcours numériques, pensés pour un débutant complet : Développeur Web, Cybersécurité et Labo pratique (VirtualBox &amp; Kali Linux). Choisis un parcours pour commencer, ton avancement est sauvegardé automatiquement sur cet appareil.</p>'+
    '<div class="hero-meta"><span>📍 <b>Cotonou</b></span><span>☎ <b>+229 01 40 32 10 84</b></span><span>🕘 <b>Cours en journée, soirée et en ligne</b></span></div>'+
    '</div>';
  html += '<div class="track-grid">';
  TRACKS.forEach(t=>{
    const prog = trackProgress(t);
    html += '<div class="track-card" onclick="setHash(\''+t.id+'\')"><div class="bar" style="background:var(--'+t.color+')"></div>'+
      '<span class="badge badge-'+t.id+'">'+t.tag+'</span><h3>'+esc(t.label)+'</h3><p>'+esc(t.tagline)+'</p>'+
      '<div class="stat">'+t.modules.length+' modules · '+totalChapterCount(t)+' leçons'+(prog.done? ' · '+prog.pct+'% complété':'')+'</div></div>';
  });
  html += '</div>';
  document.getElementById('contentInner').innerHTML = html;
}

/* ---------- Vue: page d'un parcours ---------- */
function viewTrack(t){
  const prog = trackProgress(t);
  let html = '<div class="crumbs"><a href="#">Accueil</a><span>/</span><span>'+esc(t.label)+'</span></div>';
  html += '<div class="hero-banner"><div class="hero-eyebrow">'+esc(t.tag)+'</div><h1>'+esc(t.label)+'</h1>'+
    '<p>'+esc(t.description)+'</p>'+
    '<div class="hero-meta">'+t.meta.map(x=>'<span>'+x+'</span>').join('')+
    '<span>📈 <b>'+prog.pct+'%</b> complété ('+prog.done+'/'+prog.total+')</span></div></div>';
  html += '<div class="module-cards">';
  t.modules.forEach((m,mi)=>{
    const mp = moduleProgress(t,m);
    const firstChap = m.chapters[0];
    html += '<div class="module-card" onclick="setHash(\''+t.id+'/'+m.id+'/'+firstChap.id+'\')">'+
      '<div class="mnum">'+(mi+1)+'</div><div class="mbody"><h4>'+esc(m.title)+'</h4>'+
      '<div class="msub">'+m.chapters.length+' leçons'+(m.level?' · '+esc(m.level):'')+'</div></div>'+
      '<div class="mprog">'+mp.done+'/'+mp.total+'<div class="bartrack"><div class="barfill" style="width:'+mp.pct+'%;background:var(--'+t.color+')"></div></div></div>'+
      '</div>';
  });
  html += '</div>';
  document.getElementById('contentInner').innerHTML = html;
}

/* ---------- Vue: chapitre ---------- */
function viewChapter(t,m,c){
  const flat = allChaptersFlat(t);
  const idx = flat.findIndex(x=>x.c.id===c.id && x.m.id===m.id);
  const prev = idx>0? flat[idx-1]:null;
  const next = idx<flat.length-1? flat[idx+1]:null;
  const done = isDone(t.id,m.id,c.id);

  let html = '<div class="crumbs"><a href="#">Accueil</a><span>/</span><a href="#/'+t.id+'">'+esc(t.label)+'</a><span>/</span><span>'+esc(m.title)+'</span></div>';
  html += '<div class="chapter-head"><span class="badge badge-'+t.id+'">'+esc(m.title)+'</span><h1>'+esc(c.title)+'</h1>';
  if(c.subtitle) html += '<p class="chapter-sub">'+esc(c.subtitle)+'</p>';
  html += '</div>';
  html += '<div class="prose">'+c.body+'</div>';

  if(m.quiz && c.id===m.chapters[m.chapters.length-1].id){
    html += renderQuiz(t,m);
  }

  html += '<div class="mark-done-row"><button class="mark-done '+(done?'on':'')+'" id="doneBtn" onclick="onToggleDone(\''+t.id+'\',\''+m.id+'\',\''+c.id+'\')">'+
    '<span>'+(done?'✓ Leçon terminée':'Marquer comme terminé')+'</span></button></div>';

  html += '<div class="chapnav">';
  html += prev? '<a class="prev" href="#/'+t.id+'/'+prev.m.id+'/'+prev.c.id+'"><span class="lbl">← Précédent</span>'+esc(prev.c.title)+'</a>' : '<span></span>';
  html += next? '<a class="next" href="#/'+t.id+'/'+next.m.id+'/'+next.c.id+'"><span class="lbl">Suivant →</span>'+esc(next.c.title)+'</a>' : '<span></span>';
  html += '</div>';

  html += '<div class="foot-note">Contenu pédagogique — Académie CJEPE-BENIN. Parcours « '+esc(t.label)+' », module « '+esc(m.title)+' ».</div>';

  document.getElementById('contentInner').innerHTML = html;
}
function onToggleDone(tid,mid,cid){
  toggleDone(tid,mid,cid);
  const t=getTrack(tid),m=getModule(t,mid),c=getChapter(m,cid);
  viewChapter(t,m,c);
  renderSidebar();
  renderTabs();
}

/* ---------- Quiz ---------- */
function renderQuiz(t,m){
  let html = '<div class="quiz"><h3>Vérifie tes connaissances</h3><p class="hint">Module « '+esc(m.title)+' » — choisis une réponse par question.</p>';
  m.quiz.forEach((q,qi)=>{
    html += '<div class="qitem" data-qi="'+qi+'"><p class="qtext">'+(qi+1)+'. '+esc(q.q)+'</p><div class="qopts">';
    q.options.forEach((o,oi)=>{
      html += '<label class="qopt" data-oi="'+oi+'" onclick="answerQuiz(this,'+qi+','+oi+','+q.correct+')"><input type="radio" name="q'+m.id+'_'+qi+'" /> '+esc(o)+'</label>';
    });
    html += '</div></div>';
  });
  html += '<div id="quizResult" class="quiz-result"></div></div>';
  return html;
}
function answerQuiz(el,qi,oi,correctIdx){
  const group = el.closest('.qitem').querySelectorAll('.qopt');
  group.forEach(g=>{g.classList.remove('correct','wrong'); g.querySelector('input').checked=false;});
  el.querySelector('input').checked = true;
  if(oi===correctIdx){ el.classList.add('correct'); } else { el.classList.add('wrong'); group[correctIdx].classList.add('correct'); }
  updateQuizScore(el.closest('.quiz'));
}
function updateQuizScore(quizEl){
  const items = quizEl.querySelectorAll('.qitem');
  let answered=0, correct=0;
  items.forEach(it=>{
    const chosen = it.querySelector('.qopt input:checked');
    if(chosen){ answered++; if(chosen.closest('.qopt').classList.contains('correct')) correct++; }
  });
  const res = quizEl.querySelector('#quizResult');
  if(answered===items.length){ res.textContent = 'Score : '+correct+' / '+items.length+(correct===items.length? ' — Excellent ! 🎉':' — Relis les points manqués puis continue.'); }
}

/* ---------- Recherche ---------- */
function onSearch(q){
  q = q.trim().toLowerCase();
  const results = document.getElementById('searchResults');
  if(!q){ if(results) results.remove(); return; }
  const hits=[];
  TRACKS.forEach(t=>t.modules.forEach(m=>m.chapters.forEach(c=>{
    if((c.title+' '+m.title).toLowerCase().includes(q)) hits.push({t,m,c});
  })));
  let box = document.getElementById('searchResults');
  if(!box){
    box = document.createElement('div');
    box.id='searchResults';
    box.style.cssText='position:fixed;top:57px;right:1rem;width:320px;max-height:70vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);z-index:60;padding:.5rem;';
    document.body.appendChild(box);
  }
  box.innerHTML = hits.slice(0,20).map(h=>
    '<a href="#/'+h.t.id+'/'+h.m.id+'/'+h.c.id+'" style="display:block;padding:.5rem .6rem;border-radius:7px;text-decoration:none;color:var(--ink);font-size:.83rem;" onmouseover="this.style.background=\'var(--surface-2)\'" onmouseout="this.style.background=\'\'">'+
    '<div style="font-weight:600;">'+esc(h.c.title)+'</div><div style="font-size:.72rem;color:var(--ink-faint);">'+esc(h.t.shortLabel)+' · '+esc(h.m.title)+'</div></a>'
  ).join('') || '<div style="padding:.6rem;color:var(--ink-faint);font-size:.83rem;">Aucun résultat</div>';
}
document.addEventListener('click', e=>{
  const box = document.getElementById('searchResults');
  if(box && !box.contains(e.target) && e.target.id!=='searchInput'){ box.remove(); }
});

/* ---------- Thème ---------- */
function toggleTheme(){
  const root = document.documentElement;
  const cur = root.getAttribute('data-theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let next;
  if(!cur) next = sysDark? 'light':'dark';
  else next = cur==='dark' ? 'light':'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('cjepe_theme', next);
  document.getElementById('themeBtn').textContent = next==='dark' ? '☀' : '☾';
}
(function initTheme(){
  const saved = localStorage.getItem('cjepe_theme');
  if(saved){ document.documentElement.setAttribute('data-theme', saved); }
  document.getElementById('themeBtn').textContent = (saved==='dark') ? '☀' : '☾';
})();

/* ---------- Rendu principal ---------- */
function render(){
  const parts = parseHash();
  const [tid,mid,cid] = parts;
  window.scrollTo(0,0);
  document.getElementById('contentInner').scrollTop=0;
  document.querySelector('main.content').scrollTop = 0;
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('scrim').classList.remove('show');

  if(!tid){
    State.trackId=null; State.moduleId=null; State.chapterId=null;
    renderTabs(); renderSidebar(); viewHome();
    return;
  }
  const t = getTrack(tid);
  if(!t){ setHash(''); return; }
  State.trackId = t.id;

  if(!mid){
    State.moduleId=null; State.chapterId=null;
    renderTabs(); renderSidebar(); viewTrack(t);
    return;
  }
  const m = getModule(t,mid);
  if(!m){ setHash(t.id); return; }
  State.moduleId = m.id; State.openModules.add(m.id);

  if(!cid){
    setHash(t.id+'/'+m.id+'/'+m.chapters[0].id);
    return;
  }
  const c = getChapter(m,cid);
  if(!c){ setHash(t.id+'/'+m.id); return; }
  State.chapterId = c.id;

  renderTabs(); renderSidebar(); viewChapter(t,m,c);
  highlightAllCode();
}
function highlightAllCode(){ /* déjà fait au rendu du contenu via code() */ }

render();
