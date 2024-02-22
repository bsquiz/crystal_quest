const CrystalQuest = {
    isDebug: true,
    hudUpdated: true,

    GameState: {
        PLAYING: 0,
        RESULTS: 1,
        GAME_OVER: 2,
        MENU: 3
    },
    state: 3,
    player: {},
    bullets: [],
    enemies: [],
    bonuses: [],
    bonusCrystals: [],
    gameObjects: [],
    keys: [],
    obstacles: [],
    goal: {},
    spawnGates: [],
    bombPickups: [],
    poofs: [],
    sparkles: [],

    levels: [
        {
            enemyTypes: [0],
            obstacles: 1,
            keys: 10,
            enemySpawnTime: 570
        },
        {
            enemyTypes: [0, 1],
            obstacles: 2,
            keys: 15,
            enemySpawnTime: 500
        },
        {
            enemyTypes: [0, 1],
            obstacles: 4,
            keys: 20,
            enemySpawnTime: 450
        },
        {
            enemyTypes: [0, 1],
            obstacles: 5,
            keys: 25,
            enemySpawnTime: 400
        },
        {
            enemyTypes: [0, 1],
            obstacles: 5,
            keys: 25,
            enemySpawnTime: 350
        },
        {
            enemyTypes: [0, 1],
            obstacles: 5,
            keys: 25,
            enemySpawnTime: 300
        },
        {
            enemyTypes: [0, 1],
            obstacles: 5,
            keys: 25,
            enemySpawnTime: 250
        },
    ],
    currentLevel: 0,

    score: 0,
    totalKeys: 1,
    spawnEnemyTimer: 0,
    MAX_SPAWN_ENEMY_TIME: 100,
    crystalSpawnTimer: {},
    MAX_CRYSTAL_SPAWN_TIMER: 1000,
    bombAnimationTimer: {},
    MAX_BOMB_ANIMATION_TIMER: 30,
    $spawnEnemyTime: document.querySelector('#spawnEnemyTime'),
    $keysToGet: document.querySelector('#keysToGet'),

    createGoal() {
        const goalSectionWidth = 30;
        const goalSectionHeight = 10;
        const goalY = utils.HEIGHT - utils.HEIGHT / 40;

        return utils.createGameObject({
            x: utils.WIDTH / 2 - (utils.WIDTH / 10) / 2,
            y: goalY,
            isOpen: false,
            isActive: true,
            width: utils.WIDTH / 10,
            height: utils.HEIGHT / 20,
            type: utils.GameObject.GOAL,
            closedAreaLeft: {
                x: utils.WIDTH / 2 - goalSectionWidth * 1.5,
                y: goalY,
                width: goalSectionWidth,
                height: goalSectionHeight
            },
            closedAreaRight: {
                x: utils.WIDTH / 2 + goalSectionWidth / 2,
                y: goalY,
                width: goalSectionWidth,
                height: goalSectionHeight
            },
            openArea: {
                x: utils.WIDTH / 2 - goalSectionWidth / 2,
                y: goalY,
                width: goalSectionWidth,
                height: goalSectionHeight
            },
            totalFrames: 2
        });
    },
    initLevel(level) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        this.isDebug = true; //urlParams.get('debug') === 'true';
        if (this.isDebug) {
            document.querySelector('#debug').classList.remove('d-none');
        }

        this.obstacles = this.factory.createObstacles(level.obstacles);
        this.enemies = this.factory.createEnemies(level.enemyTypes);
        this.keys = this.factory.createKeys(this.obstacles, level.keys);
        this.spawnGates = this.factory.createGates();
        this.bullets = this.factory.createBullets();
        this.bonusCrystals = this.factory.createBonuses();
        this.bombPickups = this.factory.createPickups();
        this.poofs = this.factory.createPoofs();
        this.sparkles = this.factory.createSparkles();
        this.totalKeys = level.keys;

        this.player.keys = 0;
        this.player.x = utils.WIDTH / 2;
        this.player.y = utils.HEIGHT / 2;
        this.goal = this.createGoal();

        this.MAX_SPAWN_ENEMY_TIME = level.enemySpawnTime;
        this.spawnEnemyTimer = utils.createTimer(this.MAX_SPAWN_ENEMY_TIME);
        this.crystalSpawnTimer = utils.createTimer(this.MAX_CRYSTAL_SPAWN_TIMER);
        this.bombAnimationTimer = utils.createTimer(this.MAX_BOMB_ANIMATION_TIMER);

        this.gameObjects = [this.player, ...this.poofs, ...this.sparkles,
            ...this.bombPickups, ...this.bonusCrystals, ...this.obstacles, ...this.keys,
            ...this.bullets, ...this.spawnGates, ...this.enemies, this.goal];
        this.state = this.GameState.PLAYING;
    },
    init() {
        const pw = utils.WIDTH / 40;

        this.currentLevel = 0;
        this.score = 0;

        this.player = utils.createGameObject({
            x: utils.WIDTH / 2,
            y: utils.HEIGHT / 2,
            width: pw,
            height: pw,
            speed: 3,
            rotation: 0,
            moveTarget: { x: 0, y: 0 },
            isActive: true,
            lives: 3,
            keys: 0,
            bombs: 3,
            type: utils.GameObject.PLAYER,
            isUsingBomb: false
        });

        this.initLevel(this.levels[0]);

        document.addEventListener('mousemove', (e) => {
            const { x, y } = utils.getMousePosition(e, graphics.$canvas, graphics.IMAGE_WIDTH, graphics.IMAGE_HEIGHT);
            CrystalQuest.rotatePlayer(x, y);
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                CrystalQuest.useBomb();
            }
        });
        document.addEventListener('click', (e) => {
            if (CrystalQuest.state === CrystalQuest.GameState.PLAYING) {
                CrystalQuest.shootBullet();
            } else if (CrystalQuest.state === CrystalQuest.GameState.RESULTS) {
                if (utils.hitTest({
                    x: e.clientX,
                    y: e.clientY,
                    width: 1,
                    height: 1
                },{
                    x: utils.WIDTH / 2 - 50,
                    y: utils.HEIGHT / 2 - 25,
                    width: utils.WIDTH / 2 + 50,
                    height: utils.HEIGHT / 2 + 25
                })) {
                    CrystalQuest.nextLevel();
                }
            } else if (CrystalQuest.state === CrystalQuest.GameState.GAME_OVER) {
                if (utils.hitTest({
                    x: e.clientX,
                    y: e.clientY,
                    width: 1,
                    height: 1
                },{
                    x: utils.WIDTH / 2 - 50,
                    y: utils.HEIGHT / 2 - 25,
                    width: utils.WIDTH / 2 + 50,
                    height: utils.HEIGHT / 2 + 25
                })) {
                    CrystalQuest.init();
                    CrystalQuest.state = CrystalQuest.GameState.PLAYING;
                }
            }
        });
    },
    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel += 1;
        }

        this.initLevel(this.levels[this.currentLevel]);
        this.state = this.GameState.PLAYING;
    },
    spawnEnemy() {
        for (let i=0; i<this.enemies.length; i++) {
            const enemy = this.enemies[i];

            if (!enemy.isActive) {
                const side = Math.floor(Math.random() * 2);

                enemy.isActive = true;
                enemy.x = side * utils.WIDTH;
                enemy.y = utils.HEIGHT / 2;
                enemy.xSpeed = 1;

                break;
            }
        }
    },
    spawnSparkle(x, y) {
        this.sparkles.filter(sparkle => !sparkle.isActive).forEach(sparkle => {
            sparkle.x = x;
            sparkle.y = y;
            sparkle.isActive = true;
            sparkle.frameTimer.reset();
        });
    },
    spawnBonusCrystal() {
        for (let i=0; i<this.bonusCrystals.length; i++) {
            const crystal = this.bonusCrystals[i];

            if (!crystal.isActive) {
                const side = Math.floor(Math.random() * 2);

                crystal.isActive = true;
                crystal.x = side * utils.WIDTH;
                crystal.y = utils.HEIGHT / 2;
                crystal.rotation = (Math.random() * Math.PI) - Math.PI / 4 - Math.PI * side;

                const { xSpeed, ySpeed } = utils.deltaPositionFromRotation(crystal.rotation, crystal.speed);
                crystal.xSpeed = xSpeed;
                crystal.ySpeed = ySpeed;

                break;
            }
        }
    },
    shootBullet() {
        for (let i=0; i<this.bullets.length; i++) {
            const bullet = this.bullets[i];

            if (!bullet.isActive) {
                bullet.isActive = true;

                bullet.x = this.player.x;
                bullet.y = this.player.y;
                const { xSpeed, ySpeed } = utils.deltaPositionFromRotation(this.player.rotation, this.player.speed);
                // bullets faster than player
                bullet.xSpeed = xSpeed * 2;
                bullet.ySpeed = ySpeed * 2;
                break;
            }
        }
    },
    useBomb() {
        if (this.player.bombs > 0 && !this.player.isUsingBomb) {
            this.player.isUsingBomb = true;
            this.hudUpdated = true;
            this.player.bombs -= 1;
            this.bombAnimationTimer.reset();
            this.enemies.filter(enemy => enemy.isActive).forEach(enemy => {
                this.destroyEnemy(enemy);
            });
            this.bonusCrystals.filter(bonus => bonus.isActive).forEach(bonus => {
                this.destroyBonusCrystal(bonus);
            });
        }
    },
    destroyEnemy(enemy) {
        enemy.isActive = false;
        this.score += enemy.points;
        this.hudUpdated = true;
    },
    destroyBonusCrystal(bonus) {
        bonus.isActive = false;
    },
    makePoof(x, y) {
        const available = this.poofs.find(poof => !poof.isActive);

        if (available) {
            available.isActive = true;
            available.x = x;
            available.y = y;
        }
    },
    rotatePlayer(x, y) {
        this.player.moveTarget.x = x;
        this.player.moveTarget.y = y;

        this.player.rotation = utils.rotationTowardsPoint(x, y, this.player.x, this.player.y);
    },
    playerTakeHit() {
        this.makePoof(this.player.x, this.player.y);
        this.player.lives -= 1;
      this.player.x = utils.WIDTH / 2;
      this.player.y = utils.HEIGHT / 2;
      this.hudUpdated = true;
    },
    updatePlayer() {
        const centerX = this.player.x;
        const centerY = this.player.y;

        if (
            Math.abs(this.player.moveTarget.x - centerX) < 10
            && Math.abs(this.player.moveTarget.y - centerY) < 10
        ) {
            return;
        }

        const dx = this.player.speed * Math.cos(this.player.rotation);
        const dy = this.player.speed * Math.sin(this.player.rotation);

        if (utils.isOutsideGameArea(this.player, dx, dy)) {
            return;
        }

        this.player.x += dx;
        this.player.y += dy;

        if (this.goal.isOpen) {
            if (utils.hitTest(this.player, this.goal.openArea)) {
                this.state = this.GameState.RESULTS;
            } else if (
                utils.hitTest(this.player, this.goal.closedAreaLeft)
                || utils.hitTest(this.player, this.goal.closedAreaRight)) {
                this.playerTakeHit();
            }
        } else if (utils.hitTest(this.player, this.goal)) {
            this.playerTakeHit();
        }


        this.keys.filter(key => key.isActive).forEach(key => {
            if (utils.hitTest(key, this.player)) {
                key.isActive = false;
                this.player.keys += 1;
                this.score += key.points;
                this.hudUpdated = true;
               // this.spawnSparkle(key.x - key.width / 2, key.y - key.height / 2);
                if (this.player.keys === this.totalKeys) {
                    // open goal
                    this.goal.isOpen = true;
                    this.goal.currentFrame = 1;
                }
            }
        });

        this.bonusCrystals.filter(bonus => bonus.isActive).forEach(bonus => {
            if (utils.hitTest(this.player, bonus)) {
                this.hudUpdated = true;
                this.score += bonus.points;
                bonus.isActive = false;
                this.spawnSparkle(bonus.x - bonus.width / 2, bonus.y - bonus.height / 2);
            }
        });

        this.obstacles.filter(obstacle => obstacle.isActive).forEach(obstacle => {
            if (utils.hitTest(this.player, obstacle)) {
                this.playerTakeHit();
            }
        });

        this.bombPickups.filter(bomb => bomb.isActive).forEach(bomb => {
            if (utils.hitTest(this.player, bomb)) {
                bomb.isActive = false;
                this.player.bombs++;
            }
        });

        this.spawnGates.forEach(gate => {
            if (utils.hitTest(this.player, gate)) {
                this.playerTakeHit();
            }
        });

        if (this.player.lives <= 0) {
            this.state = this.GameState.GAME_OVER;
        }
        },
    updateBonuses() {
        this.bonusCrystals.filter(bonus => bonus.isActive).forEach(bonus => {
            if (utils.isOutsideGameArea(bonus, bonus.xSpeed, bonus.ySpeed)) {
                if (bonus.x + bonus.xSpeed > utils.WIDTH || bonus.x + bonus.xSpeed < 0) {
                    // reflect from 90 surface
                    bonus.xSpeed *= -1;
                } else if (bonus.y + bonus.ySpeed > utils.HEIGHT || bonus.y + bonus.ySpeed < 0) {
                    // reflect from 180 surface
                    bonus.ySpeed *= -1;
                }
            }

            bonus.x += bonus.xSpeed;
            bonus.y += bonus.ySpeed;

            if (!bonus.frameTimer.update()) {
                bonus.frameTimer.reset();
                bonus.currentFrame++;
                if (bonus.currentFrame > bonus.totalFrames - 1) {
                    bonus.currentFrame = 0;
                }
            }
        });
    },
    updateEnemies() {
        this.enemies.filter(enemy => enemy.isActive).forEach(enemy => {
            const { targetArea, speed } = enemy;

            if (!enemy.attacking && !enemy.attackTimer.update()) {
                enemy.attackTimer.reset();
                enemy.attacking = true;
                enemy.currentFrame = 1;

                // track player
                enemy.rotation = utils.rotationTowardsPoint(this.player.x, this.player.y, enemy.x, enemy.y);
                const { xSpeed, ySpeed } = utils.deltaPositionFromRotation(enemy.rotation, speed);
                enemy.xSpeed = xSpeed;
                enemy.ySpeed = ySpeed;
            }

            if (enemy.attacking && !enemy.attackingTimer.update()) {
                enemy.attackingTimer.reset();
                enemy.attacking = false;
                enemy.currentFrame = 0;
            }

            if (enemy.attacking) {

            } else if(utils.hitTest(enemy, enemy.targetArea)) {
                const changeDir = Math.floor(Math.random() * 20);

                if (changeDir === 0) {
                    const { rotation, xSpeed, ySpeed } = utils.randomDirection(enemy.speed);

                    enemy.rotation = rotation;
                    enemy.xSpeed = xSpeed;
                    enemy.ySpeed = ySpeed;
                    enemy.isMovingTowardsTargetArea = false;
                }
            } else {
                if (!enemy.isMovingTowardsTargetArea) {
                    const { x, y } = targetArea;
                    const rotation = utils.rotationTowardsPoint(x, y, enemy.x, enemy.y);
                    const { xSpeed, ySpeed } = utils.deltaPositionFromRotation(rotation, speed);
                    enemy.rotation = rotation;
                    enemy.xSpeed = xSpeed;
                    enemy.ySpeed = ySpeed;
                    enemy.isMovingTowardsTargetArea = true;
                }
            }

            enemy.x += enemy.xSpeed;
            enemy.y += enemy.ySpeed;

            if (utils.hitTest(this.player, enemy)) {
                this.playerTakeHit();
            }
        });
    },
    updateBullets() {
        this.bullets.filter(bullet => bullet.isActive).forEach(bullet => {
            bullet.x += bullet.xSpeed;
            bullet.y += bullet.ySpeed;

            if (utils.isOutsideGameArea(bullet)) {
                bullet.isActive = false;
            }

            this.bonusCrystals.filter(bonus => bonus.isActive).forEach(bonus => {
                if (utils.hitTest(bullet, bonus)) {
                    bullet.isActive = false;
                    this.destroyBonusCrystal(bonus);
                    this.makePoof(bonus.x, bonus.y);
                }
            });

            this.enemies.filter(enemy => enemy.isActive).forEach(enemy => {
                if (utils.hitTest(bullet, enemy)) {
                    bullet.isActive = false;
                    enemy.hp -= 1;

                    if (enemy.hp === 0) {
                        this.destroyEnemy(enemy);
                        this.makePoof(enemy.x, enemy.y);
                    }
                }
            });
        });
    },
    updatePoofs() {
        this.poofs.filter(poof => poof.isActive).forEach(poof => {
            if (!poof.frameTimer.update()) {
                poof.frameTimer.reset();
                poof.currentFrame++;
                if (poof.currentFrame > poof.totalFrames) {
                    poof.currentFrame = 0;
                    poof.isActive = false;
                }
            }
        });
        },
    updateSparkles() {
        this.sparkles.filter(sparkle => sparkle.isActive).forEach(sparkle => {
            if (!sparkle.frameTimer.update()) {
                sparkle.frameTimer.reset();
                sparkle.currentFrame++;
                if (sparkle.currentFrame > sparkle.totalFrames) {
                    sparkle.currentFrame = 0;
                    sparkle.isActive = false;
                }
            }
        });
    },
    update() {
        switch(this.state) {
            case this.GameState.MENU:

                break;
            case this.GameState.PLAYING:
                if (!this.spawnEnemyTimer.update()) {
                    this.spawnEnemyTimer.reset();
                    this.spawnEnemy();
                }

                if (!this.crystalSpawnTimer.update()) {
                    this.crystalSpawnTimer.reset();
                    this.spawnBonusCrystal();
                }

                if (this.player.isUsingBomb && !this.bombAnimationTimer.update()) {
                    this.player.isUsingBomb = false;
                }

                this.updatePlayer();
                this.updateEnemies();
                this.updateBullets();
                this.updateBonuses();
                this.updatePoofs();
                this.updateSparkles();

                break;

            case this.GameState.RESULTS:

                break;

            case this.GameState.GAME_OVER:
                break;
        }


        graphics.draw(this);
        this.hudUpdated = false;

        window.requestAnimationFrame(() => {
            CrystalQuest.update();
        });
    }
};
