import pptxgen from 'pptxgenjs'

const pptx = new pptxgen()
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'JCI Sousse'
pptx.company = 'JCI Sousse'
pptx.title = 'Hack Tank - Proposition d interfaces et contenus'
pptx.lang = 'fr-FR'
pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'fr-FR' }

const C = { navy: '0C2340', ink: '10233B', blue: '0057B8', sky: 'DCEAF8', gold: 'F4B400', cream: 'F5F2EA', white: 'FFFFFF', grey: '61738A', green: '48A47C', coral: 'E66848' }
const S = pptx.ShapeType

function base(slide, dark = false, section = '') {
  slide.background = { color: dark ? C.navy : C.cream }
  slide.addShape(S.rect, { x: 0, y: 0, w: 13.333, h: 0.09, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText('HACK TANK', { x: 0.6, y: 0.32, w: 2.2, h: 0.2, fontSize: 9, bold: true, charSpacing: 1.5, color: dark ? C.white : C.ink, margin: 0 })
  slide.addText('JCI SOUSSE', { x: 10.85, y: 0.32, w: 1.9, h: 0.2, fontSize: 8, bold: true, charSpacing: 1.2, align: 'right', color: dark ? 'B9CBDC' : C.grey, margin: 0 })
  if (section) slide.addText(section, { x: 0.6, y: 7.05, w: 6, h: 0.15, fontSize: 7.5, charSpacing: 1.1, color: dark ? '8FA8BF' : C.grey, margin: 0 })
}

function heading(slide, text, accent, dark = false) {
  slide.addText(text, { x: 0.62, y: 0.96, w: 10.8, h: 0.48, fontSize: 29, bold: true, color: dark ? C.white : C.ink, margin: 0 })
  if (accent) slide.addText(accent, { x: 0.62, y: 1.55, w: 9.8, h: 0.27, fontSize: 15, bold: true, color: C.gold, margin: 0 })
}

function label(slide, text, x, y, color = C.blue) {
  slide.addText(text, { x, y, w: 2.8, h: 0.16, fontSize: 8, bold: true, charSpacing: 1, color, margin: 0 })
}

function point(slide, text, x, y, width, dark = false) {
  slide.addShape(S.ellipse, { x, y: y + 0.07, w: 0.1, h: 0.1, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText(text, { x: x + 0.2, y, w: width - 0.2, h: 0.29, fontSize: 11.5, color: dark ? 'DCE7F0' : C.ink, margin: 0 })
}

function mockBrowser(slide, x, y, w, h, name) {
  slide.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.05, fill: { color: C.white }, line: { color: 'C5D0DB', width: 0.8 }, shadow: { type: 'outer', color: '60738A', opacity: 0.14, blur: 1, angle: 45, distance: 2 } })
  slide.addShape(S.rect, { x, y, w, h: 0.28, fill: { color: 'E6EBEF' }, line: { color: 'E6EBEF' } })
  ;[0, 1, 2].forEach(index => slide.addShape(S.ellipse, { x: x + 0.14 + index * 0.12, y: y + 0.095, w: 0.055, h: 0.055, fill: { color: index === 0 ? C.coral : index === 1 ? C.gold : C.green }, line: { color: 'FFFFFF', transparency: 100 } }))
  slide.addText(name, { x: x + 0.55, y: y + 0.09, w: w - 0.75, h: 0.08, fontSize: 5.5, color: C.grey, align: 'center', margin: 0 })
}

// Cover
{
  const slide = pptx.addSlide(); base(slide, true)
  slide.addShape(S.ellipse, { x: 8.75, y: 1.35, w: 3.9, h: 3.9, fill: { color: C.blue, transparency: 35 }, line: { color: '4B92D8', transparency: 40 } })
  slide.addShape(S.ellipse, { x: 9.5, y: 2.1, w: 2.4, h: 2.4, fill: { color: C.navy, transparency: 5 }, line: { color: C.gold, transparency: 15, width: 1.3 } })
  slide.addText('Proposition des\ninterfaces & contenus', { x: 0.72, y: 1.45, w: 7.2, h: 1.08, fontSize: 36, bold: true, color: C.white, margin: 0 })
  slide.addText('Document de validation pour construire le site public de Hack Tank.', { x: 0.76, y: 3.05, w: 5.8, h: 0.38, fontSize: 16, color: 'B8C9D9', margin: 0 })
  slide.addShape(S.roundRect, { x: 0.76, y: 4.08, w: 2.35, h: 0.4, rectRadius: 0.04, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText('A VALIDER EN REUNION', { x: 0.76, y: 4.2, w: 2.35, h: 0.1, fontSize: 7.5, bold: true, charSpacing: 0.8, align: 'center', color: C.navy, margin: 0 })
  slide.addText('HACK TANK / JCI SOUSSE', { x: 0.76, y: 6.45, w: 4.3, h: 0.18, fontSize: 10, bold: true, charSpacing: 1.3, color: C.gold, margin: 0 })
}

// Objective
{
  const slide = pptx.addSlide(); base(slide, false, '01 / OBJECTIF DE LA REUNION')
  heading(slide, 'Decider ensemble de ce que', 'le visiteur voit, comprend et fait.')
  const choices = [
    ['CONTENU', 'Quels textes, images et informations publier ?'],
    ['INTERFACES', 'Quels ecrans sont necessaires au parcours ?'],
    ['STYLE', 'Quelle impression doit laisser Hack Tank ?'],
    ['PRIORITES', 'Que lancer dans la premiere version du site ?'],
  ]
  choices.forEach((choice, index) => {
    const x = 0.7 + index * 3.14
    slide.addShape(S.rect, { x, y: 3.0, w: 2.8, h: 2.22, fill: { color: index === 0 ? C.blue : C.white }, line: { color: index === 0 ? C.blue : 'CFD7DF', width: 0.7 } })
    slide.addText(`0${index + 1}`, { x: x + 0.22, y: 3.25, w: 0.35, h: 0.15, fontSize: 8, bold: true, color: index === 0 ? C.gold : C.blue, margin: 0 })
    slide.addText(choice[0], { x: x + 0.22, y: 3.66, w: 2.15, h: 0.2, fontSize: 10, bold: true, charSpacing: 0.8, color: index === 0 ? C.white : C.ink, margin: 0 })
    slide.addText(choice[1], { x: x + 0.22, y: 4.15, w: 2.25, h: 0.55, fontSize: 13, bold: true, color: index === 0 ? C.white : C.ink, margin: 0 })
  })
  slide.addText('A la fin de la reunion, nous aurons une liste claire de contenus a fournir et une direction d interface a produire.', { x: 0.73, y: 6.0, w: 10.9, h: 0.23, fontSize: 13, italic: true, color: C.grey, margin: 0 })
}

// Information architecture
{
  const slide = pptx.addSlide(); base(slide, true, '02 / PLAN DU SITE')
  heading(slide, 'Les ecrans proposes', 'pour le site public.', true)
  const pages = [['ACCUEIL', 'Faire comprendre et donner envie'], ['INSCRIPTION', 'Collecter les candidatures'], ['PROGRAMME', 'Expliquer le deroulement'], ['TRACKS & PRIX', 'Orienter les idees et motiver'], ['MENTORS & JURY', 'Donner confiance'], ['FAQ & CONTACT', 'Lever les dernieres questions']]
  pages.forEach((page, index) => {
    const row = Math.floor(index / 3); const col = index % 3; const x = 0.72 + col * 4.14; const y = 2.65 + row * 1.75
    slide.addShape(S.rect, { x, y, w: 3.72, h: 1.3, fill: { color: index === 1 ? C.gold : '123454' }, line: { color: index === 1 ? C.gold : '315B81', width: 0.6 } })
    slide.addText(`0${index + 1}`, { x: x + 0.22, y: y + 0.22, w: 0.3, h: 0.14, fontSize: 8, bold: true, color: index === 1 ? C.navy : C.gold, margin: 0 })
    slide.addText(page[0], { x: x + 0.65, y: y + 0.2, w: 2.65, h: 0.18, fontSize: 10, bold: true, charSpacing: 0.8, color: index === 1 ? C.navy : C.white, margin: 0 })
    slide.addText(page[1], { x: x + 0.22, y: y + 0.7, w: 3.05, h: 0.2, fontSize: 10.5, color: index === 1 ? C.navy : 'C1D2E2', margin: 0 })
  })
  slide.addText("L'inscription est le seul ecran d'action obligatoire. Les autres ecrans accompagnent la decision de s'inscrire.", { x: 0.72, y: 6.26, w: 11.7, h: 0.22, fontSize: 12, color: C.gold, margin: 0 })
}

// Homepage interface
{
  const slide = pptx.addSlide(); base(slide, false, '03 / INTERFACE - ACCUEIL')
  heading(slide, "L'accueil : une invitation", 'claire, forte et immediate.')
  mockBrowser(slide, 6.65, 2.25, 5.75, 3.72, 'hacktank.jci-sousse.org')
  slide.addShape(S.rect, { x: 6.67, y: 2.54, w: 5.71, h: 3.4, fill: { color: C.navy }, line: { color: C.navy } })
  slide.addText('HACK TANK', { x: 6.98, y: 2.82, w: 1.3, h: 0.13, fontSize: 6.5, bold: true, color: C.white, margin: 0 })
  slide.addText('Make the\nunthinkable\nuseful.', { x: 6.98, y: 3.38, w: 2.9, h: 1.04, fontSize: 23, bold: true, color: C.white, margin: 0 })
  slide.addShape(S.ellipse, { x: 10.0, y: 3.15, w: 1.85, h: 1.85, fill: { color: C.blue, transparency: 30 }, line: { color: '69A8E5', transparency: 35 } })
  slide.addShape(S.rect, { x: 6.98, y: 5.0, w: 1.42, h: 0.36, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText("S'INSCRIRE", { x: 7.14, y: 5.12, w: 1.1, h: 0.08, fontSize: 6, bold: true, color: C.navy, margin: 0 })
  label(slide, 'CONTENU A FOURNIR', 0.72, 2.48)
  point(slide, "Une phrase courte de promesse : pourquoi participer ?", 0.72, 2.94, 5.3)
  point(slide, "Date, heure, lieu et format de l'evenement.", 0.72, 3.55, 5.3)
  point(slide, 'Un bouton principal : Inscrire mon equipe ou Je participe.', 0.72, 4.16, 5.3)
  point(slide, 'Une photo ou une video authentique de la communaute JCI.', 0.72, 4.77, 5.3)
  slide.addText('Question de validation : quelle est la phrase que chaque visiteur doit retenir en 5 secondes ?', { x: 0.72, y: 5.75, w: 5.3, h: 0.35, fontSize: 11, bold: true, color: C.blue, margin: 0 })
}

// Event content
{
  const slide = pptx.addSlide(); base(slide, false, '04 / INTERFACE - INFORMATIONS EVENEMENT')
  heading(slide, 'Les contenus qui font', 'passer de “interesse” a “inscrit”.')
  const items = [
    ['LE CONCEPT', "Le probleme, l'ambition de Hack Tank et l'impact attendu."],
    ['LE PROGRAMME', 'Heures, etapes, repas, mentoring, pitch et remise des prix.'],
    ['LES TRACKS', 'Les themes officiels et leurs exemples de defis.'],
    ['LES PRIX', 'Montants, avantages, opportunites apres le hackathon.'],
    ['LES MENTORS', 'Photos, noms, fonctions, entreprises et expertises.'],
    ['LES PARTENAIRES', 'Logos, niveau de partenariat et liens si convenu.'],
  ]
  items.forEach((item, index) => {
    const col = index % 2; const row = Math.floor(index / 2); const x = 0.7 + col * 6.15; const y = 2.48 + row * 1.08
    slide.addShape(S.rect, { x, y, w: 5.72, h: 0.82, fill: { color: C.white }, line: { color: 'D0D9E1', width: 0.6 } })
    slide.addText(`0${index + 1}`, { x: x + 0.18, y: y + 0.29, w: 0.28, h: 0.12, fontSize: 8, bold: true, color: C.gold, margin: 0 })
    slide.addText(item[0], { x: x + 0.64, y: y + 0.2, w: 1.45, h: 0.14, fontSize: 9, bold: true, charSpacing: 0.6, color: C.blue, margin: 0 })
    slide.addText(item[1], { x: x + 2.05, y: y + 0.2, w: 3.35, h: 0.35, fontSize: 9.5, color: C.grey, margin: 0 })
  })
  slide.addText('Principe : aucune section ne doit etre remplie avec des suppositions. Chaque bloc doit avoir un responsable de contenu.', { x: 0.72, y: 6.15, w: 11.5, h: 0.22, fontSize: 12, italic: true, color: C.grey, margin: 0 })
}

// Registration mockup
{
  const slide = pptx.addSlide(); base(slide, true, '05 / INTERFACE - INSCRIPTION')
  heading(slide, "L'inscription : simple", 'meme pour une personne sans equipe.', true)
  mockBrowser(slide, 0.75, 2.32, 5.45, 3.95, 'inscription - Hack Tank')
  slide.addShape(S.rect, { x: 0.77, y: 2.6, w: 2.1, h: 3.65, fill: { color: 'DDE8F1' }, line: { color: 'DDE8F1' } })
  slide.addText('Bring the\nspark.', { x: 1.06, y: 3.08, w: 1.55, h: 0.5, fontSize: 16, bold: true, color: C.navy, margin: 0 })
  ;['01 Participant', '02 Profil', '03 Competences', '04 Equipe & idee', '05 Validation'].forEach((text, index) => slide.addText(text, { x: 1.06, y: 4.1 + index * 0.32, w: 1.45, h: 0.09, fontSize: 5.5, bold: index === 0, color: index === 0 ? C.blue : C.grey, margin: 0 }))
  slide.addText('Commencons\npar vous.', { x: 3.25, y: 3.0, w: 2.2, h: 0.48, fontSize: 16, bold: true, color: C.navy, margin: 0 })
  ;['Prenom', 'Nom', 'Email', 'Telephone'].forEach((text, index) => { const col = index % 2; const row = Math.floor(index / 2); slide.addText(text, { x: 3.25 + col * 1.18, y: 3.93 + row * 0.68, w: 1, h: 0.08, fontSize: 5, color: C.grey, margin: 0 }); slide.addShape(S.line, { x: 3.25 + col * 1.18, y: 4.25 + row * 0.68, w: 0.95, h: 0, line: { color: 'AAB6C2', width: 0.4 } }) })
  slide.addShape(S.rect, { x: 4.35, y: 5.66, w: 1.12, h: 0.28, fill: { color: C.gold }, line: { color: C.gold } }); slide.addText('CONTINUER', { x: 4.48, y: 5.75, w: 0.9, h: 0.05, fontSize: 4.8, bold: true, color: C.navy, margin: 0 })
  label(slide, 'DECISIONS DE CONTENU', 6.82, 2.52, C.gold)
  point(slide, "Quels champs sont obligatoires ?", 6.82, 3.0, 5.25, true)
  point(slide, 'L idee de projet est-elle obligatoire ou facultative ?', 6.82, 3.61, 5.25, true)
  point(slide, 'Comment identifier une equipe deja formee ?', 6.82, 4.22, 5.25, true)
  point(slide, 'Quels consentements : reglement, donnees, droit a image ?', 6.82, 4.83, 5.25, true)
  slide.addShape(S.rect, { x: 6.82, y: 5.62, w: 5.2, h: 0.55, fill: { color: '173B5E' }, line: { color: '315E88' } })
  slide.addText('Objectif : moins de 5 minutes pour terminer une candidature.', { x: 7.05, y: 5.82, w: 4.8, h: 0.12, fontSize: 9.5, bold: true, color: C.gold, margin: 0 })
}

// Tracks, prizes and mentors
{
  const slide = pptx.addSlide(); base(slide, false, '06 / INTERFACES - CONFIANCE ET MOTIVATION')
  heading(slide, 'Tracks, prix et personnes :', 'les elements qui rendent Hack Tank credible.')
  const panels = [
    ['TRACKS', '6 cartes visuelles', 'Nom du theme, defi, exemple de solution.', C.blue],
    ['PRIX', 'Podium lisible', 'Montants, cadeaux, accompagnement apres evenement.', C.gold],
    ['MENTORS & JURY', 'Profils authentiques', 'Photo, nom, role, entreprise, expertise.', C.green],
  ]
  panels.forEach((panel, index) => {
    const x = 0.72 + index * 4.16
    slide.addShape(S.rect, { x, y: 2.72, w: 3.72, h: 2.85, fill: { color: C.white }, line: { color: 'CDD6DE', width: 0.7 } })
    slide.addShape(S.rect, { x, y: 2.72, w: 3.72, h: 0.14, fill: { color: panel[3] }, line: { color: panel[3] } })
    slide.addText(panel[0], { x: x + 0.25, y: 3.18, w: 3.0, h: 0.17, fontSize: 10, bold: true, charSpacing: 1, color: panel[3], margin: 0 })
    slide.addText(panel[1], { x: x + 0.25, y: 3.7, w: 2.9, h: 0.25, fontSize: 18, bold: true, color: C.ink, margin: 0 })
    slide.addText(panel[2], { x: x + 0.25, y: 4.35, w: 2.92, h: 0.46, fontSize: 11, color: C.grey, margin: 0 })
    slide.addText('A FOURNIR PAR L ORGANISATION', { x: x + 0.25, y: 5.06, w: 2.95, h: 0.12, fontSize: 6.7, bold: true, charSpacing: 0.5, color: C.blue, margin: 0 })
  })
}

// Styles visual
{
  const slide = pptx.addSlide(); base(slide, true, '07 / CHOIX VISUEL')
  heading(slide, 'Trois directions visuelles', 'a soumettre au responsable.', true)
  const directions = [
    ['A', 'STARTUP PREMIUM', 'Minimal, ambitieux, international.', C.blue],
    ['B', 'TECH FUTURISTE', 'Grilles, mouvement, IA, energie.', C.gold],
    ['C', 'COMMUNAUTE VIVANTE', 'Photos, humains, couleur, chaleur.', C.coral],
  ]
  directions.forEach((direction, index) => {
    const x = 0.72 + index * 4.18
    slide.addShape(S.rect, { x, y: 2.65, w: 3.75, h: 2.85, fill: { color: '123454' }, line: { color: '35618A', width: 0.7 } })
    slide.addText(direction[0], { x: x + 0.25, y: 2.98, w: 0.4, h: 0.3, fontSize: 24, bold: true, color: direction[3], margin: 0 })
    slide.addText(direction[1], { x: x + 0.25, y: 3.58, w: 3.1, h: 0.18, fontSize: 10, bold: true, charSpacing: 0.8, color: C.white, margin: 0 })
    slide.addText(direction[2], { x: x + 0.25, y: 4.16, w: 3.0, h: 0.32, fontSize: 12, color: 'C5D5E4', margin: 0 })
    slide.addShape(S.rect, { x: x + 0.25, y: 4.92, w: 2.9, h: 0.06, fill: { color: direction[3] }, line: { color: direction[3] } })
  })
  slide.addText('Recommandation : A + B, avec de vraies photos JCI pour garder une dimension humaine.', { x: 0.75, y: 6.1, w: 11.5, h: 0.22, fontSize: 13, bold: true, color: C.gold, margin: 0 })
}

// Content checklist
{
  const slide = pptx.addSlide(); base(slide, false, '08 / LISTE DES CONTENUS A FOURNIR')
  heading(slide, 'Ce dont nous avons besoin', 'pour finaliser les interfaces.')
  const content = ['Nom, slogan et description officielle de Hack Tank', 'Date, lieu precis, horaires et programme', 'Reglement, conditions de participation et contacts', 'Tracks definitifs, prix et criteres de jugement', 'Logos JCI et logos sponsors en bonne qualite', 'Photos, noms, roles et bios de mentors / jury', 'Images ou videos des editions precedentes', 'Liens reseaux sociaux et personne responsable des validations']
  content.forEach((text, index) => {
    const col = index < 4 ? 0 : 1; const row = index % 4; const x = col === 0 ? 0.75 : 6.82; const y = 2.45 + row * 0.78
    slide.addShape(S.roundRect, { x, y, w: 5.62, h: 0.52, rectRadius: 0.03, fill: { color: C.white }, line: { color: 'CDD6DE', width: 0.6 } })
    slide.addShape(S.ellipse, { x: x + 0.18, y: y + 0.16, w: 0.19, h: 0.19, fill: { color: C.sky }, line: { color: C.blue, width: 0.7 } })
    slide.addText(text, { x: x + 0.55, y: y + 0.18, w: 4.8, h: 0.12, fontSize: 9.5, color: C.ink, margin: 0 })
  })
  slide.addText('Regle simple : le contenu est valide avant sa mise en ligne. Cela protege la qualite et la credibilite de l evenement.', { x: 0.75, y: 6.25, w: 11.7, h: 0.22, fontSize: 12, italic: true, color: C.grey, margin: 0 })
}

// Final decision
{
  const slide = pptx.addSlide(); base(slide, true, '09 / VALIDATION')
  heading(slide, 'Les decisions a obtenir', 'a la fin de cette presentation.', true)
  const decisions = ['Valider les ecrans de la premiere version', "Choisir la direction visuelle A, B ou C", "Nommer un responsable pour chaque groupe de contenu", "Valider le parcours d'inscription et ses champs", 'Fixer la date de livraison des contenus', 'Planifier la revue de maquette']
  decisions.forEach((decision, index) => {
    const x = index < 3 ? 0.8 : 6.88; const y = 2.63 + (index % 3) * 0.94
    slide.addShape(S.ellipse, { x, y, w: 0.38, h: 0.38, fill: { color: C.gold }, line: { color: C.gold } })
    slide.addText(String(index + 1), { x, y: y + 0.12, w: 0.38, h: 0.08, fontSize: 7, bold: true, align: 'center', color: C.navy, margin: 0 })
    slide.addText(decision, { x: x + 0.6, y: y + 0.04, w: 5.3, h: 0.25, fontSize: 13, color: C.white, margin: 0 })
  })
  slide.addShape(S.rect, { x: 0.8, y: 5.95, w: 11.7, h: 0.65, fill: { color: '173B5E' }, line: { color: '315E88' } })
  slide.addText('Apres validation : maquette detaillee, revue avec le responsable, puis developpement et publication.', { x: 1.05, y: 6.18, w: 11.15, h: 0.15, fontSize: 11.5, bold: true, align: 'center', color: C.gold, margin: 0 })
}

await pptx.writeFile({ fileName: 'Hack_Tank_Proposition_Interfaces_Contenus.pptx' })