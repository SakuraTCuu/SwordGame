import { SavingManager } from './system/SavingManager';
import { StorageSpace } from './system/StorageSpace';

class Main {

    readonly bagManager: StorageSpace = new StorageSpace();

    readonly savingManager: SavingManager = new SavingManager();

    constructor() {

    }
}

const main = new Main();
export default main;


  // App初始化
//   game.once(Game.EVENT_ENGINE_INITED, () => mega.initialize());

//   // 场景初次启动
//   director.on(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
//   });

//   // 延迟初始化
//   director.once(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
//       mega.lazyInitialize()
//   });
