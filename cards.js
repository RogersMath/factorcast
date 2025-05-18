// cards.js

const SPELL_TEMPLATES = {
    "gcf_spark": {
        id: "gcf_spark",
        name: "GCF Spark",
        emoji: "✨", // Spark emoji
        mpCost: 3,
        baseDamageMin: 2,
        baseDamageMax: 4,
        factoringTypeKey: 1, // Corresponds to FACTORING_SKILLS key in main.js
        target: "enemy",
        description: "A simple spark fueled by common factors."
    },
    "minor_heal": {
        id: "minor_heal",
        name: "Minor Heal",
        emoji: "💖", // Healing heart emoji
        mpCost: 5,
        healAmount: 10,
        factoringTypeKey: 0, // 0 means no factoring problem
        target: "self",
        description: "A faint glow that mends minor wounds."
    },
    "square_split": {
        id: "square_split",
        name: "Square Split",
        emoji: "↔️", // Left-right arrow, symbolizing splitting squares
        mpCost: 5,
        baseDamageMin: 4,
        baseDamageMax: 7,
        factoringTypeKey: 2,
        target: "enemy",
        description: "Exploits the symmetry of squared differences."
    },
    "trinomial_tap": {
        id: "trinomial_tap",
        name: "Trinomial Tap",
        emoji: "🌀", // Cyclone/spiral for unraveling
        mpCost: 7,
        baseDamageMin: 6,
        baseDamageMax: 10,
        factoringTypeKey: 3,
        target: "enemy",
        description: "Unravels a trinomial to release a burst of energy."
    },
    // Add more spell templates here as we implement their factoring types
    "pst_shield": {
        id: "pst_shield",
        name: "PST Shield",
        emoji: "🛡️",
        mpCost: 6,
        defenseBoost: 5, // Example effect: temporary defense
        duration: 3, // turns
        factoringTypeKey: 4,
        target: "self",
        description: "Forms a protective barrier from a Perfect Square."
    },
    "grouping_gale": {
        id: "grouping_gale",
        name: "Grouping Gale",
        emoji: "💨",
        mpCost: 8,
        baseDamageMin: 7,
        baseDamageMax: 12,
        factoringTypeKey: 5, // Trinomial a>1 / Grouping
        target: "enemy",
        description: "A gust of wind from expertly grouped terms."
    },
    "cube_crush": {
        id: "cube_crush",
        name: "Cube Crush",
        emoji: "💥",
        mpCost: 10,
        baseDamageMin: 10,
        baseDamageMax: 15,
        factoringTypeKey: 6, // Sum of Cubes (can share with diff of cubes for type)
        target: "enemy",
        description: "Shatters defenses by deconstructing cubic forms."
    },
     "void_rend": { // Example for Difference of Cubes
        id: "void_rend",
        name: "Void Rend",
        emoji: "🌌",
        mpCost: 10,
        baseDamageMin: 10,
        baseDamageMax: 16,
        factoringTypeKey: 7, // Difference of Cubes
        target: "enemy",
        description: "Tears reality by finding the difference in cosmic cubes."
    }
};

const ITEM_TEMPLATES = {
    "healing_potion": {
        id: "healing_potion",
        name: "Healing Potion",
        emoji: "🧪", // Test tube, generic potion
        effect: (player) => {
            const healAmount = 20;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            return `You drink the Healing Potion and restore ${healAmount} HP.`;
        },
        description: "A bubbling red liquid that restores 20 HP."
    },
    "mana_potion": {
        id: "mana_potion",
        name: "Mana Potion",
        emoji: "⚗️", // Alembic, for mana
        effect: (player) => {
            const manaAmount = 15;
            player.mp = Math.min(player.maxMp, player.mp + manaAmount);
            return `You drink the Mana Potion and restore ${manaAmount} MP.`;
        },
        description: "A shimmering blue elixir that restores 15 MP."
    }
};
