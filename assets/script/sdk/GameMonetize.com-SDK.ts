
// import { em } from "../global/EventManager";

// window.SDK_OPTIONS = {
//     gameId: "b12v1ztvlfebknd0tt6u2fci29din302",
//     onEvent: function (a) {
//         switch (a.name) {
//             case "SDK_GAME_PAUSE":
//                 em.dispatch("muteAudio");
//                 console.log("SDK_GAME_PAUSE");

//                 // pause game logic / mute audio
//                 break;
//             case "SDK_GAME_START":
//                 em.dispatch("resumeAudio");
//                 console.log("SDK_GAME_START");

//                 // advertisement done, resume game logic and unmute audio
//                 break;
//             case "SDK_READY":
//                 // when sdk is ready
//                 console.log("sdk init completed.");

//                 break;
//         }
//     }
// };
// (function (a, b, c) {
//     var d = a.getElementsByTagName(b)[0];
//     a.getElementById(c) || (a = a.createElement(b), a.id = c, a.src = "https://api.gamemonetize.com/sdk.js", d.parentNode.insertBefore(a, d))
// })(document, "script", "gamemonetize-sdk"); 