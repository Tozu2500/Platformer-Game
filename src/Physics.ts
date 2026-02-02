import { GameObject, Velocity } from './types.js';

export class Physics {
    public static readonly GRAVITY = 0.6;
    public static readonly MAX_FALL_SPEED = 12;
    public static readonly JUMP_FORCE = -12;
    public static readonly MOVE_SPEED = 4;
    public static readonly FRICTION = 0.8;

    public static applyGravity(obj: GameObject): void {
        if (!obj.onGround) {
            obj.velocity.y += this.GRAVITY;
            if (obj.velocity.y > this.MAX_FALL_SPEED) {
                obj.velocity.y = this.MAX_FALL_SPEED;
            }
        }
    }

    public static applyFriction(velocity: Velocity): void {
        velocity.x *= this.FRICTION;
        if (Math.abs(velocity.x) < 0.1) {
            velocity.x = 0;
        }
    }

    public static checkCollision(
        obj1: GameObject,
        obj2: { x: number; y: number; width: number; height: number }
    ): boolean {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
}