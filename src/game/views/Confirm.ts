import { View } from '/src/game/views/View';
import type { Application } from 'pixi.js';
import GUI from 'lil-gui';
import * as PIXI from 'pixi.js';
import { CANVAS } from '/src/game/enums';

export class Confirm extends View {
  private readonly text: string;
  private container = new PIXI.Container();

  constructor(section: GUI, app: Application, text: string) {
    super(section, app);

    this.text = text;
    this.ticker = this.ticker.bind(this);
    this.reset = this.reset.bind(this);
  }

  init(): void {
    const text = new PIXI.Text(this.text, {
      fill: 'white',
      fontFamily: 'Verdana, Geneva, sans-serif',
      fontVariant: 'small-caps',
      fontWeight: '900',
    });
    text.anchor.set(0.5);
    text.y = CANVAS.HEIGHT / 2;
    text.x = CANVAS.WIDTH / 2;

    this.container.addChild(text);
    this.app.stage.addChild(this.container);
  }

  async run(): Promise<number> {
    console.info('Confirm');
    return 0;
  }

  subscribe(): void {
    this.container.visible = true;
  }

  unsubscribe(): void {
    this.container.visible = false;
  }

  private reset() {}

  private ticker(_delta: number) {}
}
