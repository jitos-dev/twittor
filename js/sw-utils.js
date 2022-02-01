
function actualizaCacheDinamico(dynamicCache, req, res) {
  
  //Si la res.ok es true es que hay data que almacenar en el cache
  if (res.ok) {
    return caches.open(dynamicCache).then(cache => {
      cache.put(req, res.clone());
      return res.clone();
    });
  } else {
    //si entra en este es porque fallo el cache e internet (404 u otro error). Devolvemos la respuesta
    //aunque sea con fallo para tratarlo en la página donde lo utilicemos
    return res;
  }
}