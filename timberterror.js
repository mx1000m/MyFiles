//board
let board;
let boardWidth = 400;
let boardHeight = 600;
let context;

//bird // Increase the size of the bird
let birdWidth = 118; //width/height ratio = 408/228 = 17/12
let birdHeight = 100;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg1; // Original bird image
let birdImg2; // New bird image
let spaceBarPressed = false; // Track if the space bar is pressed
let spaceBarEnabled = true; // Track if the space bar is enabled

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 40; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 320;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let initialVelocityX = -4; // Initial speed
let velocityX = initialVelocityX; // Initialize velocityX
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

let speedIncreaseInterval = 10; // Set the interval to increase speed

// Initial pipe placement interval (in milliseconds)
let initialPipeInterval = 1500;

// Collision tolerance in pixels
let collisionTolerance = 3;

// Define a variable for the pipe placement interval
let pipePlacementInterval;

let gameOverImg = new Image();
gameOverImg.src = "gameover.png"; // Replace with the correct path to your "gameover.png" image

let lastGameOverTime = 0; // Track the time when the game was last over

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load the original bird image
    birdImg1 = new Image();
    birdImg1.src = "./flappybird.png";
    birdImg1.onload = function () {
        context.drawImage(birdImg1, bird.x, bird.y, bird.width, bird.height);
    }

    // Load the second bird image
    birdImg2 = new Image();
    birdImg2.src = "./flappybird2.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);

    // Set the initial pipe placement interval
    pipePlacementInterval = setInterval(placePipes, initialPipeInterval);

    document.addEventListener("keydown", moveBird);
    document.addEventListener("keyup", resetBirdImage); // Listen for space bar release
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Increase speed every `speedIncreaseInterval` points
    if (score > 0 && score % speedIncreaseInterval === 0) {
        velocityX -= 0.04; // Increase speed by reducing `velocityX`

        // Reduce the pipe placement interval every 10 points
        if (score % 10 === 0 && initialPipeInterval > 500) {
            initialPipeInterval -= 100; // Reduce the interval by 100 milliseconds (adjust as needed)
            clearInterval(pipePlacementInterval); // Clear the current interval
            pipePlacementInterval = setInterval(placePipes, initialPipeInterval); // Set a new interval
        }
    }

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    // Add shadow effect to the bird
    context.shadowBlur = 1; // Adjust the shadow blur as needed
    context.shadowColor = "rgba(36,51,86,0.7)"; // Set the shadow color
    context.shadowOffsetX = -5; // Adjust the shadow offset as needed
    context.shadowOffsetY = 10; // Adjust the shadow offset as needed

    // Draw the appropriate bird image based on space bar press
    if (spaceBarPressed) {
        context.drawImage(birdImg2, bird.x, bird.y, bird.width, bird.height);
    } else {
        context.drawImage(birdImg1, bird.x, bird.y, bird.width, bird.height);
    }

    // Reset shadow properties
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowColor = "transparent";

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        // Add shadow effect to the left side of the tubes
        context.shadowBlur = 2; // Adjust the shadow blur as needed
        context.shadowColor = "rgba(19,27,46,0.8)"; // Set the shadow color
        context.shadowOffsetX = -5; // Adjust the shadow offset as needed
        context.shadowOffsetY = 5; // Adjust the shadow offset as needed

        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Reset shadow properties
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowColor = "transparent";

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        // Check collision with tolerance
        if (detectCollision(bird, pipe, 10)) { // Increase the tolerance to 5px
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    // Calculate the width of the score text
    const scoreText = score.toString(); // Convert score to string
    const scoreTextWidth = context.measureText(scoreText).width;

    // Calculate the X position to center the score text
    const centerX = (boardWidth - scoreTextWidth) / 2;

    // Draw the score text
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(scoreText, centerX, 55);

    if (gameOver) {
        context.drawImage(gameOverImg, 0, 0, boardWidth, boardHeight);
        context.fillText("GAME OVER", 60, 120);
        context.fillText(score, centerX, 55);
        context.font = "20px sans-serif";
        context.fillText("Well done sailor!", 125, 423);
        context.fillText("Tweet your score for a", 96, 446);
        context.fillText("FREE AIRDROP chance!", 83, 470);

        // Disable the space bar when the game is over
        spaceBarEnabled = false;

        // Show the Tweet button
        const tweetButton = document.getElementById('tweet-button');
        tweetButton.style.display = 'block';

        // Show the Tweet button
        const restartButton = document.getElementById('restart-button');
        restartButton.style.display = 'block';


// Set the href attribute with the user's score and other information
const userScore = score;
const gameURL = 'https://thepixelcaptainz.com/timberterrorgame.html'; // Replace with your actual game URL
const visualUrl = "pic.twitter.com/5gfzm4OHnE"; // Replace with the actual URL of your visual

// Encode hashtags as %23
const hashtags = '%23PixelCaptainz %23TimberTerror';

// Add Twitter mention
const mention = '@TheHornyLand69';

tweetButton.href = `https://twitter.com/intent/tweet?text=Ahoy! Me ship dodged ${userScore} logs – more than a beaver in a lumberyard! 🏴‍☠️⚓%0A%0AUp for the challenge for a chance at a FREE AIRDROP?%0A%0A -> ${gameURL} %0A%0A${visualUrl} %0A%0A${hashtags} ${mention}`;
tweetButton.target = '_blank';

        restartButton.href = `timberterror.html`;


    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 2;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    const currentTime = new Date().getTime();

    // Check if there is a restart delay and return if true
    if (spaceBarEnabled === false || (gameOver && currentTime - lastGameOverTime < 2000)) {
        e.preventDefault(); // Prevent the space bar from having any effect
        return;
    }

    if (!gameOver && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX")) {
        // Jump
        velocityY = -6;
        spaceBarPressed = true; // Set the space bar press flag
    }

    // Check if "Enter" key is pressed to restart the game
    if (e.code == "Enter") {
        e.preventDefault(); // Prevent the default behavior of the "Enter" key
        restartGame();
    }

    // Update the last game over time
    if (gameOver) {
        lastGameOverTime = currentTime;
    }
}

// Add an event listener for the button click
const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", restartGame);

function restartGame() {
    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        lastGameOverTime = 0; // Reset the last game over time

        // Hide the Tweet button
        const tweetButton = document.getElementById('tweet-button');
        tweetButton.style.display = 'none';

        // Clear the "Game Over" screen
        context.clearRect(0, 0, board.width, board.height);

        // Reset the speed and pipe interval
        velocityX = initialVelocityX;
        initialPipeInterval = 1500;
        
        // Clear the current interval and set a new one
        clearInterval(pipePlacementInterval);
        pipePlacementInterval = setInterval(placePipes, initialPipeInterval);

        // Enable the space bar
        spaceBarEnabled = true;

        // Restart the game loop
        requestAnimationFrame(update);
    }
}


function resetBirdImage(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        spaceBarPressed = false; // Reset the space bar press flag
    }
}

function detectCollision(a, b, tolerance = 3) {
    return (
        a.x + a.width > b.x + tolerance &&
        a.x < b.x + b.width - tolerance &&
        a.y + a.height > b.y + tolerance &&
        a.y < b.y + b.height - tolerance
    );
}
