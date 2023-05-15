import { director, Director, dynamicAtlasManager, Game, game, log, Scene, sys } from 'cc';

import IFrameWork from "./Interfaces/IFrameWork";
import ViewService from "./Services/ViewService";
import ControllerService from "./Services/ControllerService";
import NotificationService from "./Services/NotificationService";
import ModelService from "./Services/ModelService";
import CommandService from "./Services/CommandService";
import PlatformService from "./Services/PlatformService";
import LocalizedService from "./Services/LocalizedService";
import TickerService from "./Services/TickerService";
import PoolService from "./Services/PoolService";
import SceneService from "./Services/SceneService";
import TimerService from "./Services/TimerService";
import AudioService from "./Services/AudioService";
import ConfigService from "./Services/ConfigService";
import UIService from './Services/UIService';
import { BagService } from './Services/BagService';
import { ItemDataService } from './Services/ItemDataService';
import { StorageService } from './Services/StorageService';
import LoaderService from './Services/LoaderService';
import { StaticDataService } from './Services/StaticDataService';
import RewardService from './Services/RewardService';

class App extends IFrameWork {

  /**
   * 背包数据
   */
  public readonly bag = BagService.instance

  /**
   * 游戏静态数据
   */
  public readonly staticData = StaticDataService.instance

  /**
   * 本地存储
   */
  public readonly storage = StorageService.instance

  /**
   * 物品管理
   */
  public readonly item = ItemDataService.instance

   /**
   * 加载
   *
   * @memberof App
   */
   public readonly loader = LoaderService.instance

  /**
   * 奖励服务, 广告奖励/补偿奖励/日常奖励/邮箱...
   */
  public readonly reward = RewardService.instance

  /**
   * 模型
   *
   * @memberof App
   */
  public readonly model = ModelService.instance
  /**
   * 视图
   *
   * @memberof App
   */
  public readonly view = ViewService.instance
  /**
   * 控制器
   *
   * @memberof App
   */
  public readonly ctrl = ControllerService.instance
  /**
   * 通知
   *
   * @memberof App
   */
  public readonly notice = NotificationService.instance
  /**
   * 命令
   *
   * @memberof App
   */
  public readonly cmd = CommandService.instance

  /**
   *平台
   *
   * @memberof App
   */
  public readonly platform = PlatformService.instance

  /**
   * 多语言
   *
   * @memberof App
   */
  public readonly locale = LocalizedService.instance


  /**
  * 计时器服务
  *
  * @memberof App
  */
  public readonly ticker = TickerService.instance

  /**
  * 时间服务
  *
  * @memberof App
  */
  public readonly timer = TimerService.instance

  /**
  * 对象池服务
  *
  * @memberof App
  */
  public readonly pool = PoolService.instance

  /**
  * 声音服务
  *
  * @memberof App
  */
  public readonly audio = AudioService.instance

  /**
  * 配置服务
  *
  * @memberof App
  */
  public readonly config = ConfigService.instance

  /**
  * 场景服务
  *
  * @memberof App
  */
  public readonly scene = SceneService.instance

  /**
  * ui服务
  *
  * @memberof App
  */
  public readonly ui = UIService.instance
}

declare global {
  const app: App;
}

// 关闭动态和图
dynamicAtlasManager.enabled = false;

if (typeof app == typeof undefined) {

  const app = new App();
  (window as any).app = app;

  if (sys.platform !== sys.Platform.EDITOR_PAGE) {
    // App初始化
    game.once(Game.EVENT_ENGINE_INITED, () => app.initialize());

    // 场景初次启动
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
      // 添加常驻节点
    });

    // 延迟初始化
    director.once(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
      app.lazyInitialize()
    });

  } else {
    app.locale.initialize();
  }
}

