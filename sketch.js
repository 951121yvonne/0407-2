// --- 全域變數宣告 ---
var currentLevel = 1;    // 目前關卡
var gridSize;            // 方格大小 (動態計算)
var targetX, targetY;    // 寶藏位置 (X, Y)
var timer = 30;          // 倒數計時 (秒)
var gameState = "START"; // 遊戲狀態: "START", "PLAYING", "GAMEOVER"
var isWon = false;       // 是否獲勝 (本關完成)

// 按鈕相關變數
var btnW = 220;
var btnH = 60;
var btnX, btnY;

// --- 初始設定 ---
function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    updateButtonPosition();
}

// --- 視窗縮放監聽 ---
function windowResized() {
    resizeCanvas(windowWidth, windowHeight); 
    updateButtonPosition(); 
    // 縮放時重新初始化當前關卡，確保寶藏在可視範圍
    initLevel(); 
}

function updateButtonPosition() {
    btnX = width / 2 - btnW / 2;
    btnY = height / 2 + 80;
}

// --- 繪圖迴圈 ---
function draw() {
    background('#212E40'); // 主題色 5

    if (gameState == "START") {
        drawStartScreen();
    } else if (gameState == "PLAYING") {
        playGame();
    } else if (gameState == "GAMEOVER") {
        drawGameOverScreen();
    }
}

// --- 畫面 1: 開始畫面 ---
function drawStartScreen() {
    fill('#B4C0D9');
    textSize(45);
    text("🕵️ 幸運色塊獵人", width / 2, height / 2 - 100);
    
    fill('#889ABF');
    textSize(18);
    text("目標：找出隱藏色塊進入下一關\n難度隨關卡提升，方格會越來越小！", width / 2, height / 2 - 10);
    
    drawButton("開始任務");
}

// --- 畫面 2: 遊戲主畫面 ---
function playGame() {
    // 倒數計時邏輯
    if (frameCount % 60 == 0 && timer > 0) {
        timer--;
    }
    if (timer == 0) {
        gameState = "GAMEOVER";
        isWon = false;
    }

    // 繪製網格與雷達邏輯
    for (var x = 0; x < width; x += gridSize) {
        for (var y = 0; y < height; y += gridSize) {
            stroke('#313E59');
            noFill();
            rect(x, y, gridSize, gridSize);

            // 雷達互動
            if (mouseX > x && mouseX < x + gridSize && 
                mouseY > y && mouseY < y + gridSize) {
                
                var d = dist(x, y, targetX, targetY);
                var r = map(d, 0, width/2, 179, 49); 
                var g = map(d, 0, width/2, 192, 62);
                var b = map(d, 0, width/2, 216, 89);
                var size = map(d, 0, width/2, gridSize * 0.9, 5);
                
                noStroke();
                fill(r, g, b, 200);
                ellipse(x + gridSize/2, y + gridSize/2, size);
            }
        }
    }
    
    // 上方資訊列
    drawHUD();
}

function drawHUD() {
    fill(33, 46, 63, 200);
    noStroke();
    rect(0, 0, width, 60);
    
    fill(255);
    textSize(22);
    // 顯示關卡
    textAlign(LEFT, CENTER);
    text("🏆 關卡: " + currentLevel, 30, 30);
    
    // 顯示時間
    textAlign(CENTER, CENTER);
    if (timer < 10) fill('#FF6B6B');
    text("⏱️ 剩餘時間: " + timer + "s", width / 2, 30);
    
    // 顯示當前方格大小 (Debug/資訊)
    textAlign(RIGHT, CENTER);
    fill('#889ABF');
    textSize(14);
    text("難度係數: " + gridSize + "px", width - 30, 30);
    textAlign(CENTER, CENTER); // 恢復對齊
}

// --- 畫面 3: 結束畫面 (包含過關與失敗) ---
function drawGameOverScreen() {
    if (isWon) {
        background(49, 62, 89, 220);
        drawWinEffect();
        fill('#B4C0D9');
        textSize(50);
        text("🎉 第 " + currentLevel + " 關達成！", width / 2, height / 2 - 50);
        drawButton("進入下一關");
    } else {
        background(33, 46, 63, 240);
        fill('#889ABF');
        textSize(50);
        text("💀 任務失敗", width / 2, height / 2 - 50);
        fill(255);
        textSize(20);
        text("在第 " + currentLevel + " 關倒下了...", width / 2, height / 2 + 10);
        
        // 顯示答案位置
        noFill();
        stroke('#B4C0D9');
        strokeWeight(3);
        rect(targetX, targetY, gridSize, gridSize);
        
        drawButton("重新開始 (Lv.1)");
    }
}

// --- 輔助功能 ---
function drawWinEffect() {
    var radius = (frameCount * 8) % 500;
    noFill();
    stroke(180, 192, 216, 255 - (radius/500)*255);
    strokeWeight(4);
    ellipse(targetX + gridSize/2, targetY + gridSize/2, radius);
}

function drawButton(label) {
    let isHover = (mouseX > btnX && mouseX < btnX + btnW && 
                   mouseY > btnY && mouseY < btnY + btnH);
    
    if (isHover) {
        fill('#889ABF');
        cursor(HAND);
    } else {
        fill('#54678C');
        cursor(ARROW);
    }
    
    stroke('#B4C0D9');
    strokeWeight(2);
    rect(btnX, btnY, btnW, btnH, 15);
    
    fill(255);
    noStroke();
    textSize(20);
    text(label, btnX + btnW/2, btnY + btnH/2);
}

function mousePressed() {
    if (gameState == "START") {
        if (isMouseOverButton()) {
            currentLevel = 1;
            initLevel();
        }
    } else if (gameState == "GAMEOVER") {
        if (isMouseOverButton()) {
            if (isWon) {
                currentLevel++; // 往下前進
            } else {
                currentLevel = 1; // 失敗重來
            }
            initLevel();
        }
    } else if (gameState == "PLAYING") {
        if (mouseX > targetX && mouseX < targetX + gridSize &&
            mouseY > targetY && mouseY < targetY + gridSize) {
            isWon = true;
            gameState = "GAMEOVER";
        }
    }
}

function isMouseOverButton() {
    return (mouseX > btnX && mouseX < btnX + btnW && 
            mouseY > btnY && mouseY < btnY + btnH);
}

// --- 核心初始化：計算難度與位置 ---
function initLevel() {
    // 難度公式：第 5 關時 gridSize 為 50
    // 公式：100 - (Level * 10)，最低不小於 15
    gridSize = max(15, 100 - (currentLevel * 10));
    
    var cols = floor(width / gridSize);
    var rows = floor(height / gridSize);
    
    targetX = floor(random(cols)) * gridSize;
    targetY = floor(random(rows)) * gridSize;
    
    timer = 30;
    isWon = false;
    gameState = "PLAYING";
}