//imports
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
  // '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js'
];

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  'css/animate.css',
  'js/libs/jquery.js'
];


/**
 * Instalación del service worker con los caches static e inmutable
 */
self.addEventListener('install', event => {

  const cacheStatic = caches.open(STATIC_CACHE).then(cache => {   //una forma de hacerlo, la de abajo es igual
    return cache.addAll(APP_SHELL);
  });

  const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));

  event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});



/**
 * En el activate eliminamos los caches dinamic antiguos por si los hubiera y solo tener la nueva versión actualizada
 */
self.addEventListener('activate', event => {

  const borrados = caches.keys().then(keys => {

    keys.forEach(key => {
      
      if (key.includes('static') && key !== STATIC_CACHE) {
        return caches.delete(key);
      }

      if (key.includes('dynamic') && key !== DYNAMIC_CACHE) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(borrados);

});


/**
 * Estrategia de CACHE NETWORK FALLBACK (Primero buscamos en el cache y si no está en la web)
 * En caso de que lo encontremos en la web lo grabamos en el cache dinamico para las siguientes
 */
self.addEventListener('fetch', event => {

  const respuesta = caches.match(event.request).then(resp => {

    if (resp) {
      return resp;

    } else {

      return fetch(event.request.url).then(newResp => {

        //La función actualizaCacheDinamico la tenemos en el archivo sw-util.js que la hemos creado nosotros
        return actualizaCacheDinamico(DYNAMIC_CACHE, event.request, newResp);
      });
    }

  });

  event.respondWith(respuesta);

});

