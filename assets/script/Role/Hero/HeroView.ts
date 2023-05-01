import { JsonAsset, Label, Material, Prefab, Sprite, _decorator } from "cc";
import IView from "../../Interfaces/IView"
const { ccclass, property } = _decorator;

export default class HeroView extends IView {

    @property({
        type: Sprite,
        displayName: "英雄血条"
    })
    bloodSprite: Sprite = null;

    @property(Sprite)
    shieldSprite: Sprite = null;

    @property(Node)
    heroSprite: Node = null;

    @property(Sprite)
    expProgress: Sprite = null;

    @property(JsonAsset)
    expDataJson: JsonAsset = null;

    @property(JsonAsset)
    heroPropertyDataJson: JsonAsset = null;

    @property(Label)
    lvDescription: Label = null;

    @property(Node)
    GameUILayer: Node = null;

    @property(Prefab)
    itemInPlaying: Prefab = null;

    @property(Node)
    curDirPar: Node = null;

    @property(Prefab)
    flyingThunderGodPrefab: Prefab = null;

    @property([Material])
    heroMaterial = [];

    protected onRegister?(...r: any[]): void {
        throw new Error("Method not implemented.");
    }
    protected onUnRegister?(...r: any[]): void {
        throw new Error("Method not implemented.");
    }
    onTick(delta: number): void {
        throw new Error("Method not implemented.");
    }

}