// enemies.js

const ENEMY_TEMPLATES = {
    "grumpy_gremlin": {
        id: "grumpy_gremlin",
        name: "Grumpy Gremlin",
        emoji: "😠", // Grumpy face emoji
        hp: 20,
        attackMin: 3,
        attackMax: 5,
        goldDrop: 10,
        abilities: null, // Placeholder
        description: "A small, perpetually annoyed creature that dislikes correct answers."
    },
    "calculus_sprite": {
        id: "calculus_sprite",
        name: "Calculus Sprite",
        emoji: "🧐", // Monocle face, looks discerning
        hp: 30,
        attackMin: 4,
        attackMax: 7,
        goldDrop: 15,
        abilities: null,
        description: "A mischievous fey that delights in complex numerical patterns."
    },
    "quadratic_quail": {
        id: "quadratic_quail",
        name: "Quadratic Quail",
        emoji: "🐦",
        hp: 40,
        attackMin: 5,
        attackMax: 8,
        goldDrop: 20,
        abilities: ["peck_power"], // Example ability
        description: "A surprisingly aggressive bird that attacks in parabolas."
    },
    "polynomial_phantom": {
        id: "polynomial_phantom",
        name: "Polynomial Phantom",
        emoji: "👻",
        hp: 60,
        attackMin: 7,
        attackMax: 10,
        goldDrop: 35,
        abilities: ["phase_attack", "mana_drain"],
        description: "An ethereal being formed from unsolved equations."
    }
};
