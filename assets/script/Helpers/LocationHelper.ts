import { Node, Scene, UITransform, v2, Vec3, view, Widget } from "cc";

/**
 * 定位助手
 */
class LocationHelper {
    /**
     * cc.Widget 更新
     *
     * @private
     * @static
     * @param {cc.Node} content
     * @memberof ListView
     */
    public static updateWidget(content: Node) {
        let tmp = content.getParent();
        let result: Array<Widget> = [];
        while (tmp && !(tmp instanceof Scene)) {
            let component = tmp.getComponent(Widget);
            if (component) {
                result.push(component);
            }
            tmp = tmp.getParent();
        }
        while (result.length > 0) {
            let tmp = result.pop();
            tmp.updateAlignment();
        }
    }




    public static getLocation(content: Node): LocationHelper.Location {
        let winSize = view.getVisibleSize();
        // let canvas = utils.find("Canvas");
        LocationHelper.updateWidget(content);
        let nodeWorld = content.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        let nodetoCanvas = content.getComponent(UITransform).convertToNodeSpaceAR(nodeWorld);

        let top = 
            v2(nodetoCanvas.x, nodetoCanvas.y + content.getComponent(UITransform).height / 2)
            .subtract(v2(nodetoCanvas.x, winSize.height / 2))
            .length();

        let topRatio = top / winSize.height;

        let left = 
             v2(nodetoCanvas.x - content.getComponent(UITransform).width / 2, nodetoCanvas.y)
            .subtract(v2(-winSize.width / 2, nodetoCanvas.y))
            .length();
        let leftRatio = left / winSize.width;

        let width = content.getComponent(UITransform).width;
        let widthRatio = width / winSize.width;

        let height = content.getComponent(UITransform).height;
        let heightRatio = height / winSize.height;

        return {
            top,
            left,
            width,
            height,

            topRatio,
            leftRatio,
            widthRatio,
            heightRatio
        }
    }
}


namespace LocationHelper {
    /**
     * 位置信息
     */
    export interface Location {
        top: number
        left: number
        width: number
        height: number

        topRatio: number
        leftRatio: number
        widthRatio: number
        heightRatio: number
    }
}


export default LocationHelper;