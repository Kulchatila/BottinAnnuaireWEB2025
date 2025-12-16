const sites = [
  // ≡≡≡≡≡ RÉSEAUX NATIONAUX DE HOTSPOTS WI-FI ≡≡≡≡≡
  {n:"Shaw Go WiFi", u:"https://www.shaw.ca/mobile/shaw-go-wifi", c:"Wi-Fi Public", d:"Réseau national de hotspots pour les clients Shaw/Rogers (aéroports, cafés, centres commerciaux)."},
  {n:"Bell Wi-Fi", u:"https://www.bell.ca/Mobility/Products/Bell_Wi-Fi", c:"Wi-Fi Public", d:"Réseau de hotspots Bell à travers le Canada (Starbucks, aéroports, arénas)."},
  {n:"Rogers Hotspot", u:"https://www.rogers.com/consumer/internet/rogers-hotspot", c:"Wi-Fi Public", d:"Accès Wi-Fi public dans les zones désignées Rogers à l'échelle nationale."},
  {n:"Telus Public Wi-Fi", u:"https://www.telus.com/en/bc/internet/public-wifi", c:"Wi-Fi Public", d:"Points d'accès dans les zones TELUS, centres commerciaux et lieux publics."},
  {n:"Free Public Wi-Fi - Toronto (TPWC)", u:"https://www.toronto.ca/services-payments/street-parking-transportation/internet-access-on-toronto-transit/free-public-wi-fi/", c:"Wi-Fi Public", d:"Hotspots gratuits dans les parcs, places et bâtiments municipaux de Toronto."},
  {n:"Vancouver Public Wi-Fi", u:"https://vancouver.ca/technology-innovation/public-wi-fi.aspx", c:"Wi-Fi Public", d:"Wi-Fi gratuit dans les bibliothèques, centres communautaires et lieux publics de Vancouver."},
  {n:"Île Sans Fil (Montréal)", u:"https://www.ilesansfil.org/", c:"Wi-Fi Communautaire", d:"Réseau communautaire de hotspots Wi-Fi gratuits à Montréal."},

  // ≡≡≡≡≡ RÉSEAUX DE COWORKING & ESPACES DE TRAVAIL (Hotspots professionnels) ≡≡≡≡≡
  {n:"WeWork Canada", u:"https://www.wework.com/ca", c:"Coworking", d:"Réseau mondial d'espaces de travail partagés et de bureaux privés dans les grandes villes."},
  {n:"Regus / Spaces Canada", u:"https://www.regus.com/ca-canada", c:"Coworking", d:"Réseau étendu de bureaux flexibles, espaces de coworking et salles de réunion."},
  {n:"Workplace One", u:"https://workplaceone.com/", c:"Coworking", d:"Réseau d'espaces de travail premium à Toronto, Kitchener et London (ON)."},
  {n:"EVO Canada (Vancouver & Victoria)", u:"https://www.evospaces.com/", c:"Coworking", d:"Principaux espaces de coworking et centres d'affaires en Colombie-Britannique."},
  {n:"Le 357c (Montréal)", u:"https://357c.ca/", c:"Coworking", d:"Espace de coworking et centre d'innovation dans le Vieux-Montréal."},
  {n:"Alberta IoT Centre (Calgary & Edmonton)", u:"https://albertaiot.com/centre/", c:"Coworking/Incubateur", d:"Hub technologique avec espace de travail pour startups en IoT et tech."},
  {n:"Voltigeurs (Québec)", u:"https://voltigeurs.com/", c:"Coworking", d:"Espace de travail collaboratif dans le quartier Saint-Roch à Québec."},
  {n:"Common Grounds (Réseau canadien)", u:"https://commongrounds.ca/", c:"Coworking", d:"Plateforme d'accès à des centaines d'espaces de coworking indépendants au Canada."},

  // ≡≡≡≡≡ HOTSPOTS NUMÉRIQUES & HUBS TECH ≡≡≡≡≡
  {n:"MaRS Discovery District (Toronto)", u:"https://www.marsdd.com/", c:"Hub Innovation", d:"L'un des plus grands hubs d'innovation urbain au monde, avec espace et événements."},
  {n:"District 3 (Montréal)", u:"https://www.district3.co/", c:"Hub Innovation", d:"Centre d'innovation et espace de coworking pour startups à Concordia University."},
  {n:"Innovation Centre at Bayview Yards (Ottawa)", u:"https://www.bayviewyards.ca/", c:"Hub Innovation", d:"Hub d'innovation et incubateur pour startups technologiques d'Ottawa."},
  {n:"PLAN H (Halifax)", u:"https://www.planh.ca/", c:"Hub Innovation", d:"Espace de collaboration pour la communauté des startups de Halifax."},
  {n:"Veith House Community WiFi (Halifax)", u:"https://www.veithhouse.ns.ca/wifi", c:"Wi-Fi Communautaire", d:"Projet de hotspot communautaire gratuit pour les résidents défavorisés."},
];

const topThemes = [
    {
        theme: "Wi-Fi Public & Réseaux",
        count: 7,
        description: "Réseaux de hotspots Wi-Fi gratuits ou payants fournis par les FAI et municipalités dans les lieux publics (cafés, parcs, transports, bibliothèques)."
    },
    {
        theme: "Coworking & Espaces de travail",
        count: 8,
        description: "Réseaux d'espaces de travail partagés, bureaux flexibles et centres d'affaires pour professionnels, freelances et startups."
    },
    {
        theme: "Hubs d'Innovation & Communautaires",
        count: 5,
        description: "Centres d'innovation, incubateurs, accélérateurs et espaces communautaires servant de hotspots pour l'entrepreneuriat et la collaboration."
    },
];