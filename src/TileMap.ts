import { TileType, Tile } from './types.js';

export class TileMap {
    public static readonly TILE_SIZE = 32;
    private tiles: Tile[][] = [];
    public width: number;
    public height: number;

    constructor(levelData: number[][]) {
        this.height = levelData.length;
        this.width = levelData[0]?.length || 0;

        for (let row = 0; row < this.height; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.width; col++) {
                this.tiles[row][col] = {
                    type: levelData[row][col] as TileType,
                    x: col * TileMap.TILE_SIZE,
                    y: row * TileMap.TILE_SIZE
                };
            }
        }
    }

    public getTileAt(x: number, y: number): Tile | null {
        const col = Math.floor(x / TileMap.TILE_SIZE);
        const row = Math.floor(y / TileMap.TILE_SIZE);

        if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
            return this.tiles[row][col];
        }
        return null;
    }

    public getSurroundingTiles(x: number, y: number, width: number, height: number): Tile[] {
        const tiles: Tile[] = [];
        const startCol = Math.floor(x / TileMap.TILE_SIZE);
        const endCol = Math.floor((x + width) / TileMap.TILE_SIZE);
        const startRow = Math.floor(y / TileMap.TILE_SIZE);
        const endRow = Math.floor((y + height) / TileMap.TILE_SIZE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tile = this.getTileAt(col * TileMap.TILE_SIZE, row * TileMap.TILE_SIZE)
                if (tile && tile.type !== TileType.AIR) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const tile = this.tiles[row][col];
                this.drawTile(ctx, tile);
            }
        }
    }

    private drawTile(ctx: CanvasRenderingContext2D, tile: Tile): void {
        const size = TileMap.TILE_SIZE;

        switch (tile.type) {
            case TileType.GROUND:
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(tile.x, tile.y, size, size);
                ctx.strokeStyle = '#654321';
                ctx.strokeRect(tile.x, tile.y, size, size);
                break;
            case TileType.BRICK:
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(tile.x, tile.y, size, size);
                ctx.strokeStyle = '#8B4513';
                ctx.strokeRect(tile.x, tile.y, size, size);
                ctx.strokeRect(tile.x + 8, tile.y + 8, 16, 16);
                break;
            case TileType.COIN:
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(tile.x + size / 2, tile.y + size / 2, 10, 0, Math.PI * 2);
                ctx.fill();
                break;
            case TileType.PLATFORM:
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(tile.x, tile.y, size, 8);
                break;
            case TileType.SPIKE:
                ctx.fillStyle = '#696969';
                ctx.beginPath();
                ctx.moveTo(tile.x, tile.y + size);
                ctx.lineTo(tile.x + size / 2, tile.y);
                ctx.lineTo(tile.x + size, tile.y + size);
                ctx.closePath();
                ctx.fill();
                break;
            case TileType.FLAG:
                ctx.fillStyle = '#000000';
                ctx.fillRect(tile.x + 24, tile.y, 4, size);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(tile.x, tile.y, 24, 16);
                break;
        }
    }
}