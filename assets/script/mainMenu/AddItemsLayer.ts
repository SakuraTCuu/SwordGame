import { _decorator, Component, Node } from 'cc';
import { em } from '../global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('AddItemsLayer')
export class AddItemsLayer extends Component {

    _curItemIdString: string;
    _curSelectTotal: string;

    inputItemNameString(box) {
        this._curItemIdString = box.string;
        console.log("inputItemNameString", box.string);

    }
    inputItemTotalString(box) {
        this._curSelectTotal = box.string;
        console.log("inputItemTotalString", box.string);

    }
    onBtnConfirm() {
        let num = parseInt(this._curSelectTotal);
        if (isNaN(num)) {
            em.dispatch("tipsViewShow", "数量输入错误，请重新输入");
            return;
        };
        let isValid = em.dispatch("itemIsValid", this._curItemIdString);
        if (!isValid) {
            em.dispatch("tipsViewShow", "物品名称输入错误，请重新输入");
            return;
        }
        em.dispatch("addItemToSS", this._curItemIdString, num);
        em.dispatch("tipsViewShow", "获得物品：" + this._curItemIdString + "x" + num);
    }
    onBtnOpenAddItemLayer() {
        this.node.active = true;
    }

}

