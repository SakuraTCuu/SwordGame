import { director } from 'cc';
import { DynamicLoading } from './preLoad/DynamicLoading';
import { SavingManager } from './system/SavingManager';
import { StorageSpace } from './system/StorageSpace';
import { Director } from 'cc';
import { Scene } from 'cc';
import { ItemManger } from './system/ItemManager';

class Main {

  readonly bagManager: StorageSpace = new StorageSpace();

  readonly savingManager: SavingManager = new SavingManager();

  readonly dynamicLoading: DynamicLoading = new DynamicLoading();

  readonly itemManger: ItemManger = new ItemManger();

  constructor() {
    this.init();
  }

  init() {

  }

}

const main = new Main();
export default main;

// 延迟初始化
director.once(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
  //TODO:  后续以FrameWork 形式 全局初始化
  main.bagManager.lazyInitialize();
  main.dynamicLoading.lazyInitialize();
  main.savingManager.lazyInitialize();
  main.itemManger.lazyInitialize();
});

  // App初始化
//   game.once(Game.EVENT_ENGINE_INITED, () => mega.initialize());

//   // 场景初次启动
//   director.on(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
//   });

//   // 延迟初始化
//   director.once(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
//       mega.lazyInitialize()
//   });
