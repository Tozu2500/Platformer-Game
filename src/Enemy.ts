import { GameObject, Velocity } from './types';
import { Physics } from './Physics';

export enum EnemyType {
    GOOMBA,
    KOOPA
}

export class Enemy implements GameObject {
    public x: number;
    public y: number;
    public width: number = 28;
    public height: number = 28;
    public velocity: Velocity = { x: -1.5, y: 0 };
    public onGround: boolean = false;
    public active: boolean = true;
    private type: EnemyType;

    constructor(x: number, y: number, type: EnemyType = EnemyType.GOOMBA) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public update(): void {
        if (!this.active) return;

        // Simple AI; moving back and forth
        Physics.applyGravity(this);

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    public reverseDirection(): void {
        this.velocity.x *= -1;
    }

    public stomp(): void {
        this.active = false;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        if (this.type === EnemyType.GOOMBA) {
            // Draw goomba
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 6, this.y + 8, 6, 6);
            ctx.fillRect(this.x + 18, this.y + 10, 3, 3);
        } else {
            // Draw koopa
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Shell
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
        }
    }
}