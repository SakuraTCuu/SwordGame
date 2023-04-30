import IService from "../Interfaces/IService";
import Singleton from "../Decorators/Singleton";
import { EventTarget, __private } from "cc";

@Singleton
export default class NotificationService extends EventTarget implements IService {

    public static readonly instance: NotificationService;

    public async initialize() {
    }

    public async lazyInitialize() {
    }

}

