import { lazy } from "react";
import locales from "./locales";
import routes from "./routes";
import getMenuItems from "./menuItems";
import themes from "./themes";
import parseLanguages from "base-shell/lib/utils/locale";
import grants from "./grants";
import Loading from "material-ui-shell/lib/components/Loading/Loading";
import getDefaultRoutes from "./getDefaultRoutes";
import { defaultUserData, isGranted } from "rmw-shell/lib/utils/auth";

const config = {
  firebase: {
    prod: {
      initConfig: {
        apiKey: "AIzaSyBaBL5i_NcE21Zvg4CT0NmBqh_7HLPAe5A",
        authDomain: "myapp-6a24d.firebaseapp.com",
        databaseURL: "https://myapp-6a24d.firebaseio.com",
        projectId: "myapp-6a24d",
        storageBucket: "myapp-6a24d.appspot.com",
        messagingSenderId: "735681842937",
        appId: "1:735681842937:web:3115b30389f05caf5f5c28",
        measurementId: "G-2VCCSQMEH8",
      },
      messaging: {
        publicVapidKey:
          "BPT477RmDcVfBAMz0mHP3cIXNbksuG7UxB2MUyGODtD7kbwAEtPDFwARoFQvGwgTIuS4KypqtsZMtOAf_X2e9yU",
      },
    },
    dev: {
      initConfig: {
        apiKey: "AIzaSyBqcbDnwIdthd-LqvPi1_KXsitAkUuu-VI",
        authDomain: "myapp-dev-cf316.firebaseapp.com",
        projectId: "myapp-dev-cf316",
        storageBucket: "myapp-dev-cf316.appspot.com",
        messagingSenderId: "878211963898",
        appId: "1:878211963898:web:4e03771c581dc9510f6243",
        measurementId: "G-RY7TE0MG64",
      },
      messaging: {
        publicVapidKey:
          "BDzd_MQlVHZJxZ_XwUZq7xT4u-jZEdLKLTRcY0DY0NiVkpPuqEoWHRTbj-dL9MOGVbuIzeamUlARpjJPlY5q0j0",
      },
    },
    devd: {
      initConfig: {
        apiKey: "AIzaSyBqcbDnwIdthd-LqvPi1_KXsitAkUuu-VI",
        authDomain: "myapp-dev-cf316.firebaseapp.com",
        projectId: "myapp-dev-cf316",
        storageBucket: "myapp-dev-cf316.appspot.com",
        messagingSenderId: "878211963898",
        appId: "1:878211963898:web:4e03771c581dc9510f6243",
        measurementId: "G-RY7TE0MG64",
      },
      messaging: {
        publicVapidKey:
          "BDzd_MQlVHZJxZ_XwUZq7xT4u-jZEdLKLTRcY0DY0NiVkpPuqEoWHRTbj-dL9MOGVbuIzeamUlARpjJPlY5q0j0",
      },
    },
    firebaseuiProps: {
      signInOptions: [
        "google.com",
        "facebook.com",
        "twitter.com",
        "github.com",
        "password",
        "phone",
      ],
    },
  },
  googleMaps: {
    apiKey: "AIzaSyByMSTTLt1Mf_4K1J9necAbw2NPDu2WD7g",
  },
  auth: {
    grants,
    redirectTo: "/dashboard",
    persistKey: "base-shell:auth",
    signInURL: "/signin",
    onAuthStateChanged: async (user, auth, firebaseApp) => {
      if (user != null) {
        const grantsSnap = await firebaseApp
          .database()
          .ref(`user_grants/${user.uid}`)
          .once("value");
        const notifcationsDisabledSnap = await firebaseApp
          .database()
          .ref(`disable_notifications/${user.uid}`)
          .once("value");

        const isAdminSnap = await firebaseApp
          .database()
          .ref(`admins/${user.uid}`)
          .once("value");

        firebaseApp
          .database()
          .ref(`user_grants/${user.uid}`)
          .on("value", (snap) => {
            auth.updateAuth({ grants: snap.val() });
          });

        firebaseApp
          .database()
          .ref(`disable_notifications/${user.uid}`)
          .on("value", (snap) => {
            auth.updateAuth({ notificationsDisabled: !!snap.val() });
          });

        firebaseApp
          .database()
          .ref(`admins/${user.uid}`)
          .on("value", (snap) => {
            auth.updateAuth({ isAdmin: !!snap.val() });
          });

        auth.updateAuth({
          ...defaultUserData(user),
          grants: grantsSnap.val(),
          notificationsDisabled: notifcationsDisabledSnap.val(),
          isAdmin: !!isAdminSnap.val(),
          isGranted,
        });

        firebaseApp.database().ref(`users/${user.uid}`).update({
          displayName: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
          providers: user.providerData,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          notificationsDisabled: notifcationsDisabledSnap.val(),
        });

        await firebaseApp
          .database()
          .ref(`user_chats/${user.uid}/public_chat`)
          .update({
            displayName: "Public Chat",
            lastMessage: "Group chat",
            path: `group_chat_messages/public_chat`,
          });
      } else {
        firebaseApp.database().ref().off();
        auth.setAuth(defaultUserData(user));
      }
    },
  },
  getDefaultRoutes,
  routes,
  locale: {
    locales,
    persistKey: "base-shell:locale",
    defaultLocale: parseLanguages(["en", "de", "ru"], "en"),
    onError: (e) => {
      //console.warn(e)

      return;
    },
  },
  menu: {
    getMenuItems,
    MenuHeader: lazy(() =>
      import("material-ui-shell/lib/components/MenuHeader/MenuHeader")
    ),
  },
  theme: {
    themes,
    defaultThemeID: "default",
    defaultType: "light",
  },
  pages: {
    LandingPage: lazy(() => import("../pages/LandingPage")),
    PageNotFound: lazy(() => import("../pages/PageNotFound")),
  },
  components: {
    Menu: lazy(() =>
      import("rmw-shell/lib/containers/FirebaseMenu/FirebaseMenu")
    ),
    Loading,
  },

  containers: {
    AppContainer: lazy(() =>
      import("material-ui-shell/lib/containers/AppContainer/AppContainer")
    ),
    LayoutContainer: lazy(() =>
      import("rmw-shell/lib/containers/LayoutContainer/LayoutContainer")
    ),
  },
};

export default config;
