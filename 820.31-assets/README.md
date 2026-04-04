# Card Template Assets

This folder contains card and scroll template images for the quiz engine's visual systems.

## Required Files

### Equipment/Loot Cards

1. **card-player.png** - Player/equipment card template
   - Golden vine frame design
   - Green gems on left, orange/amber gems on right
   - Cleaner, heroic aesthetic
   - Portrait orientation (~300x430px)

2. **card-monster.png** - Monster/boss loot card template
   - Dark demon/dragon skull frame
   - Thorny/bone frame with skulls and fire effects
   - Green ethereal glow on left, orange flames on right
   - Portrait orientation (~300x430px)

### Question & Answer Display

3. **scroll-question.png** - Question scroll template
   - Vertical ancient scroll with wooden handles top and bottom
   - Ornate golden title plate at top center
   - Vine decorations in corners
   - Parchment texture for content area
   - Portrait orientation (~600x420px)

4. **scroll-answer.png** - Answer option scroll banner
   - Horizontal scroll with rolled ends left and right
   - Golden vine decorations in corners
   - Wide banner format for answer text
   - Transparent background (PNG)
   - Landscape orientation (~500x80px)

## Layout Structure

**Quiz Display Flow:**
```
┌─────────────────────────────────┐
│     QUESTION SCROLL             │
│  ┌───────────────────────────┐  │
│  │  Category Title           │  │
│  │                           │  │
│  │  Question text goes here  │  │
│  │  with full explanation... │  │
│  │                           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ A │  First answer option        │  <- scroll-answer.png
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ B │  Second answer option       │  <- scroll-answer.png
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ C │  Third answer option        │  <- scroll-answer.png
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ D │  Fourth answer option       │  <- scroll-answer.png
└─────────────────────────────────┘
```

## Usage

```javascript
// Display question with separate answer scrolls
CardTemplates.displayQuestionWithAnswerScrolls(
  document.getElementById('quiz-container'),
  question,
  (index, isCorrect) => {
    console.log(`Selected ${index}, correct: ${isCorrect}`);
  }
);

// Or render individual components
const questionScroll = CardTemplates.renderQuestionScroll(question);
const answerScrolls = CardTemplates.renderAnswerScrolls(question.options, {
  onSelect: (index) => handleAnswer(index)
});
```

## Answer States

The answer scrolls support visual states:
- **Default**: Normal appearance, hover effect
- **Selected**: Golden glow while choosing
- **Correct**: Green glow + pulse animation
- **Incorrect**: Red glow + shake animation
- **Disabled**: Faded out (other options after answering)
