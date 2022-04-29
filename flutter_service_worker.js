'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "245ff6f497b2efc2337183959107adbc",
"index.html": "af13b86ea813b9628a607d3dc8ca5a01",
"/": "af13b86ea813b9628a607d3dc8ca5a01",
"main.dart.js": "e789c72ecc3ccebda86efde58f93ffa4",
"favicon.png": "4388cf8e5fb475b89f9d86cba95e4ced",
"icons/Icon-192.png": "0e403f6f06fcad1d9843774ca4c353fe",
"icons/Icon-maskable-192.png": "0e403f6f06fcad1d9843774ca4c353fe",
"icons/Icon-maskable-512.png": "532f980bebf92b1e19290223524fed8c",
"icons/Icon-512.png": "532f980bebf92b1e19290223524fed8c",
"manifest.json": "f9b474a3026cc71c3b45b590229ae2b1",
"assets/AssetManifest.json": "903afeb3159921de82bbdb6c7d5361b0",
"assets/NOTICES": "07a9befbfcb6f668df3c3f804b333fea",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/assets/images/image_introuvable.png": "2e2281b5e3b54a4734fc96165be97d8b",
"assets/assets/images/Group%2520103.png": "f40e85ed1fd2a4d9689155a6c275ff40",
"assets/assets/images/hardware/lunettes_de_protection.png": "c2b84ca90fa2e2aa4c61c375df04732b",
"assets/assets/images/hardware/bouchons_d_oreilles.png": "5ce3c7f159b6c6515fbc2d33ffd8291e",
"assets/assets/images/hardware/add_hardware.png": "c32e7823b336e71721c5aebbb88a0b5d",
"assets/assets/images/hardware/gants.png": "fb721ce8e18e5b9357c32b9203edb8eb",
"assets/assets/images/hardware/masque_antipoussiere.png": "998029ecfa5aa8d1b4506afcf02e0192",
"assets/assets/images/Group%2520105.png": "d2ea2fd849a54630cfd3173af6bf4e5f",
"assets/assets/images/Group%2520104.png": "0536c992cda5a7c08e6961da0d468675",
"assets/assets/images/Dot-error.png": "4fba23209e75cc64c8f44b9f4f44f42f",
"assets/assets/images/Arrow.png": "885a63be57b536f0a0787f818281d4f6",
"assets/assets/images/default_profile_picture.png": "fd5461ed28d7046f2066dc304a87cb0f",
"assets/assets/images/app_launcher_icon.png": "41582cc0a9dfb11fc27c5030abde65cc",
"assets/assets/images/potdot_icon_blue.png": "6133fd4e1802c6accbccc93dedb0e968",
"assets/assets/images/favicon.png": "4d88fc4d9a459fc02fd39174a81b0bce",
"assets/assets/images/Dotspot.png": "6a1be0dab31bd9a95ebc430142ca6991",
"assets/assets/images/add_block_button.png": "4fcbade4ba78fbd523752940942729b7",
"assets/assets/images/video_introuvable.png": "a9af68b5b222ed898e986f40ee12f143",
"assets/assets/images/potdot_icon.png": "b64864939c1d00d339ad303a6bf5208f",
"assets/assets/images/Dotspot-pot.png": "4d88fc4d9a459fc02fd39174a81b0bce",
"assets/assets/images/no_image_icon.png": "a69950806221fa5750b6f54ed73fd288",
"assets/assets/images/crown.png": "3f02570833c7a5c351bac8ba3e675d73",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
