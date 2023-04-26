import { Asset } from "cc";
// import { CCMResUtil } from "./CCMResUtil";

export type FilterCallback = (asset: Asset) => boolean;


/**
 * 从字符串中查找第N个字符
 * @param str 目标字符串
 * @param cha 要查找的字符
 * @param num 第N个
 */
const findCharPos = function (str: string, cha: string, num: number): number {
    let x = str.indexOf(cha);
    let ret = x;
    for (var i = 0; i < num; i++) {
        x = str.indexOf(cha, x + 1);
        if (x != -1) {
            ret = x;
        } else {
            return ret;
        }
    }
    return ret;
}

/**
 * 获取当前调用堆栈
 * @param popCount 要弹出的堆栈数量
 */
const getCallStack = function (popCount: number): string {
    // 严格模式无法访问 arguments.callee.caller 获取堆栈，只能先用Error的stack
    let ret = (new Error()).stack;
    let pos = findCharPos(ret!, '\n', popCount);
    if (pos > 0) {
        ret = ret!.slice(pos);
    }
    return ret!;
}


export class ResLeakChecker {
    public resFilter: FilterCallback | null = null;    // 资源过滤回调
    private _checking: boolean = false;
    private traceAssets: Set<Asset> = new Set<Asset>();

    /**
     * 检查该资源是否符合过滤条件
     * @param url 
     */
    public checkFilter(asset: Asset): boolean {
        if (!this._checking) {
            return false;
        }
        if (this.resFilter) {
            return this.resFilter(asset);
        }
        return true;
    }

    /**
     * 对资源进行引用的跟踪
     * @param asset 
     */
    public traceAsset(asset: Asset) {
        if (!asset || !this.checkFilter(asset)) {
            return;
        }
        if (!this.traceAssets.has(asset)) {
            asset.addRef();
            this.traceAssets.add(asset);
            this.extendAsset(asset);
        }
    }

    /**
     * 扩展asset，使其支持引用计数追踪
     * @param asset 
     */
    public extendAsset(asset: Asset) {
        let addRefFunc = asset.addRef;
        let decRefFunc = asset.decRef;
        let traceMap = new Map<string, number>();
        asset.traceMap = traceMap;
        asset.addRef = function (...args: any): Asset {
            let stack = getCallStack(1);
            let cnt = traceMap.has(stack) ? traceMap.get(stack)! + 1 : 1;
            traceMap.set(stack, cnt);
            return addRefFunc.apply(asset, args);
        }
        asset.decRef = function (...args: any): Asset {
            let stack = getCallStack(1);
            let cnt = traceMap.has(stack) ? traceMap.get(stack)! + 1 : 1;
            traceMap.set(stack, cnt);
            return decRefFunc.apply(asset, args);
        }
        asset.resetTrace = () => {
            asset.addRef = addRefFunc;
            asset.decRef = decRefFunc;
            delete asset.traceMap;
        }
    }

    /**
     * 还原asset，使其恢复默认的引用计数功能
     * @param asset 
     */
    public resetAsset(asset: Asset) {
        if (asset.resetTrace) {
            asset.resetTrace();
        }
    }

    public untraceAsset(asset: Asset) {
        if (this.traceAssets.has(asset)) {
            this.resetAsset(asset);
            asset.decRef();
            this.traceAssets.delete(asset);
        }
    }

    public startCheck() { this._checking = true; }
    public stopCheck() { this._checking = false; }
    public getTraceAssets(): Set<Asset> { return this.traceAssets; }

    public reset() {
        this.traceAssets.forEach(element => {
            this.resetAsset(element);
            element.decRef();
        });
        this.traceAssets.clear();
    }

    public dump() {
        this.traceAssets.forEach(element => {
            let traceMap: Map<string, number> | undefined = element.traceMap;
            if (traceMap) {
                traceMap.forEach((key, value) => {
                    console.log(`${key} : ${value} `);
                });
            }
        })
    }
}
