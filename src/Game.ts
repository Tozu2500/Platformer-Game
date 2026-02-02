import { Player } from './Player';
import { Enemy, EnemyType } from './Enemy';
import { TileMap } from './TileMap';
import { Level } from './Level';
import { Input } from './Input';
import { Camera } from './Camera';
import { Physics } from './Physics';
import { TileType } from './types';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private enemies: Enemy[] = [];
    private tileMap: TileMap;
    private input: Input;
    private camera: Camera;
    private score: number = 0;
    private currentLevel: number = 1;
    private isPaused: boolean = false;
    private gameOver: boolean = false;
    private levelComplete: boolean = false;
    private collectedCoins: Set<string> = new Set();

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.input = new Input();

        const levelData = Level.getLevelData(this.currentLevel);
        this.tileMap = new TileMap(levelData.tiles);
        this.player = new Player(levelData.playerStart.x, levelData.playerStart.y);

        this.camera = new Camera(
            this.canvas.width,
            this.canvas.height,
            this.tileMap.width * TileMap.TILE_SIZE,
            this.tileMap.height * TileMap.TILE_SIZE
        );

        this.spawnEnemies(levelData.enemySpawns);
        this.setupUI();
        this.gameLoop();
    }

    private spawnEnemies(spawns: { x: number; y: number }[]): void {
        this.enemies = [];
        spawns.forEach((spawn, index) => {
            const type = index % 2 === 0 ? EnemyType.GOOMBA : EnemyType.KOOPA;
            this.enemies.push(new Enemy(spawn.x, spawn.y, type));
        });
    }

    private setupUI(): void {
        const restartBtn = document.getElementById("restart-btn");
        const nextLevelBtn = document.getElementById("next-level-btn");

        restartBtn?.addEventListener('click', () => this.restart());
        nextLevelBtn?.addEventListener('click', () => this.nextLevel());
    }

    private gameLoop = (): void => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    };

    private update(): void {
        if (this.gameOver || this.levelComplete) return;

        // Pause handling
        if (this.input.isKeyJustPressed('KeyP')) {
            this.isPaused = !this.isPaused;
        }

        if (this.isPaused) {
            this.input.update();
            return;
        }

        // Player updating
        this.player.update(this.input);
        this.handlePlayerCollisions();

        // Enemy updating
        this.enemies.forEach(enemy => {
            enemy.update();
            this.handleEnemyCollisions(enemy);
        });

        // Update camera
        this.camera.follow(this.player);

        // Check win condition
        this.checkLevelComplete();

        // Check game over
        if (this.player.lives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        }

        // Check if player fell off the map
        if (this.player.y > this.tileMap.height * TileMap.TILE_SIZE) {
            this.player.takeDamage();
            const levelData = Level.getLevelData(this.currentLevel);
            this.player.x = levelData.playerStart.x;
            this.player.y = levelData.playerStart.y;
            this.player.velocity = { x: 0, y: 0 };
        }

        this.input.update();
        this.updateUI();
    }

    private handlePlayerCollisions(): void {
        this.player.onGround = false;

        const tiles = this.tileMap.getSurroundingTiles(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        tiles.forEach(tile => {
            if (tile.type === TileType.COIN) {
                const key = `${tile.x},${tile.y}`;
                if (!this.collectedCoins.has(key)) {
                    this.collectedCoins.add(key);
                    this.score += 100;
                    // Removing a coin from the tilemap
                    const mapTile = this.tileMap.getTileAt(tile.x, tile.y);
                    if (mapTile) mapTile.type = TileType.AIR;
                }
                return;
            }

            if (tile.type === TileType.SPIKE) {
                if (Physics.checkCollision(this.player, {
                    x: tile.x,
                    y: tile.y,
                    width: TileMap.TILE_SIZE,
                    height: TileMap.TILE_SIZE
                })) {
                    this.player.takeDamage();
                }
                return;
            }

            if (tile.type === TileType.FLAG) {
                if (Physics.checkCollision(this.player, {
                    x: tile.x,
                    y: tile.y,
                    width: TileMap.TILE_SIZE,
                    height: TileMap.TILE_SIZE
                })) {
                    this.levelComplete = true;
                    this.showLevelComplete();
                }
                return;
            }

            // Collision for the solid tiles
            if (tile.type === TileType.GROUND || tile.type === TileType.BRICK || tile.type === TileType.PLATFORM) {
                const tileBox = {
                    x: tile.x,
                    y: tile.y,
                    width: TileMap.TILE_SIZE,
                    height: tile.type === TileType.PLATFORM ? 8 : TileMap.TILE_SIZE
                };

                if (Physics.checkCollision(this.player, tileBox)) {
                    // Determine the side of collision
                    const playerBottom = this.player.y + this.player.height;
                    const playerRight = this.player.x + this.player.width;
                    const tileBottom = tileBox.y + tileBox.height;
                    const tileRight = tileBox.x + tileBox.width;

                    const bottomCollision = playerBottom - tileBox.y;
                    const topCollision = tileBottom - this.player.y;
                    const leftCollision = playerRight - tileBox.x;
                    const rightCollision = tileRight - this.player.x;

                    const minCollision = Math.min(bottomCollision, topCollision, leftCollision, rightCollision);

                    if (minCollision === bottomCollision && this.player.velocity.y > 0) {
                        this.player.y = tileBox.y - this.player.height;
                        this.player.velocity.y = 0;
                        this.player.onGround = true;
                    } else if (minCollision === topCollision && this.player.velocity.y < 0) {
                        this.player.y = tileBottom;
                        this.player.velocity.y = 0;
                    } else if (minCollision === leftCollision) {
                        this.player.x = tileBox.x - this.player.width;
                        this.player.velocity.x = 0;
                    } else if (minCollision === rightCollision) {
                        this.player.x = tileRight;
                        this.player.velocity.x = 0;
                    }
                }
            }
        });

        // Enemy collisions
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;

            if (Physics.checkCollision(this.player, enemy)) {
                // Check if the player is jumping on the enemy
                if (this.player.velocity.y > 0 && this.player.y + this.player.height - 10 < enemy.y) {
                    enemy.stomp();
                    this.player.velocity.y = -8;
                    this.score += 200;
                } else {
                    this.player.takeDamage();
                }
            }
        });
    }

    private handleEnemyCollisions(enemy: Enemy): void {
        if (!enemy.active) return;

        enemy.onGround = false;

        const tiles = this.tileMap.getSurroundingTiles(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );

        tiles.forEach(tile => {
            if (tile.type === TileType.GROUND || tile.type === TileType.BRICK) {
                const tileBox = {
                    x: tile.x,
                    y: tile.y,
                    width: TileMap.TILE_SIZE,
                    height: TileMap.TILE_SIZE
                };

                if (Physics.checkCollision(enemy, tileBox)) {
                    const enemyBottom = enemy.y + enemy.height;
                    const enemyRight = enemy.x + enemy.width;
                    const tileBottom = tileBox.y + tileBox.height;
                    const tileRight = tileBox.x + tileBox.width;

                    const bottomCollision = enemyBottom - tileBox.y;
                    const topCollision = tileBottom - enemy.y;
                    const leftCollision = enemyRight - tileBox.x;
                    const rightCollision = tileRight - enemy.x;

                    const minCollision = Math.min(bottomCollision, topCollision, leftCollision, rightCollision);

                    if (minCollision === bottomCollision && enemy.velocity.x > 0) {
                        enemy.y = tileBox.y - enemy.height;
                        enemy.velocity.y = 0;
                        enemy.onGround = true;
                    } else if (minCollision === leftCollision || minCollision === rightCollision) {
                        enemy.reverseDirection();
                    }
                }
            }
        });
    }

    private checkLevelComplete(): void {
        const levelData = Level.getLevelData(this.currentLevel);
        const goalDistance = Math.abs(this.player.x - levelData.levelGoal.x);

        if (goalDistance < 50 && !this.levelComplete) {
            this.levelComplete = true;
            this.showLevelComplete();
        }
    }

    private draw(): void {
        // clear the canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera transform
        this.ctx.save();
        this.camera.apply(this.ctx);

        // Drawing tilemap
        this.tileMap.draw(this.ctx);

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw player
        this.player.draw(this.ctx);

        // Reset camera transform
        this.ctx.restore();

        // Draw pause text
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    private updateUI(): void {
        document.getElementById('score')!.textContent = `Score: ${this.score}`;
        document.getElementById('lives')!.textContent = `Lives ${this.player.lives}`;
        document.getElementById('level')!.textContent = `Level: ${this.currentLevel}`;
    }

    private showGameOver(): void {
        document.getElementById('final-score')!.textContent = this.score.toString();
        document.getElementById('game-over')!.classList.remove('hidden');
    }

    private showLevelComplete(): void {
        document.getElementById('level-score')!.textContent = this.score.toString();
        document.getElementById('level-complete')!.classList.remove('hidden');
    }

    private restart(): void {
        this.score = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.levelComplete = false;
        this.collectedCoins.clear();
        document.getElementById("game-over")!.classList.add('hidden');
        this.loadLevel(this.currentLevel);
    }

    private nextLevel(): void {
        this.currentLevel++;
        this.levelComplete = false;
        document.getElementById("level-complete")!.classList.add("hidden");

        if (this.currentLevel > 3) {
            this.currentLevel = 1;
        }

        this.loadLevel(this.currentLevel);
    }
}