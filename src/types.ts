export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Velocity {
    x: number;
    y: number;
}

export interface GameObject extends Position, Size {
    velocity: Velocity;
    onGround: boolean;
}

export enum TileType {
    AIR = 0,
    GROUND = 1,
    BRICK = 2,
    COIN = 3,
    PLATFORM = 4,
    SPIKE = 5,
    FLAG = 6
}

export interface Tile {
    type: TileType;
    x: number;
    y: number;
}

export interface LevelData {
    tiles: number[][];
    enemySpawns: Position[];
    playerStart: Position;
    levelGoal: Position;
}