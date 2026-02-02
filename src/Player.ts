import { GameObject, Velocity } from './types.js';
import { Physics } from './Physics.js';
import { Input } from './Input.js'

export class Player implements GameObject {
    public x: number;
    public y: number;
    public width: number = 32;
    public height: number = 32;
    public velocity: Velocity = { x: 0, y: 0 };
    public onGround: boolean = false;
    public lives: number = 3;
    public invincible: boolean = false;
    private invincibleTimer: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public update(input: Input): void {
        // Handle horizontal movements
        if (input.isKeyPressed('ArrowLeft')) {
            this.velocity.x = -Physics.MOVE_SPEED;
        } else if (input.isKeyPressed('ArrowRight')) {
            this.velocity.x = Physics.MOVE_SPEED;
        } else {
            Physics.applyFriction(this.velocity);
        }

        // handle jumping
        if (input.isKeyJustPressed('Space') && this.onGround) {
            this.velocity.y = Physics.JUMP_FORCE;
            this.onGround = false;
        }

        // Apply gravity
        Physics.applyGravity(this);

        // Pos update
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    public takeDamage(): void {
        if (!this.invincible) {
            this.lives--;
            this.invincible = true;
            this.invincibleTimer = 120;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibleTimer / 10) % 2 === 0) {
            return;
        }

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw face
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x + 8, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 18, this.y + 8, 6, 6);

        // Draw smile
        ctx.fillRect(this.x + 8, this.y + 20, 16, 4);
    }
}