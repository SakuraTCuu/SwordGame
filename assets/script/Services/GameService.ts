import Singleton from "../Decorators/Singleton";
import IService from "../Interfaces/IService";

@Singleton
export class GameService implements IService {

    public static readonly instance: GameService;

    //提供网络服务?
    //提供 外部接口功能调用的服务

    public async initialize() {
        console.log("GameService initialize");
    }
    
    public async lazyInitialize() {
        console.log("GameService lazyInitialize");
    }

}