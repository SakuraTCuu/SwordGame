import Loader from "../Libs/Loader/Loader";
import LoaderKeeper from "../Libs/Loader/LoaderKeeper";
import { Component, _decorator } from "cc"
import ITicker from "./ITicker"

const { ccclass } = _decorator

@ccclass
export default abstract class IBaseComponent extends Component implements ITicker {
    private loader: Loader = null;
    get MainLoader(): Loader {
        if (this.loader) return this.loader;

        let loaderKeeper = this.node.getComponent(LoaderKeeper);
        if (loaderKeeper) {
            this.loader = loaderKeeper.loader;
            return loaderKeeper.loader;
        }

        const l = this.loader = Loader.Instance.createSubLoader();
        this.node.addComponent(LoaderKeeper).init(l);
        return l;
    }

    onLoad() {
        // 注册计时器
        app.ticker.register(this);
    }

    onDestroy() {
        // 注销计时器
        app.ticker.unregister(this);
    }
    /**
     * 初始化 注册
     */
    protected abstract onRegister?(...r): void
    /**
      * 注销
      */
    protected abstract onUnRegister?(...r): void

    abstract onTick(delta: number): void
    onFixedTick?(delta: number): void
    onLateTick?(): void
}