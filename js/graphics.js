const graphics = {
    $canvas: null,
    $hud: null,

    ctx: null,
    hudCtx: null,

    $crystalImage: document.createElement('canvas'),
    $bonusCrystalImage: document.createElement('canvas'),
    $playerImage: document.createElement('canvas'),
    $bulletImage: document.createElement('canvas'),
    $gateLeftImage: document.createElement('canvas'),
    $gateRightImage: document.createElement('canvas'),
    $goalImage: document.createElement('canvas'),

    $poofImage: document.createElement('canvas'),
    $sparkleImage: document.createElement('canvas'),

    $bombImage: document.createElement('canvas'),
    $obstacleImage: document.createElement('canvas'),

    $bugImage: document.createElement('canvas'),
    $shooterImage: document.createElement('canvas'),
    $blobImage: document.createElement('canvas'),
    $ballImage: document.createElement('canvas'),

    ImageType: {},
    resultsDrawn: false,
    gameOverDrawn: false,
    mode: 0,
    Mode: {
        SHAPE: 0,
        IMAGE: 1
    },
    IMAGE_WIDTH: 50,
    IMAGE_HEIGHT: 50,

    createImage(image, key) {
        document.querySelector('#debug').appendChild(image);
        image.width = this.IMAGE_WIDTH * utils.GameObjectTotalFrames[key];
        image.height = this.IMAGE_HEIGHT;

        let ctx = image.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.fillText(key, 0, 0);
        switch (parseInt(key)) {
            case utils.GameObject.SPARKLE:
                const particles = [];
                for (let i = 0; i < 6; i++) {
                    const p = utils.createGameObject({
                        x: this.IMAGE_WIDTH / 2,
                        y: this.IMAGE_HEIGHT / 2,
                        width: this.IMAGE_WIDTH / 15,
                        height: this.IMAGE_HEIGHT / 15,
                    });

                    const r = Math.PI * 2 - i;
                    const position = utils.deltaPositionFromRotation(r, 1);
                    p.rotation = r;
                    p.xSpeed = position.xSpeed;
                    p.ySpeed = position.ySpeed;

                    particles.push(p);
                }
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];

                    for (let j = 0; j < utils.GameObjectTotalFrames[utils.GameObject.SPARKLE]; j++) {
                        ctx.globalAlpha = 1 - j * 0.05;

                        ctx.fillRect(p.x + this.IMAGE_WIDTH * j, p.y, p.width, p.height);
                        p.x += p.xSpeed;
                        p.y += p.ySpeed;
                    }
                }

                break;
            case utils.GameObject.BOMB:
                const bombRad = this.IMAGE_WIDTH / 5;
                ctx.beginPath();
                ctx.arc(this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2.5, bombRad, 0, Math.PI * 2);
                ctx.fill();

                ctx.lineWidth = this.IMAGE_WIDTH / 15;
                ctx.beginPath();
                ctx.arc(this.IMAGE_WIDTH / 1.4, this.IMAGE_HEIGHT / 3, this.IMAGE_WIDTH / 4, Math.PI, Math.PI * 1.5);
                ctx.stroke();
                break;
            case utils.GameObject.GOAL:
                // closed frame
                ctx.beginPath();
                ctx.arc(this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH / 2,
                    0, Math.PI, true);
                ctx.fill();

                // open frame
                ctx.beginPath();
                ctx.arc(this.IMAGE_WIDTH + this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH / 2,
                    0, Math.PI, true);
                ctx.fill();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillRect(
                    this.IMAGE_WIDTH + this.IMAGE_WIDTH / 4, 0,
                    this.IMAGE_WIDTH - this.IMAGE_WIDTH / 2,
                    this.IMAGE_HEIGHT);
                break;
            case utils.GameObject.PLAYER:
                ctx.beginPath();
                ctx.arc(this.IMAGE_WIDTH / 2, this.IMAGE_WIDTH / 2, this.IMAGE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.beginPath();
                //ctx.arc(this.IMAGE_WIDTH / 2, this.IMAGE_WIDTH / 2, this.IMAGE_WIDTH / 6, 0, Math.PI * 2);

                const smallRad = this.IMAGE_WIDTH / 10;
                const smallOffsetLeft = this.IMAGE_WIDTH / 4;
                const smallOffsetRight = this.IMAGE_WIDTH - this.IMAGE_WIDTH / 4;
                ctx.arc(smallOffsetLeft, this.IMAGE_HEIGHT / 2, smallRad, 0, Math.PI * 2)
                ctx.moveTo(smallOffsetRight, this.IMAGE_HEIGHT / 2);
                ctx.arc(smallOffsetRight, this.IMAGE_HEIGHT / 2, smallRad, 0, Math.PI * 2)
                ctx.moveTo(this.IMAGE_WIDTH / 2, smallOffsetLeft);
                ctx.arc(this.IMAGE_WIDTH / 2, smallOffsetLeft, smallRad, 0, Math.PI * 2)
                ctx.moveTo(this.IMAGE_WIDTH / 2, smallOffsetRight);
                ctx.arc(this.IMAGE_WIDTH / 2, smallOffsetRight, smallRad, 0, Math.PI * 2)

                ctx.fill();
                break;
            case utils.GameObject.BULLET:
                ctx.fillRect(0, 0, 50, 50);
                break;
            case utils.GameObject.KEY:
                const width = this.IMAGE_WIDTH / 2;
                const height = this.IMAGE_HEIGHT / 2;
                const yp = this.IMAGE_HEIGHT / 5;
                const xp = this.IMAGE_WIDTH / 5;
                const x = width * -1;
                const y = height * -1;

                ctx.beginPath();
                // diamond
                this.drawDiamond(ctx, this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH - xp, this.IMAGE_HEIGHT - yp);
                ctx.fill();

                // extensions
                this.drawCross(ctx);

                break;
            case utils.GameObject.BONUS_CRYSTAL:
                const xPadding = this.IMAGE_WIDTH / 10;
                const yPadding = this.IMAGE_HEIGHT / 10;

                for (let i = 0; i < utils.GameObjectTotalFrames[utils.GameObject.BONUS_CRYSTAL]; i++) {
                    const dx = this.IMAGE_WIDTH * i;
                    let padding = 0;

                    ctx.beginPath();
                    ctx.fillStyle = 'white';
                    this.drawDiamond(ctx, dx + this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.fillStyle = 'black';

                    if (i === 0) {

                    } else if (i < 8) {
                        padding = xPadding * (i + 1);

                        ctx.moveTo(dx + this.IMAGE_WIDTH / 2, yPadding);
                        ctx.lineTo(dx + padding, this.IMAGE_HEIGHT / 2);
                        ctx.lineTo(dx + this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT - yPadding);
                        ctx.lineTo(dx + xPadding, this.IMAGE_HEIGHT / 2);
                        ctx.lineTo(dx + this.IMAGE_WIDTH / 2, yPadding);
                    } else {
                        padding = xPadding * (i - 7);
                        ctx.moveTo(dx + this.IMAGE_WIDTH / 2, yPadding);
                        ctx.lineTo(dx + this.IMAGE_WIDTH - xPadding, this.IMAGE_HEIGHT / 2);
                        ctx.lineTo(dx + this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT - yPadding);
                        ctx.lineTo(dx + padding, this.IMAGE_HEIGHT / 2);
                        ctx.lineTo(dx + this.IMAGE_WIDTH / 2, yPadding);
                    }

                    ctx.fill();
                }

                break;
            case utils.GameObject.OBSTACLE:
                const cutWidth = this.IMAGE_WIDTH / 4;
                const cutHeight = this.IMAGE_HEIGHT / 4;
                const cutOffset = this.IMAGE_WIDTH / 2 - cutWidth / 2;

                ctx.fillRect(0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
                ctx.globalCompositeOperation = 'destination-out';

                ctx.fillRect(cutOffset, 0, cutWidth, cutHeight);

                ctx.fillRect(cutOffset, this.IMAGE_HEIGHT - cutHeight, cutWidth, this.IMAGE_HEIGHT);

                ctx.fillRect(0, this.IMAGE_HEIGHT / 2 - cutHeight / 2, cutWidth, cutHeight);
                ctx.fillRect(this.IMAGE_WIDTH - cutWidth, this.IMAGE_HEIGHT / 2 - cutHeight / 2, cutWidth, cutHeight);

                break;
            case utils.GameObject.GATE_LEFT:
                ctx.arc(0, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case utils.GameObject.GATE_RIGHT:
                ctx.arc(this.IMAGE_WIDTH, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case utils.GameObject.SHOOTER:
                const px = this.IMAGE_WIDTH / 4;
                const py = this.IMAGE_HEIGHT / 4;
                const IMAGE_WIDTH = this.IMAGE_WIDTH;
                const IMAGE_HEIGHT = this.IMAGE_HEIGHT;

            function drawBody(offsetX) {
                // body
                ctx.fillRect(offsetX + px, py, IMAGE_WIDTH - px * 2, IMAGE_HEIGHT - py * 2);

                for (let i = 0; i < 6; i++) {
                    const mod = i % 2;
                    ctx.beginPath();

                    if (i === 0 || i === 1) {
                        // top legs
                        ctx.moveTo(offsetX, py);
                        ctx.lineTo(offsetX, 0);
                        ctx.moveTo(offsetX + IMAGE_WIDTH - px, py);
                        ctx.lineTo(offsetX + IMAGE_WIDTH - px, 0);
                    } else if (i === 2 || i === 3) {
                        // right legs
                        ctx.moveTo(offsetX + IMAGE_WIDTH - px, py);
                        ctx.lineTo(offsetX + IMAGE_WIDTH, py);
                        ctx.moveTo(offsetX + IMAGE_WIDTH - px, IMAGE_HEIGHT - py);
                        ctx.lineTo(offsetX + IMAGE_WIDTH, IMAGE_HEIGHT - py);
                    } else if (mod === 2) {
                        // bottom legs
                        ctx.fillRect(offsetX + IMAGE_WIDTH + px * (i - 4), 0, px / 2, py);
                    } else if (mod === 3) {
                        // left legs
                        ctx.fillRect(offsetX + IMAGE_WIDTH + px * (i - 4), IMAGE_HEIGHT - py, px / 2, py);
                    }

                    ctx.stroke();
                }
            }

                drawBody(0);
                drawBody(this.IMAGE_WIDTH);

                break;
            case utils.GameObject.BUG:
                const squareBottom = this.IMAGE_HEIGHT / 2.5;
                const squareTop = this.IMAGE_HEIGHT / 5;

                let dx = 0;
                ctx.fillStyle = 'white';
                // jaw
                ctx.beginPath();
                this.drawSemiCircle(ctx, this.IMAGE_WIDTH / 5, dx + this.IMAGE_WIDTH / 2, squareBottom + this.IMAGE_HEIGHT / 5);
                ctx.fill();
                this.drawFace(ctx, dx, squareTop, squareBottom);


                // attack frame
                dx = this.IMAGE_WIDTH;
                ctx.fillStyle = 'white';
                // jaw
                ctx.beginPath();
                this.drawSemiCircle(ctx, this.IMAGE_WIDTH / 5, dx + this.IMAGE_WIDTH / 2, squareBottom + this.IMAGE_HEIGHT / 3);
                ctx.fill();
                this.drawFace(ctx, dx, squareTop, squareBottom);


                break;
            case utils.GameObject.BLOB:
                ctx.fillRect(0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);

                // attack frame
                ctx.fillRect(this.IMAGE_WIDTH, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
                break;
            case utils.GameObject.BALL:
                ctx.arc(this.IMAGE_WIDTH / 2, this.IMAGE_HEIGHT / 2, this.IMAGE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case utils.GameObject.POOF:
                for (let i = 0; i < utils.GameObjectTotalFrames[utils.GameObject.POOF]; i++) {
                    const dx = i * this.IMAGE_WIDTH;
                    const dy = 0;
                    const px = i * this.IMAGE_WIDTH / 10;
                    const py = i * this.IMAGE_HEIGHT / 10;
                    ctx.globalCompositeOperation = 'source-over';

                    this.drawCross(ctx, dx, dy);

                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.fillRect(dx + this.IMAGE_WIDTH / 2 - px, this.IMAGE_HEIGHT / 2 - py, px * 2, py * 2);
                }

                break;
            default:
                ctx.fillRect(0, 0, 50, 50);
                break;
        }

    },
    preloadImages() {
        this.ctx.fillStyle = 'white';
        const keys = Object.keys(this.ImageType);

        keys.forEach(key => {
            const image = this.ImageType[key];
            const frames = utils.GameObjectTotalFrames[key];

            this.createImage(image, key, frames);
        });
    },
    copyImage(image) {
        const ctx = image.getContext('2d');
        const canvas = document.createElement('canvas');
        const ctx2 = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);

        canvas.width = this.IMAGE_WIDTH;
        canvas.height = this.IMAGE_HEIGHT;
        ctx2.putImageData(data, 0, 0);

        return canvas;
    },
    initMenuImages() {
        document.querySelector('#goalPortal').appendChild(this.copyImage(this.$goalImage));
        document.querySelector('#enemyPortal').appendChild(this.copyImage(this.$gateLeftImage));
        document.querySelector('#bonusCrystal').appendChild(this.copyImage(this.$bonusCrystalImage));
        document.querySelector('#crystal').appendChild(this.copyImage(this.$crystalImage));

    },
    init() {
        this.$canvas = document.querySelector('#canvas');
        this.$hud = document.querySelector('#hud');

        this.ctx = this.$canvas.getContext('2d');
        this.hudCtx = this.$hud.getContext('2d');

        this.$canvas.width = utils.WIDTH;
        this.$canvas.height = utils.HEIGHT;
        this.$hud.width = utils.WIDTH;
        this.$hud.height = utils.HUD_HEIGHT;

        this.hudCtx.fillStyle = 'white';
        this.hudCtx.font = '24px "Gill Sans", sans-serif';
        this.ctx.font = '24px "Gill Sans", sans-serif';

        this.ImageType[utils.GameObject.PLAYER] = this.$playerImage;
        this.ImageType[utils.GameObject.BONUS_CRYSTAL] = this.$bonusCrystalImage;
        this.ImageType[utils.GameObject.KEY] = this.$crystalImage;
        this.ImageType[utils.GameObject.BULLET] = this.$bulletImage;
        this.ImageType[utils.GameObject.GATE_LEFT] = this.$gateLeftImage;
        this.ImageType[utils.GameObject.GATE_RIGHT] = this.$gateRightImage;
        this.ImageType[utils.GameObject.BUG] = this.$bugImage;
        this.ImageType[utils.GameObject.BLOB] = this.$blobImage;
        this.ImageType[utils.GameObject.BALL] = this.$ballImage;
        this.ImageType[utils.GameObject.GOAL] = this.$goalImage;
        this.ImageType[utils.GameObject.BOMB] = this.$bombImage;
        this.ImageType[utils.GameObject.OBSTACLE] = this.$obstacleImage;
        this.ImageType[utils.GameObject.POOF] = this.$poofImage;
        this.ImageType[utils.GameObject.SHOOTER] = this.$shooterImage;
        this.ImageType[utils.GameObject.SPARKLE] = this.$sparkleImage;

        this.preloadImages();
        this.initMenuImages();
    },

    drawFace(ctx, dx, squareTop, squareBottom) {
            ctx.fillStyle = 'white';
            // face
            ctx.fillRect(dx, squareTop, this.IMAGE_WIDTH, squareBottom);

            // antenna
            // left
            ctx.fillRect(dx + this.IMAGE_WIDTH / 8, 0, this.IMAGE_WIDTH / 8, squareTop);
            // right
            ctx.fillRect(dx + this.IMAGE_WIDTH - this.IMAGE_WIDTH / 8 * 2,
                0,
                this.IMAGE_WIDTH / 8,
                squareTop);

            // eyes
            ctx.fillStyle = 'black';
            // left
            ctx.fillRect(dx + this.IMAGE_WIDTH / 8, squareTop + this.IMAGE_HEIGHT / 8, this.IMAGE_WIDTH / 8, this.IMAGE_HEIGHT / 8);
            // right
            ctx.fillRect(dx + this.IMAGE_WIDTH - this.IMAGE_WIDTH / 8 * 2,
                squareTop + this.IMAGE_HEIGHT / 8,
                this.IMAGE_WIDTH / 8,
                this.IMAGE_HEIGHT / 8);


    },
    drawCross(ctx, x = 0, y = 0) {
        ctx.fillRect(this.IMAGE_WIDTH / 2 - this.IMAGE_WIDTH / 20 + x, y, this.IMAGE_WIDTH / 10, this.IMAGE_HEIGHT);
        ctx.fillRect(x, this.IMAGE_HEIGHT / 2 - this.IMAGE_HEIGHT / 20 + y, this.IMAGE_WIDTH, this.IMAGE_HEIGHT / 10);
    },
    drawTriangle(ctx, centerX, centerY, width, height) {
        ctx.moveTo(x, y);
        ctx.lineTo(x - width / 2, y + height / 2);
        ctx.lineTo(x + width / 2, y + height / 2);
        ctx.lineTo(x, y);
    },
    drawCircle(ctx, width, x = 0, y = 0) {
        const radius = width / 2; // Arc radius
        const startAngle = 0; // Starting point on circle
        const endAngle = 6.28;

        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();
    },
    drawSemiCircle(ctx, radius, x = 0, y = 0, startAngle = 0) {
        const endAngle = startAngle + Math.PI;

        ctx.arc(x, y, radius, startAngle, endAngle);
    },
    drawDiamond(ctx, centerX, centerY, width, height) {
        // top
        ctx.moveTo(centerX, centerY - height / 2);
        // right
        ctx.lineTo(centerX + width / 2, centerY);
        // bottom
        ctx.lineTo(centerX, centerY + height / 2);
        // left
        ctx.lineTo(centerX - width / 2, centerY);
        ctx.lineTo(centerX, centerY - height / 2);
    },
    drawButton(text) {
        const bx = utils.WIDTH / 2;
        const by = utils.HEIGHT / 2;
        const padding = 10;
        const textMeasurements = this.ctx.measureText(text);
        const buttonWidth = textMeasurements.width + (padding * 2);
        const buttonHeight = 30 + padding * 2;

        this.ctx.strokeRect(bx - buttonWidth / 2, by - (buttonHeight / 2), buttonWidth, buttonHeight);
        this.ctx.fillText(text, bx - textMeasurements.width / 2, by);
    },
    drawTitleText(text) {
        const bx = utils.WIDTH / 2;
        const textMeasurements = this.ctx.measureText(text);

        this.ctx.fillText(text, bx - textMeasurements.width / 2, utils.HEIGHT / 4);
    },
    draw(game) {
        this.ctx.strokeStyle = 'white';
        this.ctx.fillStyle = 'white';

        const { WIDTH, HEIGHT } = utils;
        const {gameObjects, isDebug, hudUpdated, state, score, GameState, player, bombAnimationTimer} = game;

        switch(state) {
            case GameState.PLAYING:
                this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

                this.resultsDrawn = false;
                this.gameOverDrawn = false;

                gameObjects.filter(gameObject => gameObject.isActive).forEach(gameObject => {
                const { x, y, width, height, type, currentFrame } = gameObject;

                if (this.ImageType[type]) {
                    const dX = this.IMAGE_WIDTH * currentFrame;
                    const dY = 0;

                    this.ctx.drawImage(
                        this.ImageType[type],
                        dX, dY, this.IMAGE_WIDTH, this.IMAGE_HEIGHT,
                        x, y, width, height
                    );
                }
            });

            if (player.isUsingBomb) {
                const bombWidth = (bombAnimationTimer.MAX_TIME - bombAnimationTimer.time) * 30;

                this.ctx.globalAlpha = 1 - (bombAnimationTimer.MAX_TIME - bombAnimationTimer.time) * 0.02;
                this.drawCircle(this.ctx, bombWidth, player.x, player.y);
                this.ctx.globalAlpha = 1;
            }

            break;

            case GameState.RESULTS:
                if (!this.resultsDrawn) {
                    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
                    const scoreSize = this.ctx.measureText(`score: ${score}`);
                    const btnText = this.ctx.measureText('next level');
                    const bx = utils.WIDTH / 2;
                    const by = utils.HEIGHT / 2;
                    this.drawTitleText('level complete');
                    this.ctx.fillText(`score: ${score}`, bx - scoreSize.width / 2, utils.HEIGHT / 3);
                    this.drawButton('next level', btnText, bx, by);
                }

                this.resultsDrawn = true;

                break;

            case GameState.GAME_OVER:
                if (!this.gameOverDrawn) {
                    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

                    this.drawTitleText('Game Over');
                    this.drawButton('next level');

                    this.gameOverDrawn = true;
                }

                break;
        }

        if (hudUpdated) {
            this.hudCtx.clearRect(0, 0, utils.WIDTH, utils.HUD_HEIGHT + 5 /* makes sure we clear whole area */);
            const shipRad = this.IMAGE_WIDTH / 2;
            const bombRad = this.IMAGE_WIDTH / 2;

            const drawY = this.IMAGE_HEIGHT - 5;
            let drawX = 0;

            for (let i = 0; i<player.lives; i++) {
                this.hudCtx.drawImage(this.ImageType[utils.GameObject.PLAYER], drawX, drawY - shipRad, shipRad, shipRad);
                drawX += shipRad;
            }

            for (let i=0; i<player.bombs; i++) {
                this.hudCtx.drawImage(this.ImageType[utils.GameObject.BOMB], drawX, drawY - this.IMAGE_HEIGHT / 1.5, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
                drawX += bombRad;
            }

            drawX += bombRad;
            this.hudCtx.fillText(`score: ${score}`, drawX, drawY);

        }

        if (isDebug) {
            const { $spawnEnemyTime, $keysToGet, spawnEnemyTimer, totalKeys, player } = game;
            $spawnEnemyTime.innerHTML = spawnEnemyTimer.time;
            $keysToGet.innerHTML = `${totalKeys - player.keys}`;
        }
    }
};
