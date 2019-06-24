importScripts("./ngsw-worker.js");

(function() {
  "use strict";

  // self fait référence à WorkerGlobalScope
  // il s’agit de la méthode standard pour définir des écouteurs d’événements.
  // use strict est obligatoire pour utiliser self
  self.addEventListener("notificationclick", (event) => {
    // data.url fait référence au payload contenu dans newsletter.js
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
    }
  }); }
());
