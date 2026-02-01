import { Player } from './Player';

export class Camera {
    public x: number = 0;
    public y: number = 0;

    constructor(
        private canvasWidth: number,
        private canvasHeight: number,
        private levelWidth: number,
        private levelHeight: number
    ) {}

    public follow(player: Player): void {
        // Center the camera on the player
        this.x = player.x + player.width / 2 - this.canvasWidth / 2;
        this.y = player.y + player.height / 2 - this.canvasHeight / 2;

        // Clamp camera to level bounds
        this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.canvasWidth));
        this.y = Math.max(0, Math.min(this.y, this.levelHeight - this.canvasHeight));
    }

    public apply(ctx: CanvasRenderingContext2D): void {
        ctx.translate(-this.x, -this.y);
    }

    public reset(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}