import { Application, Texture } from 'pixi.js';
import { AUDIO_ASSET, BLOCK, CANVAS, IMAGE_ASSET, REEL } from './enums';
import { Spinner } from './components/spinner/Spinner';
import { SlotSound } from '../sound/slot-sound';
import { Symbols } from './components/reel/components/Symbols';
import { Reel } from '/src/game/components/reel/Reel';
import { Block } from '/src/game/components/reel/components/Block';
import { Random } from '/src/utils/random';
import { Point } from '/src/game/components/reel/components/Point';
import { gsap } from 'gsap';

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
    if (!this.slotSound) throw new Error("[attachAudios] hasn't been called");
    if (!this.slotSymbols) throw new Error("[attachSymbols] hasn't been called");

    this.hideSpinner();
    this.attachReels();
    this.callSetupOnce();
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

  public attachControls(spin: HTMLButtonElement): void {
    spin.addEventListener('click', () => {
      this.reset();
      this.addBlocks();
      this.spin();
    });
  }

  private attachReels() {
    this.slotReels = [
      new Reel({ spinTime: '2.0 sec', id: 0 }),
      new Reel({ spinTime: '2.4 sec', id: 1 }),
      new Reel({ spinTime: '2.8 sec', id: 2 }),
    ];
    this.app.stage.addChild(...this.slotReels);
  }

  private addBlocks() {
    const [reel01, reel02, reel03] = this.slotReels;

    const symbols = [IMAGE_ASSET.SEVEN, IMAGE_ASSET.CHERRY, IMAGE_ASSET.BARx1, IMAGE_ASSET.BARx2, IMAGE_ASSET.BARx3];

    const reel01Symbols = Random.pick(symbols, 4);
    const reel02Symbols = Random.pick(symbols, 8);
    const reel03Symbols = Random.pick(symbols, 16);

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
      antialias: true,
    });
  }

  private renderSpinner() {
    this.app.stage.addChild(this.spinner);
  }

  private drawStoppingLines(): void {
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
    this.drawStoppingLines();
  }

  private spin(): void {
    for (const reel of this.slotReels) {
      gsap.to(reel, {
        pixi: { y: reel.size },
        duration: reel.spinTime / 1000,
        ease: 'back.out(0.4)',
      });
    }
  }

  private reset(): void {
    for (const reel of this.slotReels) {
      reel.reset();
    }
  }
}
