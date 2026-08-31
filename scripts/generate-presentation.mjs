import pptxgen from 'pptxgenjs'

const pptx = new pptxgen()
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'JCI Sousse'
pptx.company = 'JCI Sousse'
pptx.subject = 'Cadrage du site Hack Tank'
pptx.title = 'Hack Tank - Cadrage produit, UX et communication'
pptx.lang = 'fr-FR'
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'fr-FR',
}
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 })

const C = { navy: '0C2340', ink: '10233B', blue: '0057B8', lightBlue: 'DCEAF8', gold: 'F4B400', cream: 'F5F2EA', white: 'FFFFFF', grey: '61738A', pale: 'E9EEF3', green: '48A47C' }
const S = pptx.ShapeType

function base(slide, dark = false, section = '') {
  slide.background = { color: dark ? C.navy : C.cream }
  slide.addShape(S.rect, { x: 0, y: 0, w: 13.333, h: 0.09, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText('HACK TANK', { x: 0.62, y: 0.34, w: 2, h: 0.25, fontFace: 'Aptos', fontSize: 9, bold: true, charSpacing: 1.5, color: dark ? C.white : C.ink, margin: 0 })
  slide.addText('JCI SOUSSE', { x: 10.9, y: 0.34, w: 1.8, h: 0.25, fontFace: 'Aptos', fontSize: 8, bold: true, charSpacing: 1.2, align: 'right', color: dark ? 'B8C8D9' : C.grey, margin: 0 })
  if (section) slide.addText(section, { x: 0.62, y: 7.0, w: 4, h: 0.2, fontSize: 7.5, charSpacing: 1.2, color: dark ? '91A7BD' : C.grey, margin: 0 })
}

function title(slide, heading, accent, dark = false) {
  slide.addText(heading, { x: 0.62, y: 1.0, w: 8.8, h: 0.62, fontFace: 'Aptos Display', fontSize: 31, bold: true, color: dark ? C.white : C.ink, breakLine: false, margin: 0 })
  if (accent) slide.addText(accent, { x: 0.62, y: 1.63, w: 8.8, h: 0.35, fontFace: 'Aptos Display', fontSize: 16, bold: true, color: C.gold, margin: 0 })
}

function pill(slide, text, x, y, color = C.blue, fill = C.lightBlue) {
  slide.addShape(S.roundRect, { x, y, w: 1.72, h: 0.36, rectRadius: 0.05, fill: { color: fill }, line: { color: fill } })
  slide.addText(text, { x, y: y + 0.09, w: 1.72, h: 0.13, align: 'center', fontSize: 7.4, bold: true, charSpacing: 0.7, color, margin: 0 })
}

function bullet(slide, text, x, y, width, dark = false) {
  slide.addShape(S.ellipse, { x, y: y + 0.09, w: 0.1, h: 0.1, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText(text, { x: x + 0.22, y, w: width - 0.22, h: 0.35, fontSize: 13, color: dark ? 'D6E0E9' : C.ink, breakLine: false, margin: 0 })
}

// 1. Cover
{
  const slide = pptx.addSlide()
  base(slide, true)
  slide.addShape(S.arc, { x: 8.3, y: 1.1, w: 4.8, h: 4.8, adjustPoint: 0.2, line: { color: '2A5B8C', transparency: 25, width: 1.2 }, fill: { color: C.navy, transparency: 100 } })
  slide.addShape(S.ellipse, { x: 9.22, y: 2.0, w: 3.0, h: 3.0, fill: { color: C.blue, transparency: 33 }, line: { color: '5796DE', transparency: 40, width: 1 } })
  slide.addShape(S.ellipse, { x: 10.28, y: 1.55, w: 0.26, h: 0.26, fill: { color: C.gold }, line: { color: C.gold } })
  slide.addText('Cadrage produit,\nUX et communication', { x: 0.72, y: 1.55, w: 7.0, h: 1.05, fontFace: 'Aptos Display', fontSize: 36, bold: true, color: C.white, margin: 0, breakLine: false })
  slide.addText('Construire une experience qui transforme la curiosite en candidatures.', { x: 0.76, y: 3.05, w: 5.6, h: 0.45, fontSize: 16, color: 'B7C6D6', margin: 0 })
  pill(slide, 'REUNION DE DECISION', 0.76, 4.0, C.navy, C.gold)
  slide.addText('HACK TANK  /  JCI SOUSSE', { x: 0.76, y: 6.4, w: 4.4, h: 0.2, fontSize: 10, bold: true, charSpacing: 1.5, color: C.gold, margin: 0 })
}

// 2. What we are deciding
{
  const slide = pptx.addSlide(); base(slide, false, '01 / POURQUOI CE CADRAGE')
  title(slide, 'Avant le developpement,', 'choisir ce que nous voulons provoquer.')
  const cards = [
    ['PRODUIT', 'Ce que le site permet de faire.', 'Parcours, inscription, informations.'],
    ['UX & DESIGN', 'Comment les gens le ressentent.', 'Clarte, confiance, desir de participer.'],
    ['COMMUNICATION', 'Comment Hack Tank rayonne.', 'Positionnement, contenu, sponsors.'],
    ['TECHNIQUE', 'Comment le site fonctionne.', 'Donnees, emails, hebergement, securite.'],
  ]
  cards.forEach((card, index) => {
    const x = 0.7 + index * 3.13
    slide.addShape(S.rect, { x, y: 3.0, w: 2.78, h: 2.45, fill: { color: index === 1 ? C.blue : C.white }, line: { color: index === 1 ? C.blue : 'D4DBE2', width: 0.7 } })
    slide.addText(`0${index + 1}`, { x: x + 0.2, y: 3.22, w: 0.3, h: 0.2, fontSize: 9, bold: true, color: index === 1 ? C.gold : C.blue, margin: 0 })
    slide.addText(card[0], { x: x + 0.2, y: 3.65, w: 2.3, h: 0.25, fontSize: 10, bold: true, charSpacing: 1.2, color: index === 1 ? C.white : C.ink, margin: 0 })
    slide.addText(card[1], { x: x + 0.2, y: 4.16, w: 2.32, h: 0.46, fontSize: 15, bold: true, color: index === 1 ? C.white : C.ink, margin: 0 })
    slide.addText(card[2], { x: x + 0.2, y: 4.82, w: 2.32, h: 0.38, fontSize: 9.5, color: index === 1 ? 'D6E5F6' : C.grey, margin: 0 })
  })
}

// 3. User journey
{
  const slide = pptx.addSlide(); base(slide, true, '02 / LE PARCOURS PRINCIPAL')
  title(slide, 'Un site qui mene', 'de la decouverte a la candidature.', true)
  const items = [['01', 'DECOUVRIR', 'La promesse, la date, le lieu.'], ['02', 'COMPRENDRE', 'Tracks, prix, programme, mentors.'], ['03', 'SE RASSURER', 'FAQ, partenaires, criteres.'], ['04', "S'INSCRIRE", 'Profil, competences, equipe, idee.'], ['05', 'SE PREPARER', 'Confirmation et prochaines etapes.']]
  items.forEach((item, index) => {
    const x = 0.72 + index * 2.5
    if (index < 4) slide.addShape(S.line, { x: x + 1.12, y: 4.1, w: 1.33, h: 0, line: { color: '50789F', width: 1.1, beginArrowType: 'none', endArrowType: 'triangle' } })
    slide.addShape(S.ellipse, { x, y: 3.44, w: 1.25, h: 1.25, fill: { color: index === 3 ? C.gold : '183B60' }, line: { color: index === 3 ? C.gold : '2E5F8E' } })
    slide.addText(item[0], { x, y: 3.83, w: 1.25, h: 0.2, align: 'center', fontSize: 13, bold: true, color: index === 3 ? C.navy : C.white, margin: 0 })
    slide.addText(item[1], { x: x - 0.2, y: 5.0, w: 1.66, h: 0.2, align: 'center', fontSize: 9, bold: true, charSpacing: 0.8, color: C.gold, margin: 0 })
    slide.addText(item[2], { x: x - 0.26, y: 5.38, w: 1.8, h: 0.45, align: 'center', fontSize: 9.5, color: 'B6C8D9', margin: 0 })
  })
}

// 4. Registration
{
  const slide = pptx.addSlide(); base(slide, false, '03 / PRIORITE PRODUIT')
  title(slide, "L'inscription est le", 'coeur du site.')
  slide.addText("Elle transforme un visiteur interesse en candidat identifiable. Elle doit etre courte, rassurante et parfaite sur mobile.", { x: 0.65, y: 2.3, w: 6.1, h: 0.62, fontSize: 17, color: C.grey, margin: 0 })
  const steps = [['01', 'Participant', 'Contact et eligibilite'], ['02', 'Profil', 'Experience et contexte'], ['03', 'Competences', 'Pour former les equipes'], ['04', 'Equipe & idee', 'Optionnelle mais utile'], ['05', 'Validation', 'Reglement et confirmation']]
  steps.forEach((item, index) => {
    const y = 3.25 + index * 0.63
    slide.addShape(S.rect, { x: 7.3, y, w: 5.25, h: 0.48, fill: { color: index === 0 ? C.blue : C.white }, line: { color: index === 0 ? C.blue : 'D1D9E1', width: 0.6 } })
    slide.addText(item[0], { x: 7.52, y: y + 0.14, w: 0.35, h: 0.13, fontSize: 8, bold: true, color: index === 0 ? C.gold : C.blue, margin: 0 })
    slide.addText(item[1], { x: 8.1, y: y + 0.1, w: 1.25, h: 0.16, fontSize: 10.5, bold: true, color: index === 0 ? C.white : C.ink, margin: 0 })
    slide.addText(item[2], { x: 9.75, y: y + 0.12, w: 2.35, h: 0.14, fontSize: 9, color: index === 0 ? 'D9E9FC' : C.grey, margin: 0 })
  })
  bullet(slide, 'Accepter les candidatures individuelles et les equipes deja formees.', 0.7, 4.0, 5.9)
  bullet(slide, "Ne pas obliger une personne a avoir deja une idee pour s'inscrire.", 0.7, 4.65, 5.9)
  bullet(slide, 'Envoyer une confirmation email et expliquer la suite.', 0.7, 5.3, 5.9)
}

// 5. Scope
{
  const slide = pptx.addSlide(); base(slide, false, '04 / PERIMETRE A VALIDER')
  title(slide, 'Ce que le site doit', 'faire des la premiere version.')
  const columns = [
    ['INDISPENSABLE', C.blue, ['Accueil et promesse', 'Inscription multi-etapes', 'Programme / timeline', 'Tracks et prix', 'FAQ et contact']],
    ['IMPORTANT', C.green, ['Mentors et jury', 'Sponsors', "Criteres d'evaluation", 'Email de confirmation']],
    ['OPTIONNEL', C.gold, ['Mise en relation', "Mur d'idees", 'Espace participant', 'Compte a rebours live']],
  ]
  columns.forEach((column, index) => {
    const x = 0.7 + index * 4.2
    slide.addShape(S.rect, { x, y: 2.65, w: 3.72, h: 3.6, fill: { color: C.white }, line: { color: 'D0D8E0', width: 0.6 } })
    slide.addShape(S.rect, { x, y: 2.65, w: 3.72, h: 0.13, fill: { color: column[1] }, line: { color: column[1] } })
    slide.addText(column[0], { x: x + 0.22, y: 3.12, w: 3.1, h: 0.2, fontSize: 10, bold: true, charSpacing: 1.2, color: column[1], margin: 0 })
    column[2].forEach((text, itemIndex) => bullet(slide, text, x + 0.22, 3.65 + itemIndex * 0.49, 3.2))
  })
}

// 6. Styles
{
  const slide = pptx.addSlide(); base(slide, true, '05 / DIRECTION ARTISTIQUE')
  title(slide, 'Cinq styles populaires', 'a choisir selon la promesse de Hack Tank.', true)
  const styles = [
    ['STARTUP PREMIUM', 'Ambitieux, net, international.', 'Stripe / Linear / Vercel', C.blue],
    ['TECH FUTURISTE', 'Energie, IA, experimentation.', 'GitHub Universe', '4387C9'],
    ['CONFERENCE EDITORIALE', 'Speakers et programme au premier plan.', 'Web Summit', C.green],
    ['JEUNE & ENERGIQUE', 'Humain, accessible, communautaire.', 'Evenements universitaires', 'E66848'],
    ['INSTITUTIONNEL MODERNE', 'Confiance, clarte, legitimite.', 'Organisations internationales', C.gold],
  ]
  styles.forEach((style, index) => {
    const x = 0.72 + (index % 3) * 4.15; const y = index < 3 ? 2.85 : 5.05
    slide.addShape(S.rect, { x, y, w: 3.75, h: 1.58, fill: { color: '102D4C' }, line: { color: '315D89', width: 0.6 } })
    slide.addShape(S.rect, { x, y, w: 0.1, h: 1.58, fill: { color: style[3] }, line: { color: style[3] } })
    slide.addText(style[0], { x: x + 0.25, y: y + 0.22, w: 3.2, h: 0.2, fontSize: 9, bold: true, charSpacing: 0.7, color: style[3], margin: 0 })
    slide.addText(style[1], { x: x + 0.25, y: y + 0.58, w: 3.15, h: 0.25, fontSize: 13, bold: true, color: C.white, margin: 0 })
    slide.addText(style[2], { x: x + 0.25, y: y + 1.08, w: 3.15, h: 0.16, fontSize: 8.5, color: 'B7C8D9', margin: 0 })
  })
}

// 7. Recommendation
{
  const slide = pptx.addSlide(); base(slide, false, '06 / RECOMMANDATION')
  title(slide, 'La direction recommandee', 'pour Hack Tank.')
  slide.addShape(S.rect, { x: 0.68, y: 2.62, w: 12.0, h: 2.15, fill: { color: C.navy }, line: { color: C.navy } })
  slide.addText('STARTUP PREMIUM  +  TECH FUTURISTE  +  IDENTITE JCI', { x: 1.03, y: 3.05, w: 11.3, h: 0.42, align: 'center', fontSize: 20, bold: true, charSpacing: 0.4, color: C.white, margin: 0 })
  slide.addText('Une experience ambitieuse et energique, sans perdre la confiance institutionnelle.', { x: 1.1, y: 3.72, w: 11.1, h: 0.25, align: 'center', fontSize: 12, color: 'BDD0E3', margin: 0 })
  const reasons = [['BLEU JCI', 'Cohesion avec la marque et confiance.'], ['OR', "Accent pour l'inscription, les prix et l'urgence."], ['ANIMATION', "Energie technologique sans surcharger l'information."], ['VRAIES PHOTOS', 'Mentors et editions precedentes des que possible.']]
  reasons.forEach((reason, index) => {
    const x = 0.75 + index * 3.05
    slide.addText(reason[0], { x, y: 5.35, w: 2.6, h: 0.18, fontSize: 9, bold: true, charSpacing: 0.8, color: C.blue, margin: 0 })
    slide.addText(reason[1], { x, y: 5.72, w: 2.58, h: 0.45, fontSize: 10.5, color: C.grey, margin: 0 })
  })
}

// 8. Decisions meeting
{
  const slide = pptx.addSlide(); base(slide, true, '07 / DECISIONS ATTENDUES')
  title(slide, 'Ce que nous devons', 'valider ensemble aujourd’hui.', true)
  const decisions = ['Objectif principal de Hack Tank', 'Public cible et langues du site', "Inscription individuelle, equipe, ou les deux", "Idee obligatoire ou non a l'inscription", 'Tracks, prix et calendrier', 'Direction artistique choisie', 'Responsables de validation contenus / logos / reglement', "Destination des donnees d'inscription"]
  decisions.forEach((decision, index) => {
    const col = index < 4 ? 0 : 1; const row = index % 4
    const x = col === 0 ? 0.75 : 6.95; const y = 2.75 + row * 0.82
    slide.addShape(S.ellipse, { x, y: y + 0.02, w: 0.35, h: 0.35, fill: { color: index < 2 ? C.gold : '1A4168' }, line: { color: index < 2 ? C.gold : '3C668F' } })
    slide.addText(String(index + 1), { x, y: y + 0.11, w: 0.35, h: 0.1, fontSize: 7, bold: true, align: 'center', color: index < 2 ? C.navy : C.white, margin: 0 })
    slide.addText(decision, { x: x + 0.55, y, w: 5.25, h: 0.36, fontSize: 13, color: C.white, margin: 0 })
  })
  slide.addText('Resultat attendu : une decision claire qui permet de passer a la maquette puis au developpement.', { x: 0.75, y: 6.38, w: 11.7, h: 0.25, fontSize: 12, italic: true, color: C.gold, margin: 0 })
}

// 9. Next actions
{
  const slide = pptx.addSlide(); base(slide, false, '08 / PROCHAINES ETAPES')
  title(slide, 'De la decision', "a l'experience en ligne.")
  const actions = [['1', 'VALIDER', 'Le parcours, les contenus prioritaires et le style.'], ['2', 'PREPARER', 'Dates, reglement, prix, bios, photos et logos.'], ['3', 'MAQUETTER', 'Une proposition desktop et mobile a approuver.'], ['4', 'DEVELOPPER', "Formulaire, stockage, emails et site public."], ['5', 'LANCER', 'Tester, publier et suivre les inscriptions.']]
  actions.forEach((action, index) => {
    const x = 0.75 + index * 2.46
    if (index < 4) slide.addShape(S.line, { x: x + 1.73, y: 4.1, w: 0.7, h: 0, line: { color: 'B5C0CC', width: 1, endArrowType: 'triangle' } })
    slide.addText(action[0], { x, y: 3.0, w: 0.4, h: 0.3, fontSize: 26, bold: true, color: C.gold, margin: 0 })
    slide.addText(action[1], { x, y: 3.67, w: 2.1, h: 0.2, fontSize: 10, bold: true, charSpacing: 1, color: C.blue, margin: 0 })
    slide.addText(action[2], { x, y: 4.12, w: 2.0, h: 0.65, fontSize: 10, color: C.grey, margin: 0 })
  })
  slide.addShape(S.rect, { x: 0.75, y: 5.92, w: 11.9, h: 0.7, fill: { color: C.lightBlue }, line: { color: C.lightBlue } })
  slide.addText('Proposition : commencer par le cadrage produit, UX et communication avant de finaliser les choix techniques.', { x: 1.05, y: 6.16, w: 11.3, h: 0.2, align: 'center', fontSize: 12, bold: true, color: C.navy, margin: 0 })
}

await pptx.writeFile({ fileName: 'Hack_Tank_Cadrage_JCI_Sousse.pptx' })