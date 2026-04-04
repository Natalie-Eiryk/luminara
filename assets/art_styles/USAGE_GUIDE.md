# Art Style Exemplars - Usage Guide

**Version**: 2026-04-04
**Session**: 67
**Codon**: 820.31.85
**Isotopes**: `usage.guide`, `integration.instructions`, `developer.documentation`, `quiz.engine`, `quality.studio`, `style.transfer`

---

## Quick Start

**For Developers**: This guide shows how to integrate art style exemplars into Quality Studio, Ms. Luminara Quiz Engine, and style transfer pipelines.

**Current Status**: All exemplars are MOCK PLACEHOLDERS. Framework is complete and ready for real images.

---

## Table of Contents

1. [Quiz Engine Integration](#quiz-engine-integration)
2. [Quality Studio Integration](#quality-studio-integration)
3. [Style Transfer Integration](#style-transfer-integration)
4. [Python API Reference](#python-api-reference)
5. [Common Use Cases](#common-use-cases)
6. [Troubleshooting](#troubleshooting)

---

## Quiz Engine Integration

### Loading Exemplar in Quiz Questions

**Path Convention**:
```
assets/art_styles/{style_number}_{style_name}/exemplar.png
```

**JSON Question Format**:
```json
{
  "question_id": "art_styles_001",
  "type": "style_identification",
  "question": "Which art style is demonstrated in this image?",
  "image_path": "assets/art_styles/01_photorealistic/exemplar.png",
  "correct_answer": "Photorealistic",
  "distractors": ["Impressionism", "Art Nouveau", "Pixel Art", "Ukiyo-e"],
  "explanation": "This image demonstrates photorealism through ultra-detailed fur texture, accurate depth of field, and natural lighting that simulates professional wildlife photography.",
  "metadata": {
    "style_period": "1970s-present",
    "key_artists": ["Chuck Close", "Richard Estes"],
    "teaching_concepts": ["depth of field", "texture rendering"]
  }
}
```

### Quiz Question Templates

**Type 1: Style Identification**
```javascript
function createStyleIdentificationQuestion(styleNumber) {
  const styles = [
    {name: "Photorealistic", path: "01_photorealistic"},
    {name: "Impressionism", path: "02_impressionism"},
    {name: "Art Nouveau", path: "03_art_nouveau"},
    {name: "Pixel Art", path: "04_pixel_art"},
    {name: "Ukiyo-e", path: "05_ukiyo_e"}
  ];

  const correct = styles[styleNumber];
  const distractors = styles.filter((_, i) => i !== styleNumber).map(s => s.name);

  return {
    question: "Which art style is demonstrated in this image?",
    image_path: `assets/art_styles/${correct.path}/exemplar.png`,
    correct_answer: correct.name,
    distractors: distractors
  };
}
```

**Type 2: Historical Context**
```javascript
{
  "question": "This artwork demonstrates which historical art movement from the 1870s-1890s?",
  "image_path": "assets/art_styles/02_impressionism/exemplar.png",
  "correct_answer": "Impressionism",
  "distractors": ["Art Nouveau", "Art Deco", "Surrealism", "Cubism"],
  "explanation": "Impressionism flourished in France from 1870s-1890s, emphasizing broken color theory and capturing fleeting moments of light."
}
```

**Type 3: Technical Characteristics**
```javascript
{
  "question": "Which technique is characteristic of this art style?",
  "image_path": "assets/art_styles/04_pixel_art/exemplar.png",
  "correct_answer": "Dithering (checkerboard color alternation)",
  "distractors": ["Glazing", "Impasto", "Sfumato", "Chiaroscuro"],
  "explanation": "16-bit pixel art uses dithering - alternating two colors in a checkerboard pattern - to simulate gradients with limited palettes."
}
```

### Integration Code Example

```python
# Load exemplar metadata
import json
from PIL import Image

def load_style_exemplar(style_name):
    """Load exemplar image and metadata for quiz question"""
    base_path = "assets/art_styles"
    style_dirs = {
        "photorealistic": "01_photorealistic",
        "impressionism": "02_impressionism",
        "art_nouveau": "03_art_nouveau",
        "pixel_art": "04_pixel_art",
        "ukiyo_e": "05_ukiyo_e"
    }

    style_dir = style_dirs[style_name]
    image_path = f"{base_path}/{style_dir}/exemplar.png"
    metadata_path = f"{base_path}/{style_dir}/metadata.json"

    # Load image
    image = Image.open(image_path)

    # Load metadata
    with open(metadata_path) as f:
        metadata = json.load(f)

    return {
        "image": image,
        "metadata": metadata,
        "path": image_path
    }

# Example usage in quiz engine
exemplar = load_style_exemplar("impressionism")
question = create_quiz_question(
    exemplar["image"],
    exemplar["metadata"]["key_artists"],
    exemplar["metadata"]["period"]
)
```

---

## Quality Studio Integration

### Multi-Stakeholder Assessment

**Using Exemplars for Calibration**:

```python
from cognition.visual_sequence.quality_integration import QualityAssessmentPipeline

# Initialize pipeline
pipeline = QualityAssessmentPipeline()

# Load exemplar
exemplar_path = "assets/art_styles/01_photorealistic/exemplar.png"

# Assess quality (returns MultiStakeholderEvaluation)
evaluation = pipeline.evaluate_image(exemplar_path)

# Check scores against style-specific targets
print(f"Teachers: {evaluation.teachers.score:.2f} / 0.85")
print(f"NVIDIA: {evaluation.nvidia.score:.2f} / 0.90")
print(f"Renaissance: {evaluation.renaissance.score:.2f} / 0.85")
print(f"Consensus: {evaluation.consensus_score:.2f}")

# Decision
if pipeline.should_ship():
    print("APPROVED - All panels reached consensus")
else:
    print("REFINEMENT NEEDED")
```

### Style-Specific Thresholds

**Important**: Different styles have different expectations:

```python
STYLE_THRESHOLDS = {
    "photorealistic": {
        "teachers": 0.85,
        "nvidia": 0.90,  # High technical quality expected
        "renaissance": 0.85
    },
    "impressionism": {
        "teachers": 0.90,
        "nvidia": 0.82,  # Intentional softness - lower OK
        "renaissance": 0.88
    },
    "art_nouveau": {
        "teachers": 0.92,
        "nvidia": 0.86,
        "renaissance": 0.90
    },
    "pixel_art": {
        "teachers": 0.85,
        "nvidia": 0.88,
        "renaissance": 0.80  # Constraints limit artistic expression
    },
    "ukiyo_e": {
        "teachers": 0.94,
        "nvidia": 0.84,  # Flat color is culturally authentic
        "renaissance": 0.92
    }
}

def check_style_approval(style_name, scores):
    """Check if scores meet style-specific thresholds"""
    thresholds = STYLE_THRESHOLDS[style_name]
    return {
        "teachers": scores["teachers"] >= thresholds["teachers"],
        "nvidia": scores["nvidia"] >= thresholds["nvidia"],
        "renaissance": scores["renaissance"] >= thresholds["renaissance"],
        "all_approved": all([
            scores["teachers"] >= thresholds["teachers"],
            scores["nvidia"] >= thresholds["nvidia"],
            scores["renaissance"] >= thresholds["renaissance"]
        ])
    }
```

### Testing Refinement Loop

**Use exemplars to test iterative refinement**:

```python
from cognition.visual_sequence.comfyui_quality_bridge import QualityRefinementPipeline

pipeline = QualityRefinementPipeline()

# Test refinement with photorealistic style
result = pipeline.generate_until_approved(
    workflow_path="workflows/teaching_diagram.json",
    prompt=open("assets/art_styles/01_photorealistic/prompt.txt").read(),
    max_iterations=50
)

print(f"Iterations: {result.iterations}")
print(f"Final Consensus: {result.final_consensus:.3f}")
print(f"Status: {result.termination_reason}")
```

---

## Style Transfer Integration

### ControlNet Reference

**Use exemplar as style guide for new generation**:

```python
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
from PIL import Image

# Load exemplar as reference
reference_image = Image.open("assets/art_styles/05_ukiyo_e/exemplar.png")

# Initialize pipeline
controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-canny")
pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    controlnet=controlnet
)

# Generate new image in ukiyo-e style
prompt = "red panda eating bamboo, Japanese woodblock print style"
output = pipe(
    prompt,
    image=reference_image,
    num_inference_steps=30,
    controlnet_conditioning_scale=0.8
).images[0]

output.save("generated_ukiyo_e_panda.png")
```

### LoRA Training

**Train style-specific LoRA using exemplar collection**:

```python
# Prepare training data
import glob

def prepare_lora_training_data(style_name, variations=20):
    """
    Generate multiple variations of exemplar for LoRA training

    Args:
        style_name: One of [photorealistic, impressionism, art_nouveau, pixel_art, ukiyo_e]
        variations: Number of subject variations to generate
    """
    base_prompt = open(f"assets/art_styles/*_{style_name}/prompt.txt").read()

    # Replace subject while keeping style characteristics
    subjects = [
        "red fox", "blue jay", "gray wolf", "barn owl", "white rabbit",
        "orange tabby cat", "golden retriever", "red panda", "monarch butterfly",
        "praying mantis", "tree frog", "sea turtle", "koi fish", "peacock"
    ]

    training_prompts = []
    for subject in subjects[:variations]:
        # Replace "red fox" with new subject
        variant_prompt = base_prompt.replace("red fox", subject)
        training_prompts.append({
            "prompt": variant_prompt,
            "style_tag": style_name,
            "subject": subject
        })

    return training_prompts

# Example: Train impressionism LoRA
training_data = prepare_lora_training_data("impressionism", variations=30)
# ... feed to LoRA training pipeline
```

### Style Interpolation

**Blend multiple exemplar styles**:

```python
from PIL import Image
import numpy as np

def interpolate_styles(style_a, style_b, alpha=0.5):
    """
    Interpolate between two art style exemplars

    Args:
        style_a: Path to first exemplar
        style_b: Path to second exemplar
        alpha: Blend factor (0=pure A, 1=pure B)
    """
    img_a = np.array(Image.open(style_a))
    img_b = np.array(Image.open(style_b))

    # Weighted blend
    blended = (1 - alpha) * img_a + alpha * img_b
    blended = Image.fromarray(blended.astype(np.uint8))

    return blended

# Example: 50/50 blend of impressionism and ukiyo-e
blended = interpolate_styles(
    "assets/art_styles/02_impressionism/exemplar.png",
    "assets/art_styles/05_ukiyo_e/exemplar.png",
    alpha=0.5
)
blended.save("blended_impressionism_ukiyo_e.png")
```

---

## Python API Reference

### ExemplarCollection Class

```python
class ExemplarCollection:
    """Central API for loading and working with art style exemplars"""

    def __init__(self, base_path="assets/art_styles"):
        self.base_path = base_path
        self.styles = [
            "photorealistic", "impressionism", "art_nouveau",
            "pixel_art", "ukiyo_e"
        ]

    def load(self, style_name):
        """Load exemplar image and metadata"""
        ...

    def get_all_styles(self):
        """Return list of all available styles"""
        return self.styles

    def compare_styles(self, style_a, style_b):
        """Visual comparison of two styles"""
        ...

    def validate(self, style_name):
        """Run validation checklist for style"""
        ...

    def get_quiz_questions(self, style_name, question_types=None):
        """Generate quiz questions for style"""
        ...
```

### Usage Example

```python
from art_styles import ExemplarCollection

# Initialize
collection = ExemplarCollection()

# Load single style
impressionism = collection.load("impressionism")
print(f"Period: {impressionism['metadata']['period']}")
print(f"Key Artists: {', '.join(impressionism['metadata']['key_artists'])}")

# Generate quiz questions
questions = collection.get_quiz_questions(
    "impressionism",
    question_types=["style_identification", "historical_context"]
)

# Validate exemplar
validation_report = collection.validate("photorealistic")
print(f"Visual Elements: {validation_report['tier3_score']}/8")
```

---

## Common Use Cases

### Use Case 1: Quiz Question Generation

```python
def generate_art_history_quiz(num_questions=10):
    """Generate randomized art history quiz"""
    collection = ExemplarCollection()
    questions = []

    for i in range(num_questions):
        # Random style
        style = random.choice(collection.get_all_styles())
        exemplar = collection.load(style)

        # Random question type
        q_type = random.choice([
            "style_identification",
            "historical_context",
            "technical_characteristics",
            "artist_association"
        ])

        question = collection.create_question(style, q_type)
        questions.append(question)

    return questions
```

### Use Case 2: Style Consistency Validation

```python
def validate_generated_image(image_path, target_style):
    """Check if generated image matches target style"""
    pipeline = QualityAssessmentPipeline()

    # Load target exemplar
    exemplar = ExemplarCollection().load(target_style)

    # Evaluate new image
    eval_new = pipeline.evaluate_image(image_path)

    # Compare to exemplar targets
    targets = exemplar["metadata"]["quality_scores"]

    return {
        "matches_targets": all([
            eval_new.teachers.score >= targets["teachers"]["threshold"],
            eval_new.nvidia.score >= targets["nvidia"]["threshold"],
            eval_new.renaissance.score >= targets["renaissance"]["threshold"]
        ]),
        "scores": {
            "teachers": eval_new.teachers.score,
            "nvidia": eval_new.nvidia.score,
            "renaissance": eval_new.renaissance.score
        },
        "delta": {
            "teachers": eval_new.teachers.score - targets["teachers"]["score"],
            "nvidia": eval_new.nvidia.score - targets["nvidia"]["score"],
            "renaissance": eval_new.renaissance.score - targets["renaissance"]["score"]
        }
    }
```

### Use Case 3: Teaching Material Generation

```python
def generate_teaching_comparison():
    """Create side-by-side style comparison for educational materials"""
    from PIL import Image, ImageDraw, ImageFont

    collection = ExemplarCollection()
    styles = collection.get_all_styles()

    # Load all exemplars
    images = []
    for style in styles:
        exemplar = collection.load(style)
        img = exemplar["image"].resize((400, 400))

        # Add label
        draw = ImageDraw.Draw(img)
        font = ImageFont.truetype("arial.ttf", 24)
        draw.text((10, 10), style.upper(), fill=(255, 255, 255), font=font)

        images.append(img)

    # Create grid (2x3)
    grid = Image.new('RGB', (1200, 800))
    for i, img in enumerate(images):
        x = (i % 3) * 400
        y = (i // 3) * 400
        grid.paste(img, (x, y))

    grid.save("art_styles_comparison.png")
    return grid
```

---

## Troubleshooting

### Issue: Mock Placeholder Displayed

**Problem**: Exemplar shows colored rectangle with text label instead of artwork.

**Cause**: Real AI-generated images not yet created (ComfyUI workflow blocker).

**Solution**:
1. Check `GENERATION_REPORT.md` for blocker status
2. Wait for workflow format fix (planned next session)
3. Mock framework is complete - will work with real images when generated

### Issue: Quality Scores Too Low

**Problem**: Multi-stakeholder assessment rejects exemplar.

**Cause**: Style-specific thresholds may not account for intentional characteristics.

**Solution**:
```python
# Check if low score is expected for style
if style == "impressionism" and nvidia_score < 0.85:
    print("ACCEPTABLE - Impressionism intentionally soft focus")
elif style == "ukiyo_e" and nvidia_score < 0.86:
    print("ACCEPTABLE - Ukiyo-e flat color planes culturally authentic")
else:
    print("REFINEMENT NEEDED")
```

### Issue: Quiz Questions Not Loading Images

**Problem**: Image path broken in quiz JSON.

**Cause**: Relative vs. absolute path mismatch.

**Solution**:
```python
# Use path relative to quiz engine root
correct_path = "assets/art_styles/01_photorealistic/exemplar.png"

# NOT absolute path
wrong_path = "G:/Lumi-OS/Library/.../exemplar.png"
```

### Issue: Style Transfer Not Working

**Problem**: ControlNet generates wrong style.

**Cause**: ControlNet requires edge detection, not direct image reference.

**Solution**:
```python
from controlnet_aux import CannyDetector

# Extract edges from exemplar first
canny = CannyDetector()
edges = canny(exemplar_image)

# Use edges as control
output = pipe(prompt, image=edges, ...)
```

---

## Next Steps

1. **Wait for real images** - ComfyUI workflow fix (next session)
2. **Test all integrations** - Run quiz engine, quality studio, style transfer with real exemplars
3. **Expand collection** - Add 5 more styles (watercolor, oil painting, art deco, cyberpunk, Studio Ghibli)
4. **Build automation** - Create scripts for batch processing and validation

---

## Related Documentation

- [Master Index](_index.md) - Collection overview
- [QUALITY_VALIDATION.md](QUALITY_VALIDATION.md) - Validation framework
- [INTEGRATION_POINTS.md](INTEGRATION_POINTS.md) - System connections
- [EXEMPLAR_ART_STYLES.md](../../../../../../cognition/visual_sequence/quality_studio/EXEMPLAR_ART_STYLES.md) - Complete style guide

---

**Isotope Tags**: `usage.guide`, `integration.instructions`, `quiz.engine`, `quality.studio`, `style.transfer`, `developer.api`, `python.examples`, `teaching.materials`

---

*Usage Guide maintained by Agent 3 - Quality Assurance & Organization*
*Session 67, 2026-04-04*
