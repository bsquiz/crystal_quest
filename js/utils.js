const utils = {
    WIDTH: 800,
    HEIGHT: 600,
    HUD_HEIGHT: 50,
    GameObject: {
        PLAYER: 0,
        KEY: 1,
        BULLET: 2,
        GOAL: 3,
        GATE_LEFT: 4,
        GATE_RIGHT: 5,
        OBSTACLE: 6,
        BONUS_CRYSTAL: 7,
        BUG: 8,
        BOMB: 9,
        POOF: 10,
        SHOOTER: 11,
        SPARKLE: 12,
        BLOB: 13,
        BALL: 14
    },
    GameObjectTotalFrames: {},
    Enemy: {
        BUG: 0,
        BLOB: 1
    },
    getMousePosition(e, $gameArea, playerWidth, playerHeight) {
        const {clientX, clientY} = e;
        const {offsetLeft, offsetTop} = $gameArea;

        return {
            x: clientX - offsetLeft - (playerWidth / 2),
            y: clientY - offsetTop  + (playerHeight / 2)
        };
    },
    isOutsideGameArea(gameObject, dx = 0, dy = 0) {
        const centerX = gameObject.x + gameObject.width / 2;
        const centerY = gameObject.y + gameObject.height / 2;

        return (centerX + dx > this.WIDTH || centerX + dx < 0 || centerY + dy > this.HEIGHT || centerY + dy < 0);
    },
    randomGamePosition() {
        // gives some padding around edges
        const x =
            Math.min(
                this.WIDTH - (this.WIDTH / 4),
                Math.max(this.WIDTH / 4, Math.random() * this.WIDTH)
            );
        const y =
            Math.min(
                this.HEIGHT - (this.HEIGHT / 4),
                Math.max(this.HEIGHT / 4, Math.random() * this.HEIGHT)
            );

        return {x, y};
    },
    hitTest(insideObject, containingObject) {
        const centerX = insideObject.x + insideObject.width / 2;
        const centerY = insideObject.y + insideObject.height / 2;

        return (
            (
                centerX > containingObject.x
                && centerX < containingObject.x + containingObject.width
            )
            &&
            (
                centerY > containingObject.y
                && centerY < containingObject.y + containingObject.height
            )
        );
    },
    rotationTowardsPoint(targetX, targetY, gameObjectX, gameObjectY) {
        return Math.atan2(targetY - gameObjectY, targetX - gameObjectX);
    },
    deltaPositionFromRotation(rotation, speed) {
        const xSpeed = speed * Math.cos(rotation);
        const ySpeed = speed * Math.sin(rotation);

        return { xSpeed, ySpeed };
    },
    randomRotation() {
        return Math.random() * 6.283;
    },
    randomDirection(speed) {
        const rotation = this.randomRotation();

        return { rotation, ...this.deltaPositionFromRotation(rotation, speed) };
    },
    createTimer(maxTime) {
        const timer = {
            time: 0,
            MAX_TIME: maxTime,
            update() {
                this.time--;

                return this.time > 0;
            },
            reset() {
                this.time = this.MAX_TIME;
            }
        };

        timer.reset();

        return timer;
    },
    createGameObject(options) {
        return {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            isActive: false,
            rotation: 0,
            speed: 0.5,
            isMoving: false,
            type: 0,
            currentFrame: 0,
            totalFrames: 1,
            hp: 1,
            ...options
        }
    },
};

utils.GameObjectTotalFrames[utils.GameObject.OBSTACLE] = 1;
utils.GameObjectTotalFrames[utils.GameObject.KEY] = 1;
utils.GameObjectTotalFrames[utils.GameObject.BOMB] = 1;
utils.GameObjectTotalFrames[utils.GameObject.BUG] = 2;
utils.GameObjectTotalFrames[utils.GameObject.BLOB] = 2;
utils.GameObjectTotalFrames[utils.GameObject.PLAYER] = 1;
utils.GameObjectTotalFrames[utils.GameObject.BONUS_CRYSTAL] = 16;
utils.GameObjectTotalFrames[utils.GameObject.BULLET] = 1;
utils.GameObjectTotalFrames[utils.GameObject.GATE_LEFT] = 1;
utils.GameObjectTotalFrames[utils.GameObject.GATE_RIGHT] = 1;
utils.GameObjectTotalFrames[utils.GameObject.GOAL] = 2;
utils.GameObjectTotalFrames[utils.GameObject.POOF] = 16;
utils.GameObjectTotalFrames[utils.GameObject.SHOOTER] = 2;
utils.GameObjectTotalFrames[utils.GameObject.SPARKLE] = 16;
