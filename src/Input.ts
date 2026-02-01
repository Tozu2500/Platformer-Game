export class Input {
    private keys: Map<string, boolean> = new Map();
    private previousKeys: Map<string, boolean> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
        });
    }

    public isKeyPressed(keyCode: string): boolean {
        return this.keys.get(keyCode) || false;
    }

    public isKeyJustPressed(keyCode: string): boolean {
        const current = this.keys.get(keyCode) || false;
        const previous = this.previousKeys.get(keyCode) || false;
        return current && !previous;
    }

    public update(): void {
        this.previousKeys = new Map(this.keys);
    }
}