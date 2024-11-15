const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const timerDiv = document.getElementById("timer");
const heartsDiv = document.getElementById("hearts");
const popupDiv = document.getElementById("popup");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

let timer = 0;
let gameInterval, shootInterval, spawnInterval;
let rudolphSpeed = 0.5, isGameOver = false;
let hearts = 3;

const santa = { x: canvas.width / 2 - 10, y: canvas.height - 40, width: 20, height: 20, dx: 5 };
let bullets = [];
let fallingItems = [];

// 이동 상태 변수
let movingLeft = false;
let movingRight = false;

// 도트 이미지 설정
function drawSanta() {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(santa.x, santa.y, santa.width, santa.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(santa.x + 2, santa.y + 2, 16, 4);
    ctx.fillRect(santa.x + 8, santa.y - 4, 4, 4);
}

function drawRudolph(x, y) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x, y, 20, 20);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 8, y + 2, 4, 4);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 5, y + 5, 2, 2);
    ctx.fillRect(x + 13, y + 5, 2, 2);
}

function drawBullet(x, y) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y, 5, 10);
}

function drawPresent(x, y) {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(x, y, 20, 20);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x + 8, y, 4, 20);
    ctx.fillRect(x, y + 8, 20, 4);
}

// 타이머 시작
function startTimer() {
    gameInterval = setInterval(() => {
        if (!isGameOver) {
            timer += 0.01;
            timerDiv.textContent = timer.toFixed(2) + "초";

            // 10초 단위로 루돌프와 선물 속도 20% 증가
            if (Math.floor(timer) % 10 === 0) {
                rudolphSpeed = Math.min(rudolphSpeed * 1.2, 5);
            }
        }
    }, 10);
}

// 키보드 이벤트 처리
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") movingLeft = true;
    if (event.key === "ArrowRight") movingRight = true;
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") movingLeft = false;
    if (event.key === "ArrowRight") movingRight = false;
});

// 산타 이동 함수
function moveSanta() {
    if (movingLeft && santa.x > 0) santa.x -= santa.dx;
    if (movingRight && santa.x < canvas.width - santa.width) santa.x += santa.dx;
}

// 총알 발사
function shootBullet() {
    bullets.push({ x: santa.x + santa.width / 2 - 2.5, y: santa.y - 10 });
}

// 루돌프와 선물 생성
function spawnFallingItems() {
    const isPresent = timer > 10 ? Math.random() < 0.2 : false;
    fallingItems.push({
        x: Math.random() * (canvas.width - 20),
        y: 0,
        isPresent: isPresent,
    });
}

// 하트 감소
function decreaseHeart() {
    hearts -= 1;
    heartsDiv.innerHTML = "❤️".repeat(hearts);
    if (hearts <= 0) gameOver();
}

// 게임 오버
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(shootInterval);
    clearInterval(spawnInterval);
    popupDiv.style.display = "block";
    restartButton.style.display = "block";
    document.getElementById("finalTime").textContent = timer.toFixed(2);
}

// 게임 초기화
function resetGame() {
    timer = 0;
    rudolphSpeed = 0.5;
    hearts = 3;
    isGameOver = false;
    bullets = [];
    fallingItems = [];
    santa.x = canvas.width / 2 - 10;

    heartsDiv.innerHTML = "❤️❤️❤️";
    popupDiv.style.display = "none";
    restartButton.style.display = "none";
    timerDiv.textContent = "0.00초";
}

// 게임 루프
function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveSanta();
    drawSanta();

    bullets.forEach((bullet, i) => {
        bullet.y -= 5;
        drawBullet(bullet.x, bullet.y);
        if (bullet.y < 0) bullets.splice(i, 1);
    });

    fallingItems.forEach((item, i) => {
        item.y += rudolphSpeed;

        if (item.isPresent) {
            drawPresent(item.x, item.y);
        } else {
            drawRudolph(item.x, item.y);
        }

        // 충돌 판정 (총알과 루돌프/선물)
        bullets.forEach((bullet, j) => {
            if (
                bullet.x < item.x + 20 &&
                bullet.x + 5 > item.x &&
                bullet.y < item.y + 20 &&
                bullet.y + 10 > item.y
            ) {
                if (item.isPresent) {
                    decreaseHeart(); // 선물을 맞췄을 때 하트 감소
                }
                bullets.splice(j, 1); // 총알 제거
                fallingItems.splice(i, 1); // 아이템 제거
            }
        });

        // 산타와 루돌프/선물 충돌 처리
        if (
            item.x < santa.x + santa.width &&
            item.x + 20 > santa.x &&
            item.y < santa.y + santa.height &&
            item.y + 20 > santa.y
        ) {
            if (!item.isPresent) {
                gameOver(); // 산타와 루돌프 충돌 시 게임 종료
            } else {
                decreaseHeart(); // 산타와 선물 충돌 시 하트 감소
                fallingItems.splice(i, 1); // 선물 제거
            }
        }

        // 루돌프가 화면을 벗어난 경우
        if (!item.isPresent && item.y > canvas.height) {
            decreaseHeart(); // 루돌프를 놓쳤을 때 하트 감소
            fallingItems.splice(i, 1); // 루돌프 제거
        }

        // 선물이 화면을 벗어난 경우
        if (item.isPresent && item.y > canvas.height) {
            fallingItems.splice(i, 1); // 선물 제거 (하트 감소 없음)
        }
    });

    requestAnimationFrame(gameLoop);
}

// 버튼 이벤트
startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    canvas.style.display = "block";
    timerDiv.style.display = "block";
    heartsDiv.style.display = "block";
    resetGame();
    shootInterval = setInterval(shootBullet, 500);
    spawnInterval = setInterval(spawnFallingItems, 1200);
    startTimer();
    gameLoop();
});

restartButton.addEventListener("click", () => {
    resetGame();
    shootInterval = setInterval(shootBullet, 500);
    spawnInterval = setInterval(spawnFallingItems, 1200);
    startTimer();
    gameLoop();
});
