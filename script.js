document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const currentScoreElem = document.getElementById('current-score');
    const highScoreElem = document.getElementById('high-score');
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const stopBtn = document.getElementById('stop');
    const resetScoreBtn = document.getElementById('reset-score');
    const gameStatusElem = document.getElementById('game-status');
    const titleElem = document.getElementById('title');
    const bodyElem = document.body;

    let snake = [{ x: 200, y: 200 }];
    let direction = { x: 0, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let highScore = 0;
    let gameInterval;
    let isPaused = false;
    let isAutoMode = false;
    let isGameStarted = false;
    let speed = 100;
    let restrictedPaths = [];
    let restrictionTimeout;

    function initGame() {
        snake = [{ x: 200, y: 200 }];
        direction = getRandomDirection();
        score = 0;
        currentScoreElem.textContent = score;
        gameStatusElem.style.display = 'none';
        titleElem.style.display = 'block';
        titleElem.classList.remove('background'); // 移除背景样式
        placeFood();
        if (gameInterval) clearInterval(gameInterval);
        speed = 100;
        gameInterval = setInterval(gameLoop, speed);
        isGameStarted = true;
        titleElem.style.animationPlayState = 'running'; // 开始标题环形运动
        updateTitleAnimation();
    }

    function getRandomDirection() {
        const directions = [
            { x: 20, y: 0 },
            { x: -20, y: 0 },
            { x: 0, y: 20 },
            { x: 0, y: -20 }
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * 20) * 20;
        food.y = Math.floor(Math.random() * 20) * 20;
    }

    function gameLoop() {
        if (isPaused) return;

        if (isAutoMode) {
            autoMove();
        }

        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameStatusElem.textContent = '游戏结束';
            gameStatusElem.style.display = 'block';
            titleElem.style.display = 'block';
            titleElem.classList.add('background'); // 添加背景样式
            clearInterval(gameInterval);
            isGameStarted = false;
            titleElem.style.animationPlayState = 'paused'; // 停止标题环形运动
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            startBtn.style.display = 'inline-block';
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            currentScoreElem.textContent = score;
            if (score > highScore) {
                highScore = score;
                highScoreElem.textContent = highScore;
            }
            placeFood();
            speed *= 0.95; // 每次吃到食物速度增加5%
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
            updateTitleAnimation(); // 更新标题动画

            // 记录蛇经过的路径
            restrictedPaths = snake.slice();
            if (restrictionTimeout) clearTimeout(restrictionTimeout);
            restrictionTimeout = setTimeout(() => {
                restrictedPaths = [];
            }, 1000); // 1秒后清除限制路径
        } else {
            snake.pop();
        }

        if (snake.length === (canvas.width / 20) * (canvas.height / 20)) {
            gameStatusElem.textContent = '老铁666';
            gameStatusElem.style.display = 'block';
            titleElem.style.display = 'block';
            titleElem.classList.add('background'); // 添加背景样式
            clearInterval(gameInterval);
            isGameStarted = false;
            titleElem.style.animationPlayState = 'paused'; // 停止标题环形运动
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            startBtn.style.display = 'inline-block';
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isPaused ? 'gray' : 'green';
        snake.forEach(segment => ctx.fillRect(segment.x, segment.y, 20, 20));
        ctx.fillStyle = isPaused ? 'lightgray' : 'red';
        ctx.fillRect(food.x, food.y, 20, 20);
    }

    function autoMove() {
        const head = snake[0];
        const possibleDirections = [
            { x: 20, y: 0 },
            { x: -20, y: 0 },
            { x: 0, y: 20 },
            { x: 0, y: -20 }
        ];

        possibleDirections.sort((a, b) => {
            const newHeadA = { x: head.x + a.x, y: head.y + a.y };
            const newHeadB = { x: head.x + b.x, y: head.y + b.y };
            const distA = Math.abs(newHeadA.x - food.x) + Math.abs(newHeadA.y - food.y);
            const distB = Math.abs(newHeadB.x - food.x) + Math.abs(newHeadB.y - food.y);
            const isSafeA = isSafe(newHeadA);
            const isSafeB = isSafe(newHeadB);

            if (isSafeA && !isSafeB) return -1;
            if (!isSafeA && isSafeB) return 1;
            return distA - distB;
        });

        for (const dir of possibleDirections) {
            const newHead = { x: head.x + dir.x, y: head.y + dir.y };
            if (isSafe(newHead) && !isRestricted(newHead)) {
                direction = dir;
                break;
            }
        }
    }

    function isSafe(position) {
        return position.x >= 0 && position.x < canvas.width && position.y >= 0 && position.y < canvas.height && !snake.some(segment => segment.x === position.x && segment.y === position.y);
    }

    function isRestricted(position) {
        return restrictedPaths.some(segment => segment.x === position.x && segment.y === position.y);
    }

    function updateTitleAnimation() {
        const duration = 10 * (100 / speed); // 随速度增加旋转速度
        titleElem.style.animationDuration = `${duration}s, 1s, 1s`; // 自转和飞动速度
    }

    function startGoldenSpiralAnimation() {
        titleElem.style.animation = 'goldenSpiral 5s linear infinite';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            if (isGameStarted) {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? '继续' : '暂停';
                gameStatusElem.textContent = isPaused ? '暂停' : '';
                gameStatusElem.style.display = isPaused ? 'block' : 'none';
                if (isPaused) {
                    bodyElem.classList.add('paused');
                } else {
                    bodyElem.classList.remove('paused');
                }
            }
            return;
        }

        if (isAutoMode) return;

        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) direction = { x: 0, y: -20 };
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = { x: 0, y: 20 };
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = { x: -20, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = { x: 20, y: 0 };
                break;
        }
    });

    startBtn.addEventListener('click', () => {
        isAutoMode = true;
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        stopBtn.style.display = 'inline-block';
        initGame();
        startGoldenSpiralAnimation(); // 开始黄金螺旋动画
        titleElem.style.display = 'none'; // 隐藏标题
    });

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '继续' : '暂停';
        gameStatusElem.textContent = isPaused ? '暂停' : '';
        gameStatusElem.style.display = isPaused ? 'block' : 'none';
        if (isPaused) {
            bodyElem.classList.add('paused');
        } else {
            bodyElem.classList.remove('paused');
        }
    });

    stopBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        isGameStarted = false;
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        gameStatusElem.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    resetScoreBtn.addEventListener('click', () => {
        highScore = 0;
        highScoreElem.textContent = highScore;
    });

    startBtn.addEventListener('click', function() {
        const title = document.getElementById('title');
        title.classList.add('fly');
        let speed = 10; // 初始速度10秒一圈
        let interval = setInterval(() => {
            speed *= 0.8; // 每转一圈速度增加20%
            title.style.animationDuration = `${speed}s`;
        }, speed * 1000);

        document.getElementById('stop').addEventListener('click', function() {
            clearInterval(interval);
            title.classList.remove('fly');
            title.style.animationDuration = '10s'; // 重置速度
        });

        document.getElementById('pause').addEventListener('click', function() {
            clearInterval(interval);
            title.style.animationPlayState = 'paused';
        });

        document.getElementById('start').addEventListener('click', function() {
            title.style.animationPlayState = 'running';
            interval = setInterval(() => {
                speed *= 0.8; // 每转一圈速度增加20%
                title.style.animationDuration = `${speed}s`;
            }, speed * 1000);
        });
    });
});