CrystalQuest.factory = {
    MAX_ENEMIES: 20,

    createSparkles() {
        const sparkles = [];

        for (let i=0; i<10; i++) {
            const s = utils.createGameObject({
                frameTimer: utils.createTimer(2),
                totalFrames: utils.GameObjectTotalFrames[utils.GameObject.SPARKLE],
                type: utils.GameObject.SPARKLE,
                width: utils.WIDTH / 25,
                height: utils.WIDTH / 25
            });

            sparkles.push(s);
        }

        return sparkles;
    },
    createEnemies(enemyTypes = [0, 1]) {
        const enemies = [];

        for (let i=0; i<this.MAX_ENEMIES; i++) {
            let type;
            let hp = 1;
            let ew = utils.WIDTH / 40;
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            if (enemyType === 0) {
                type = utils.GameObject.BUG;
            } else {
                type = utils.GameObject.BLOB;
            }

            if (type === utils.GameObject.BLOB) {
                ew = utils.WIDTH / 20;
                hp = 10;
            }

            const enemy = utils.createGameObject
            (
                {
                    xSpeed: 0, ySpeed: 0, x: utils.WIDTH / 2, y: utils.HEIGHT / 2,
                    targetArea: {
                        x: utils.WIDTH / 5,
                        y: utils.HEIGHT / 5,
                        width: utils.WIDTH - utils.WIDTH / 5,
                        height: utils.HEIGHT - utils.HEIGHT / 5,
                    },
                    type,
                    width: ew, height: ew,
                    enemyType,
                    isMovingTowardsTargetArea: false,
                    points: 50,
                    attacking: false,
                    attackTimer: utils.createTimer(100),
                    attackingTimer: utils.createTimer(100),
                    hp
                }
            )
            enemies.push(enemy);
        }

        return enemies;
    },
    createGates() {
        const gateWidth = utils.WIDTH / 20;
        const gateHeight = utils.HEIGHT / 10;
        const gameCenterY = utils.HEIGHT / 2 - gateHeight / 2;

        const spawnGates = [
            utils.createGameObject({
                x: 0, y: gameCenterY,
                width: gateWidth, height: gateHeight,
                isActive: true,
                type: utils.GameObject.GATE_LEFT
            }),
            utils.createGameObject({
                x: utils.WIDTH - gateWidth, y: gameCenterY,
                width: gateWidth, height: gateHeight,
                isActive: true,
                type: utils.GameObject.GATE_RIGHT
            })
        ];

        return spawnGates;
    },
    createPoofs() {
        const poofs = [];

        for (let i=0; i<10; i++) {
            const poof = utils.createGameObject({
                type: utils.GameObject.POOF,
                isActive: false,
                x: 0,
                y: 0,
                width: utils.WIDTH / 20,
                height: utils.WIDTH / 20,
                frameTimer: utils.createTimer(5),
                totalFrames: utils.GameObjectTotalFrames[utils.GameObject.POOF]
            });

            poofs.push(poof);
        }

        return poofs;
    },
    createBullets() {
        const bullets = [];

        for (let i=0; i<10; i++) {
            const bullet = utils.createGameObject({
                xSpeed: 0, ySpeed: 0, width: utils.WIDTH / 200, height: utils.WIDTH / 200,
                type: utils.GameObject.BULLET

            });
            bullets.push(bullet);
        }

        return bullets;
    },
    createKeys(obstacles, levelKeys = 1) {
        const keys = [];

        const obs = obstacles.filter(ob => ob.isActive);

        for(let i=0; i<levelKeys; i++) {
            let gx = 0;
            let gy = 0;
            let goodPosition = false;
            let tests = 0;

            // dont put on top of obstacle
            while (!goodPosition) {
                let {x, y} = utils.randomGamePosition();
                gx = x;
                gy = y;
                goodPosition = true;

                for (let i=0; i<obs.length; i++) {
                    if (utils.hitTest({x, y, width: 1, height: 1}, obs[i])) {
                        goodPosition = false;
                        break;
                    }
                }

                tests++;
                if (tests > 100) {
                    // give up
                    gx = utils.WIDTH / 2;
                    gy = utils.HEIGHT / 2;
                    goodPosition = true;
                }
            }

            const key = utils.createGameObject({
                x: gx,
                y: gy,
                width: utils.WIDTH / 50, height: utils.WIDTH / 50,
                isActive: true,
                points: 10,
                type: utils.GameObject.KEY
            });

            keys.push(key);
        }

        return keys;
    },
    createObstacles(numObs = 0) {
        const ow = utils.WIDTH / 30;
        const obstacles = [];

        for (let i=0; i <numObs; i++) {

            let x = Math.min(
                Math.max(Math.random() * utils.WIDTH, utils.WIDTH / 10),
                utils.WIDTH - utils.WIDTH / 10
            );
            let y = Math.min(
                Math.max(Math.random() * utils.HEIGHT, utils.HEIGHT / 10),
                utils.HEIGHT - utils.HEIGHT / 10
            );

            let count = 0;

            // keeps obstacles from screen center
            while (utils.hitTest({x, y, width: ow, height: ow}, {
                x: utils.WIDTH / 2 - utils.WIDTH / 6,
                y: utils.HEIGHT / 2 - utils.HEIGHT / 6,
                width: utils.WIDTH / 2 + utils.WIDTH / 6,
                height: utils.HEIGHT / 2 + utils.HEIGHT / 6,
            })) {
                x = Math.min(
                    Math.max(Math.random() * utils.WIDTH, utils.WIDTH / 10),
                    utils.WIDTH - utils.WIDTH / 10
                );
                y = Math.min(
                    Math.max(Math.random() * utils.HEIGHT, utils.HEIGHT / 10),
                    utils.HEIGHT - utils.HEIGHT / 10
                );

                count++;
                // keeps too many iterations from happening
                if (count > 30) {
                    x = 0;
                    y = 0;
                    break;
                }
            }

            const ob = utils.createGameObject({
                x,
                y,
                width: ow,
                height: ow,
                type: utils.GameObject.OBSTACLE,
                isActive: true
            });

            obstacles.push(ob);
        }

        return obstacles;
    },
    createBonuses() {
        const bw = utils.WIDTH / 25;

        const bonusCrystals = [];

        for (let i=0; i<2; i++) {
            const crystal = utils.createGameObject({
                x: 100,
                y: 100,
                width: bw,
                height: bw,
                speed: 2,
                xSpeed: 1,
                ySpeed: 1,
                rotation: 2,
                isActive: false,
                points: 1000,
                type: utils.GameObject.BONUS_CRYSTAL,
                totalFrames: utils.GameObjectTotalFrames[utils.GameObject.BONUS_CRYSTAL],
                frameTimer: utils.createTimer(10)
            });

            bonusCrystals.push(crystal);
        }

        return bonusCrystals;
    },
    createPickups() {
        const bombPickups = [];

        for (let i=0; i<2; i++) {
            const { x, y } = utils.randomGamePosition();

            const bomb = utils.createGameObject({
                type: utils.GameObject.BOMB,
                x,
                y,
                width: utils.WIDTH / 30,
                height: utils.WIDTH / 30,
                isActive: true
            });

            bombPickups.push(bomb);
        }

        return bombPickups;
    },
}
