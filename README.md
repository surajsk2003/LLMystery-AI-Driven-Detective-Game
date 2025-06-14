# LLMystery: AI-Driven Detective Game

An interactive browser-based detective game enhanced with AI for dynamic storytelling and character interactions.

## Overview

LLMystery is a static web game that uses free LLM APIs to create an immersive detective experience. You play as a detective solving the mystery of a stolen ancient Buddhist manuscript from the ruins of Nalanda in India.

## Features

- **Choose Your Path Story Engine**: Navigate through a branching narrative with multiple choices
- **AI-Powered Detective Assistant**: Get hints and analysis from an AI assistant
- **Character Interactions**: Question suspects with AI-generated responses based on character personalities
- **Evidence Collection**: Gather clues and evidence throughout your investigation
- **Mini Puzzles**: Solve puzzles to unlock new areas and discover hidden clues

## Setup

1. Clone this repository
2. Add your Hugging Face API key in `js/ai.js` (optional - game works with fallback responses if no API key is provided)
3. Open `index.html` in your browser or deploy to GitHub Pages

## AI Integration

The game uses the Hugging Face Inference API with the Mistral-7B-Instruct model for:
- Generating detective hints based on collected evidence and clues
- Creating dynamic character responses during interrogations

To use your own API key:
1. Create an account on [Hugging Face](https://huggingface.co/)
2. Get your API key from your profile settings
3. Add it to the `HF_API_KEY` variable in `js/ai.js`

## Game Structure

- `index.html`: Main game interface
- `style/main.css`: Game styling
- `js/game.js`: Core game mechanics
- `js/ai.js`: AI integration with Hugging Face
- `js/puzzles.js`: Mini-game puzzles
- `data/story.json`: Branching narrative content

## Deployment

This game can be deployed on GitHub Pages or any static web hosting service.

## Credits

- Created by Suraj Kumar
- Uses [Tailwind CSS](https://tailwindcss.com/) for styling
- Uses [Font Awesome](https://fontawesome.com/) for icons
- AI integration with [Hugging Face](https://huggingface.co/)

## License

MIT License