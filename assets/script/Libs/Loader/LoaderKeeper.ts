import { Component, _decorator } from "cc"
import Loader from "./Loader"

const { ccclass } = _decorator

@ccclass
export default class LoaderKeeper extends Component {
    private _loader: Loader = null

    get loader(): Loader {
        return this._loader
    }

    init(loader: Loader) {
        this._loader = loader
        return this
    }

    onDestroy() {
        if (this._loader) {
            this._loader.release();
            this._loader = null
        }
    }
}