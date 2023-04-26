import { BlockInputEvents, error, instantiate, isValid, log, Node, Prefab, resources, tween, UIOpacityComponent, utils, Widget } from "cc";

import IService from "../Interfaces/IService";
import Singleton from "../Decorators/Singleton";

import PriorityQueue from "../Libs/Structs/PriorityQueue";
import IUI from "../Interfaces/IUI";
import ITicker from "../Interfaces/ITicker";
import UIHelper from "../Helpers/UIHelper";
import Loader from "../Libs/Loader/Loader";
import LoaderKeeper from "../Libs/Loader/LoaderKeeper";

@Singleton
export default class UIService extends EventTarget implements IService, ITicker {

    public static readonly instance: UIService;

    public get MainLoader() { return Loader.MainLoader(); };

    private mUIQueue: PriorityQueue<IUI> = new PriorityQueue<IUI>();

    // Modal组件
    private modal: Node = null;

    //是否锁住添加UI方法
    private mLockAddUI: boolean = false;
    //等待的UI参数队列
    private mWatiUIQueue: PriorityQueue<any> = new PriorityQueue<any>();
    //正在被操作的UI
    private mDoShowUIQueue: PriorityQueue<string> = new PriorityQueue<string>();
    //ui层级
    private _zorder: number = 10;

    private mCurrentUI: string = null;

    public async initialize() {
        this.mUIQueue.clear();
        this.mWatiUIQueue.clear();
    }
    public async lazyInitialize() {
        const appNode = utils.find("Mega");
        if (appNode == null) {
            console.log("没有Mega节点");
            return;
            throw new Error("没有Mega节点")
        }
        this.modal = appNode;
        app.ticker.register(this);
    }
    /**
    * 添加一个需要弹的UI到待弹队列中
    * @param x 
    * @param r 参数列表
    */
    async addUI(x: string | UIHelper.IUIInfo, ...r) {
        let uiInfo = <UIHelper.IUIInfo>x;
        if (typeof (x) == "string") {
            uiInfo = UIHelper.DefStack.get(x);
        }
        let args = [uiInfo].concat(r);
        // await PromiseHelper.nextFrame();
        if (uiInfo && uiInfo.id) {
            try {
                return await this.createUI.apply(this, args);
            } catch (error) {
                console.log("[UIMGr] addUI 载入异常:");
            }

            // fromPromise(this.createUI.apply(this, args))
            //     .subscribe((v) => {
            //         console.log("33333333333")
            //     })

        }
        // console.log("44444444444")

    }
    /**
     * @desc 创建界面添加一个UI
     * @param {string} id
     * @param {arguments} 剩余的参数，会在onCreate中传入到UIBase
     * 有些特殊情况，当addUI的第二个参数为布尔值时，那么这个将将作为控制UI是否立刻显示
     */
    private async createUI(uiInfo: UIHelper.IUIInfo, ...r) {
        let isShow = true;
        let id = uiInfo.id;
        let tmpArg = [].concat(uiInfo).concat(r);
        //如果UI正在被处理删除 
        if (this.mDoShowUIQueue.has(id)) {
            return;
        }

        if (this.mLockAddUI) {
            //加入到等待队列
            this.mWatiUIQueue.enqueue(tmpArg);
            return;
        }
        this.mLockAddUI = true;
        // 拆分参数列表
        let sliceIdx = 1;
        if (tmpArg && tmpArg.length > 1) {
            if (typeof tmpArg[1] == "boolean") {
                isShow = tmpArg[1];
                sliceIdx = 2;
            }
        }

        let args = Array.prototype.slice.call(tmpArg, sliceIdx);
        Array.prototype.unshift.call(args, isShow);

        var newU: IUI = this.findUI(id);
        if (newU == null) {
            // self.showModal();
            let node = await this.loadUIResource(id).catch((err) => { });
            if (!node) {
                console.log("[UIService] loadUIresource Error:", id);
                return;
            }
            newU = node.getComponent(IUI as any);
            if (!newU) {
                // newU = node.addComponent('UIPublic');
                console.error("[UIService] Not Found UI Component!!!!");
            }
            newU.create(id);
            newU.createFinish.apply(newU, args);
            //加入到队列
            this.reEnUIQueue(newU);
            //如果创建UI不需要显示
            if (!isShow) {
                this.mLockAddUI = false;
                newU.setVisible(false);
                return newU;
            }
        }
        // 展示视图
        await this.doShow(newU, args);

        this.mLockAddUI = false;

        return newU;
    }
    /**
     * 重置UIQueue的序列
     * 为了方便排序
     * @param dlg 
     */
    private reEnUIQueue(dlg) {
        var zOrder = dlg.uiOpt.zOrder || 0;
        let z = (zOrder + this._zorder++);
        //重新入列
        if (this.mUIQueue.has(dlg)) {
            this.mUIQueue.remove(dlg);
        }
        this.mUIQueue.enqueue(dlg, z)
    }
    /**
     * @desc 处理界面显示情况
     */
    private async doShow(dlg: IUI, args) {
        //如果UI正在被处理删除 
        if (this.mDoShowUIQueue.has(dlg.ID)) {
            return;
        }
        var zOrder = dlg.uiOpt.zOrder || 0;
        let z = (zOrder + this._zorder++);

        //显示的时候
        if (args[0]) { //被打开
            this.reEnUIQueue(dlg);
        }
        this.mDoShowUIQueue.enqueue(dlg.ID);

        dlg.node.resumeSystemEvents(true);

        await dlg.show.apply(dlg, args);

        dlg.node.setSiblingIndex(z);

        this.resetUIQueueModel();
    }

    /**
     * @desc 当UI弹出、关闭的时候 告知
     * @param dlg
     * @param isShow
     */
    doShowFinish(dlg: IUI, isShow) {

        if (!isShow) {
            if (dlg.uiOpt.isAutoRelease) {
                this.destroyUI(dlg);
            } else {
                dlg.remove.apply(dlg, [false]);
            }
        } else {
            dlg.setVisible(true);
        }

        let topUI = this.mUIQueue.isEmpty() ? null : this.mUIQueue.front().element;
        if (topUI) {
            this.mCurrentUI = topUI.ID;
        } else {
            this.mCurrentUI = null;
        }

        this.resetUIQueueModel();

        //从被删除的队列中删除
        this.mDoShowUIQueue.remove(dlg.ID);

        log("[UIService] CurrentUI:", this.mCurrentUI);
    }
    /**
     * 取一个可控制的Root层
     * @param typeM LayerZOrder 默认为去UI层 可自定义区Top Effect层
     */
    getZorderLayer(typeM?: UIHelper.LayerZOrder): Node {
        let ret: Node = null;

        //如果创建场景加载时，场景对象有可能不存在
        if (!ret || !ret.addChild) {
            ret = this.modal;
        }
        let layerZIndex = typeM || UIHelper.LayerZOrder.UI;

        let layer = UIHelper.LayerZOrder[layerZIndex];
        if (!layer) {
            layerZIndex = UIHelper.LayerZOrder.UI;
            layer = UIHelper.LayerZOrder[layerZIndex];
        }
        if (!ret.getChildByName(layer)) {
            let node = new Node(layer);

            let wg = node.addComponent(Widget);
            wg.isAlignLeft = true;
            wg.isAlignBottom = true;
            wg.isAlignRight = true;
            wg.isAlignTop = true;
            wg.alignMode = Widget.AlignMode.ALWAYS;
            node.name = layer;

            node.setSiblingIndex(layerZIndex || 1000);
            ret.addChild(node);
            wg.updateAlignment();
            ret = node;
        }
        else {
            ret = ret.getChildByName(layer);
        }
        return ret;
    }
    /**
     * 重置model层   不会导致UImodel重叠
     */
    private resetUIQueueModel() {
        //重置Model
        let lastModelUI = null;

        this.mUIQueue.forEach((v) => {
            if (v.uiOpt.uiModelType == UIHelper.DMT.Model) {
                v.resetModel(false);
                lastModelUI = v;
            }
        });

        if (lastModelUI) {
            lastModelUI.resetModel(true);
        }
    }

    /**
     * 通过UIID 从栈内查找UI
     * @param uiID
     */
    findUI(uiID: string) {
        let ret: IUI;
        this.mUIQueue.some((t: IUI) => {
            if (t.ID == uiID) {
                ret = t;
                return true;
            }
            return false;
        });
        return ret;
    }
    /**
     * @desc 从已存在的UI队列中将UI显示
     * @param ui
     */
    showUI(ui: IUI | string) {
        var dlg = ui;
        if (typeof (ui) == "string")
            dlg = this.findUI(ui)
        if (null == dlg)
            return

        var args = Array.prototype.slice.call(arguments, 1);
        Array.prototype.unshift.call(args, true);
        this.doShow(<IUI>dlg, args);
    }
    /**
     * @desc 从栈椎中移除UI
     * @param ui
     */
    removeUI(ui: IUI | string, backUI?: any) {
        if (ui == null) return;
        var dlg: IUI = <IUI>ui;
        if (typeof (ui) === "string")
            dlg = this.findUI(ui);
        if (null == dlg) {
            console.log("[Warning] removeUI not find " + ui);
            return;
        }
        if (this.mCurrentUI === dlg.ID)
            this.mCurrentUI = undefined;

        this.doShow(dlg, [false]);
        if (backUI) {
            this.addUI(backUI);
        }
    }
    /**
     * @desc 删除所有UI 但是不包括but
     * @param butDlg
     */
    removeUIAll(butDlg?: string | IUI) {
        let butID: string = <string>butDlg;
        if (butDlg instanceof IUI) {
            butID = butDlg.ID;
        }
        while (this.mUIQueue.size() > 0) {
            this.removeUI(this.mUIQueue.front().element);
        }
    }
    /**
     * @desc 销毁UI
     * @param ui
     */
    private destroyUI(ui: IUI | string) {
        var id = ui;
        if (ui && typeof (ui) != "string")
            id = ui.ID;

        this.mUIQueue.some((dlg) => {
            if (dlg.ID == id) {
                this.mUIQueue.remove(dlg);
                dlg.remove();
                console.log("[UIService] UI removed " + id);
                return true;
            }
            return false;
        })

    }

    /**
     * @desc 清理当前管理栈
     */
    clean() {
        let tmpUIArr: IUI[] = [].concat(this.mUIQueue);
        for (var i = 0; i < tmpUIArr.length; i++) {
            var ui = tmpUIArr[i];
            ui.remove();
        }
        delete this.mUIQueue;
        this.mUIQueue.clear();
        this._zorder = 10;
        this.mCurrentUI = undefined;
    }

    onTick(delta: number): void {

    }

    onFixedTick?(delta: number): void {
        if (this.mLockAddUI || this.mWatiUIQueue.size() < 1) return;
        let tmgs = this.mWatiUIQueue.dequeue();
        if (tmgs) {
            try {
                this.createUI.apply(this, tmgs.element);
            } catch (error) {
                console.log("[UIService] UI 载入异常:", tmgs);
            }
        }
    }

    onLateTick?(): void {

    }

    /**
     * @desc 加载UI资源
     * @param {string} id  UI的ID
     * @param {function} callback function(err, node)
     * @param {Boolen} onlyPrefab 是否要加载node，在预加载的时候，只加载资源，是不需要加载node的
     * @return None
     */
    private async loadUIResource(id: string) {
        const uiInfo = UIHelper.DefStack.get(id);
        let path = uiInfo.path;
        if (!path) {
            path = UIHelper.DefStack.PublicPrefab;
        }
        if (!path) {
            let node: Node = new Node();
            if (uiInfo.script) {
                node.addComponent(<any>uiInfo.script);
            }
            return node;
        }
        let loader: Loader = this.MainLoader.createSubLoader();
        const nodeRes = await loader.loadAsync<Prefab>(path, Prefab, null);
        if (!nodeRes) return null;

        const node = instantiate(nodeRes);
        if (uiInfo.script) {
            node.addComponent(<any>uiInfo.script);
        }
        node.addComponent(LoaderKeeper).init(loader);
        return node;

        // return new Promise<Node>(resolve => {
        //     let uiInfo = UIHelper.DefStack.get(id);
        //     let path = uiInfo.path;
        //     if (!path) {
        //         path = UIHelper.DefStack.PublicPrefab;
        //     }
        //     if (!path) {
        //         let node: Node = new Node();
        //         if (uiInfo.script) {
        //             node.addComponent(<any>uiInfo.script);
        //         }
        //         resolve(node);
        //         return;
        //     }
        //     resources.load(path, Prefab, (err: Error, res: any) => {
        //         if (err) {
        //             error(`路径('${path}')不存在`);
        //         } else {
        //             let node: Node = instantiate(res);
        //             if (uiInfo.script) {
        //                 node.addComponent(<any>uiInfo.script);
        //             }
        //             resolve(node);
        //         }
        //         resolve(null);
        //     });
        // });
    }

}
