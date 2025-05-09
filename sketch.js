let kirby;
let paintBombs = []; // Bombs thrown by Kirby (Spacebar)
let paintMissiles = []; // Missiles thrown by Kirby (Z key)
let mushrooms = [];
let mushroomBombs = []; // Bombs thrown by Mushrooms
let score = 0;
let gameWidth = 800; // Increased game width
let gameHeight = 600; // Increased game height
let gameOver = false;

function setup() {
  createCanvas(gameWidth, gameHeight);
  kirby = new Kirby();
  // Create initial mushrooms
  for (let i = 0; i < 8; i++) { // Add more mushrooms for bigger area
    mushrooms.push(new Mushroom(random(width), random(-300, -50))); // Adjust initial y range
  }
}

function draw() {
  background(220);

  if (gameOver) {
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 0, 0);
    text("Game Over!", width / 2, height / 2);
    textSize(24);
    fill(0);
    text("Score: " + score, width / 2, height / 2 + 40);
    textSize(18);
    fill(0);
    text("Press 'R' to Restart", width / 2, height / 2 + 80); // Added restart instruction
    return; // Stop drawing game elements
  }

  // Draw score
  fill(0);
  textSize(16);
  text('Score: ' + score, 10, 20);

  // Update and display Kirby
  kirby.update();
  kirby.display();

  // Update and display paint bombs (Kirby's bombs)
  for (let i = paintBombs.length - 1; i >= 0; i--) {
    paintBombs[i].update();
    paintBombs[i].display();

    // Remove bombs that go off screen
    if (paintBombs[i].isOffscreen()) {
      paintBombs.splice(i, 1);
    }
  }

  // Update and display paint missiles (Kirby's missiles)
  for (let i = paintMissiles.length - 1; i >= 0; i--) {
    paintMissiles[i].update();
    paintMissiles[i].display();

    // Remove missiles that go off screen
    if (paintMissiles[i].isOffscreen()) {
      paintMissiles.splice(i, 1);
    }
  }


  // Update and display mushrooms
  for (let i = mushrooms.length - 1; i >= 0; i--) {
    mushrooms[i].update();
    mushrooms[i].display();
    mushrooms[i].maybeShoot(); // Mushrooms might shoot

    // Check for collisions with Kirby's bombs
    for (let j = paintBombs.length - 1; j >= 0; j--) {
      if (mushrooms[i].hits(paintBombs[j])) {
        // Collision detected
        score += 10;
        mushrooms.splice(i, 1); // Remove mushroom
        paintBombs.splice(j, 1); // Remove bomb
        // Add a new mushroom
        mushrooms.push(new Mushroom(random(width), random(-300, -50))); // Adjust initial y range
        break; // Exit inner loop after collision
      }
    }

    // Check for collisions with Kirby's missiles
    for (let j = paintMissiles.length - 1; j >= 0; j--) {
      if (mushrooms[i] && mushrooms[i].hits(paintMissiles[j])) { // Check if mushroom still exists
        // Collision detected
        score += 20; // Missiles give more points
        mushrooms.splice(i, 1); // Remove mushroom
        paintMissiles.splice(j, 1); // Remove missile
        // Add a new mushroom
        mushrooms.push(new Mushroom(random(width), random(-300, -50))); // Adjust initial y range
        break; // Exit inner loop after collision
      }
    }


    // Remove mushrooms that go off screen
    if (mushrooms[i] && mushrooms[i].isOffscreen()) {
       mushrooms.splice(i, 1);
       // Add a new mushroom
       mushrooms.push(new Mushroom(random(width), random(-300, -50))); // Adjust initial y range
    }
  }

  // Update and display mushroom bombs
  for (let i = mushroomBombs.length - 1; i >= 0; i--) {
    mushroomBombs[i].update();
    mushroomBombs[i].display();

    // Check for collisions with Kirby
    if (kirby.hits(mushroomBombs[i])) {
      gameOver = true; // Game over if Kirby is hit
      break; // Exit loop
    }

    // Remove bombs that go off screen
    if (mushroomBombs[i].isOffscreen()) {
      mushroomBombs.splice(i, 1);
    }
  }


  // Add new mushrooms if needed
  while (mushrooms.length < 8) { // Maintain number of mushrooms for bigger area
     mushrooms.push(new Mushroom(random(width), random(-300, -50))); // Adjust initial y range
  }
}

function keyPressed() {
  if (!gameOver) {
    if (key === ' ') { // Spacebar to throw bomb
      kirby.throwBomb();
    }
    if (key === 'z') { // Z key to throw missile
      kirby.throwMissile();
    }
  }
  if (gameOver && key === 'r') { // Restart game on 'r' key press
    resetGame();
  }
}

function resetGame() {
  score = 0;
  gameOver = false;
  mushrooms = [];
  paintBombs = [];
  paintMissiles = []; // Reset missiles too
  mushroomBombs = [];
  kirby = new Kirby();
  for (let i = 0; i < 8; i++) {
    mushrooms.push(new Mushroom(random(width), random(-300, -50)));
  }
}


// Kirby Class
class Kirby {
  constructor() {
    this.x = width / 2;
    this.y = height - 80; // Adjust initial y for larger size
    this.size = 80; // Make Kirby larger
    this.speed = 7; // Slightly faster movement for bigger area
    this.baseColor = color(255, 105, 180); // Base Pink color
    this.shadowColor = color(180, 60, 120); // Darker pink for shadow
    this.gradientSteps = 24; // Number of steps for the gradient
  }

  update() {
    // Move left/right with arrow keys
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }

    // Constrain to screen bounds
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
  }

  display() {
    noStroke();

    // Body (Pink with gradient shading using concentric ellipses)
    // Draw multiple ellipses from largest to smallest to create a gradient
    for (let i = 0; i < this.gradientSteps; i++) {
      // Interpolate color from base to shadow
      let inter = map(i, 0, this.gradientSteps - 1, 0, 1);
      let c = lerpColor(this.baseColor, this.shadowColor, inter);
      fill(c);

      // Calculate ellipse size - starts at full size, decreases towards the center
      // We want the shadow to appear on the bottom-right, so we'll offset the ellipses slightly
      let ellipseSize = this.size * map(i, 0, this.gradientSteps - 1, 1, 0.5); // Size decreases

      // Offset for shading - moves the center of the ellipse slightly
      // This creates the illusion of light coming from top-left
      let offsetX = map(i, 0, this.gradientSteps - 1, 0, this.size * 0.1); // Max offset 10% of size
      let offsetY = map(i, 0, this.gradientSteps - 1, 0, this.size * 0.1); // Max offset 10% of size

      // Draw the ellipse segment
      ellipse(this.x + offsetX, this.y + offsetY, ellipseSize, ellipseSize);
    }


    // Feet/Shoes (Red)
    fill(255, 0, 0); // Red color for shoes
    let shoeWidth = this.size * 0.6;
    let shoeHeight = this.size * 0.3;
    let shoeYOffset = this.size * 0.4;
    let shoeXOffset = this.size * 0.25; // Adjust offset slightly
    ellipse(this.x - shoeXOffset, this.y + shoeYOffset, shoeWidth, shoeHeight); // Left shoe
    ellipse(this.x + shoeXOffset, this.y + shoeYOffset, shoeWidth, shoeHeight); // Right shoe

    // Simple Eyes (Black)
    fill(0);
    let eyeSize = this.size * 0.15;
    let eyeYOffset = this.size * 0.15;
    let eyeXOffset = this.size * 0.25;
    ellipse(this.x - eyeXOffset, this.y - eyeYOffset, eyeSize, eyeSize * 1.5); // Left eye (slightly oval)
    ellipse(this.x + eyeXOffset, this.y - eyeYOffset, eyeSize, eyeSize * 1.5); // Right eye (slightly oval)

    // Mouth (Simple curve)
    noFill();
    stroke(0);
    strokeWeight(2); // Make mouth line a bit thicker
    let mouthWidth = this.size * 0.4;
    let mouthHeight = this.size * 0.2;
    let mouthYOffset = this.size * 0.1;
    arc(this.x, this.y + mouthYOffset, mouthWidth, mouthHeight, 0, PI);
    noStroke(); // Reset stroke
  }

  throwBomb() {
    // Create a new paint bomb at Kirby's position (adjust starting point slightly)
    paintBombs.push(new PaintBomb(this.x, this.y - this.size/2));
  }

  throwMissile() {
     // Create a new paint missile at Kirby's position
     paintMissiles.push(new PaintMissile(this.x, this.y - this.size/2));
  }

  hits(bomb) {
     // Simple distance check for collision with mushroom bombs
     let d = dist(this.x, this.y, bomb.x, bomb.y);
     return d < this.size / 2 + bomb.size / 2;
  }
}

// Paint Bomb Class (Kirby's bomb - Spacebar)
class PaintBomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 15; // Slightly bigger bombs
    this.speed = 8; // Slightly faster bombs
    this.color = color(random(255), random(255), random(255)); // Random colorful paint
  }

  update() {
    this.y -= this.speed; // Move upwards
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  isOffscreen() {
    return this.y < 0;
  }
}

// Paint Missile Class (Kirby's missile - Z key)
class PaintMissile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10; // Missile size
    this.speed = 10; // Missile speed (faster than bombs)
    this.color = color(0, 255, 0); // Green color for missiles
  }

  update() {
    this.y -= this.speed; // Move upwards
  }

  display() {
    fill(this.color);
    noStroke();
    rectMode(CENTER); // Draw from center
    rect(this.x, this.y, this.size, this.size * 2); // Rectangular missile
    rectMode(CORNER); // Reset rectMode
  }

  isOffscreen() {
    return this.y < 0;
  }
}


// Mushroom Class
class Mushroom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseWidth = random(20, 30); // Varied base width
    this.baseHeight = random(30, 40); // Varied base height
    this.capHeightRatio = random(0.6, 0.9); // Varied cap height relative to base
    this.capWidthRatio = random(1.3, 1.8); // Varied cap width relative to base
    // More vibrant colors
    this.stemColor = color(random(180, 255), random(140, 220), random(80, 180)); // Lighter, more vibrant browns/yellows
    this.capColor = color(random(200, 255), random(0, 100), random(0, 100)); // More vibrant reds/pinks
    this.spotColor = color(255); // White spots
    this.speed = random(1.5, 3.5); // Slightly faster random speed
    this.shootInterval = random(120, 300); // Frames between shots
    this.lastShot = frameCount;
  }

  update() {
    this.y += this.speed; // Move downwards
  }

  display() {
    noStroke();

    // Mushroom stem
    fill(this.stemColor);
    rectMode(CENTER);
    let stemWidth = this.baseWidth / 2;
    let stemHeight = this.baseHeight * (1 - this.capHeightRatio);
    rect(this.x, this.y + stemHeight / 2, stemWidth, stemHeight);

    // Mushroom cap
    fill(this.capColor);
    let capWidth = this.baseWidth * this.capWidthRatio;
    let capHeight = this.baseHeight * this.capHeightRatio;
    arc(this.x, this.y - stemHeight / 2, capWidth, capHeight, PI, TWO_PI);

    // Add spots to the cap for variation
    fill(this.spotColor);
    let numSpots = floor(random(2, 5)); // Random number of spots
    for (let i = 0; i < numSpots; i++) {
      let spotSize = random(3, 7);
      // Position spots randomly on the cap arc area
      let angle = random(PI, TWO_PI); // Angle on the arc
      let radius = random(capHeight * 0.2, capHeight * 0.4); // Distance from center
      let spotX = this.x + cos(angle) * radius;
      let spotY = this.y - stemHeight / 2 + sin(angle) * radius * (capHeight / capWidth); // Adjust Y based on ellipse shape
      ellipse(spotX, spotY, spotSize, spotSize);
    }

    rectMode(CORNER); // Reset rectMode
  }

  hits(projectile) { // Renamed parameter to be generic
    // Simple distance check for collision
    let d = dist(this.x, this.y, projectile.x, projectile.y);
    // Adjust collision radius based on average mushroom size and projectile size
    let avgMushroomSize = (this.baseWidth + this.baseHeight) / 2;
    // Use projectile.size directly, assuming it's the radius or half the dimension
    // For the rectangular missile, this is a simplification, but works for basic collision
    return d < avgMushroomSize / 2 + projectile.size / 2;
  }

  isOffscreen() {
    return this.y > height + this.baseHeight; // Use baseHeight for offscreen check
  }

  maybeShoot() {
    // Only shoot if on screen and not game over
    if (this.y > 0 && !gameOver && frameCount - this.lastShot > this.shootInterval) {
      // Mushroom bombs now fall straight down
      mushroomBombs.push(new MushroomBomb(this.x, this.y));
      this.lastShot = frameCount;
      this.shootInterval = random(120, 300); // Reset interval
    }
  }
}

// Mushroom Bomb Class (Projectile from Mushroom - falls straight down)
class MushroomBomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10; // Size of mushroom bomb
    this.speed = 3; // Speed of mushroom bomb (slower, just falls)
    this.velX = 0; // No horizontal movement
    this.velY = this.speed; // Only vertical movement downwards
    this.color = color(100, 50, 0); // Brownish color
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  isOffscreen() {
    return this.y > height; // Only check if it goes below the screen
  }
}