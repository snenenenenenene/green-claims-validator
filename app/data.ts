export const Questions: any[] = [
  {
    id: 1,
    text: "Biedt uw onderneming goederen en/of diensten aan de europese markt?",
    options: [
      {
        text: "Ja, mijn onderneming biedt goederen en/of diensten aan de Europese markt",
        target: 2,
      },
      {
        text: "Nee, mijn onderneming biedt geen goederen en/of diensten aan de Europese markt",
        target: 2,
      },
    ],
  },
  {
    id: 2,
    text: "Heeft de milieuclaim betrekking op een dienst of een product?",
    options: [
      {
        text: "Mijn milieuclaim heeft betrekking op een dienst.",
        target: 3,
      },
      {
        text: "Mijn milieuclaim heeft betrekking op een product.",
        target: 4,
      },
    ],
  },
  {
    id: 3,
    text: "Heeft de milieuclaim betrekking op het volledige product of een deel/bepaalde aspecten ervan?",
    options: [
      {
        text: "Het volledige product",
        target: 3,
      },
      {
        text: "Een deel/bepaalde aspecten van het product",
        target: 4,
      },
      {
        text: "Niet gespecificeerd in claim",
        target: 0,
      },
    ],
  },
  {
    id: 4,
    text: "Heeft de milieuclaim betrekking op alle activiteiten van uw onderneming of een deel/een bepaald aspect ervan?",
    options: [
      {
        text: "Alle activiteiten van mijn onderneming",
        target: 3,
      },
      {
        text: "Een specifiek deel/aspect van de activiteiten van mijn onderneming",
        target: 4,
      },
      {
        text: "Niet gespecificeerd in claim",
        target: 4,
      },
    ],
  },
];
