import { Application, Texture } from 'pixi.js';
import { AUDIO_ASSET, BLOCK, CANVAS, IMAGE_ASSET, REEL } from './enums';
import { Spinner } from './components/spinner/Spinner';
import { SlotSound } from '../sound/slot-sound';
import { Symbols } from './components/reel/components/Symbols';
import { Reel } from '/src/game/components/reel/Reel';
import { Block } from '/src/game/components/reel/components/Block';
import { Random } from '/src/utils/random';
import { Point } from '/src/game/components/reel/components/Point';

export class Game {
  private static instance: Game;

  private readonly spinner = new Spinner();

  private slotSound!: SlotSound;
  private slotSymbols!: Symbols;
  private slotReels!: [Reel, Reel, Reel];
  private app!: Application;

  private constructor() {
    this.init();
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }

    return Game.instance;
  }

  public updateProgress(val: number) {
    this.spinner.updateProgress(val * 100);
  }

  public start(): void {
    if (!this.slotSound) throw new Error('[attachAudios] is not called');
    if (!this.slotSymbols) throw new Error('[attachSymbols] is not called');

    this.hideSpinner();
    this.attachReels();
    this.callSetupOnce();
    this.attachLoop();
  }

  public attachAudios(audios: Map<AUDIO_ASSET, HTMLAudioElement>) {
    this.slotSound = new SlotSound(audios.get(AUDIO_ASSET.WIN)!, audios.get(AUDIO_ASSET.SPIN)!);
  }

  public attachSymbols(images: Record<IMAGE_ASSET, Texture>) {
    this.slotSymbols = new Symbols();
    for (const [key, symbol] of Object.entries(images)) {
      this.slotSymbols.set(<IMAGE_ASSET>key, symbol);
    }
  }

  public attachControls(spin: HTMLButtonElement, stop: HTMLButtonElement): void {
    spin.addEventListener('click', () => {
      for (const reel of this.slotReels) reel.spin();
    });

    stop.addEventListener('click', () => {
      for (const reel of this.slotReels) reel.stop();
    });
  }

  private attachReels() {
    this.slotReels = [
      new Reel({ spinTime: '2.0 sec', id: 0 }),
      new Reel({ spinTime: '2.4 sec', id: 1 }),
      new Reel({ spinTime: '2.8 sec', id: 2 }),
    ];
    this.app.stage.addChild(...this.slotReels);

    this.addBlocks();
  }

  private addBlocks() {
    const [reel01, reel02, reel03] = this.slotReels;

    const symbols = [IMAGE_ASSET.SEVEN, IMAGE_ASSET.CHERRY, IMAGE_ASSET.BARx1, IMAGE_ASSET.BARx2, IMAGE_ASSET.BARx3];

    const reel01Symbols = Random.pick(symbols, 16);
    const reel02Symbols = Random.pick(symbols, 64);
    const reel03Symbols = Random.pick(symbols, 128);

    for (const { val, idx } of reel01Symbols) reel01.addBlock(new Block(this.slotSymbols.get(val)!, idx));
    for (const { val, idx } of reel02Symbols) reel02.addBlock(new Block(this.slotSymbols.get(val)!, idx));
    for (const { val, idx } of reel03Symbols) reel03.addBlock(new Block(this.slotSymbols.get(val)!, idx));
  }

  private hideSpinner(): void {
    this.spinner.destroy();
  }

  private init(): void {
    this.createPixiApplication();
    this.renderSpinner();
  }

  private createPixiApplication(): void {
    const slot = document.getElementById('slot');
    if (!slot) throw new Error('#slot not found in the document');

    this.app = new Application({
      view: slot as HTMLCanvasElement,
      width: CANVAS.WIDTH,
      height: CANVAS.HEIGHT,
      backgroundColor: 0x000,
      resolution: window.devicePixelRatio || 1,
    });
  }

  private renderSpinner() {
    this.app.stage.addChild(this.spinner);
  }

  private drawStoppingPoints(): void {
    this.app.stage.addChild(
      new Point(0, BLOCK.HEIGHT / 2),
      new Point(0, REEL.HEIGHT / 2),
      new Point(0, REEL.HEIGHT - BLOCK.HEIGHT / 2),

      new Point(CANVAS.WIDTH - Point.width, BLOCK.HEIGHT / 2),
      new Point(CANVAS.WIDTH - Point.width, REEL.HEIGHT / 2),
      new Point(CANVAS.WIDTH - Point.width, REEL.HEIGHT - BLOCK.HEIGHT / 2),
    );
  }

  private callSetupOnce(): void {
    this.drawStoppingPoints();
  }

  private attachLoop(): void {
    let i = 0;
    this.app.ticker.add((_delta) => {
      //if (i++ % 40 !== 38) return;
      const now = Date.now();
      for (const reel of this.slotReels) {
        if (now - reel.getStartedAt() > reel.getSpinTime()) reel.stop();
        for (const block of reel.blocks) {
          if (reel.isSpinning) block.y += 8 * reel.id + 1;
        }
      }
    });
  }
}
