const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Mission = require('./src/models/Mission.model');
require('dotenv').config();

const seedMissions = async () => {
  const missions = [
    {
      title: "Articular sons corretamente",
      description: "Nesta missão irás aprender como pronunciar sons corretamente",
      type: "articular_sons",
      difficulty: 1,
      targetSounds: ["s", "z", "j", "f", "v"],
      words: [
        { word: "Sapo", image: "sapo.png" },
        { word: "Vassoura", image: "vassoura.png" },
        { word: "Janela", image: "janela.png" }
      ]
    },
    {
      title: "Pronunciar palavras complexas corretamente",
      description: "Nesta missão irás aprender como pronunciar palavras mais complexas de forma correta",
      type: "palavras_complexas",
      difficulty: 2,
      targetSounds: ["r", "lh", "nh"],
      words: [
        { word: "Joaninha", image: "joaninha.png" },
        { word: "Jacaré", image: "jacare.png" },
        { word: "Jipe", image: "jipe.png" }
      ]
    },
    {
      title: "Pronunciar os 'In'",
      description: "Nesta missão irás aprender como pronunciar os 'lhes' presentes nas palavras",
      type: "pronunciar_in",
      difficulty: 2,
      targetSounds: ["lh", "nh"],
      words: [
        { word: "Uva", image: "uva.png" },
        { word: "Vaca", image: "vaca.png" },
        { word: "Vela", image: "vela.png" }
      ]
    }
  ];

  await Mission.deleteMany({});
  await Mission.insertMany(missions);
  console.log('Missões populadas com sucesso!');
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await seedMissions();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();