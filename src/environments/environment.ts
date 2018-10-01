// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyC6A0J_G_Jxz6HMnbNfap7jaEXHew8pIss",
    authDomain: "courses-8f7b2.firebaseapp.com",
    databaseURL: "https://courses-8f7b2.firebaseio.com",
    projectId: "courses-8f7b2",
    storageBucket: "courses-8f7b2.appspot.com",
    messagingSenderId: "1036722106145"
  },
  olConfig:{
    apikey: "AoZMNXp87zjIQXWvP83jlfYY7vEid3ObC3vg1I01GGPWpQkf6qmoMjLSEhXiSW1o"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
