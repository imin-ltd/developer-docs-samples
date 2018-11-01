// Mock API loader and runner
function mockApi(map, callback) {
  var promises = Object
    .entries(map)
    .map(
      ([key, file]) =>
      fetch(file, {
        headers: file.indexOf('sandbox.imin.co') > -1 ? {
          'X-API-KEY': '4a96422d55a1b768ad40e1bdebda763b',
          'Accept': 'application/ld+json'
        } : {
          'Accept': 'application/ld+json'
        },
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        credentials: 'omit',
        cache: 'no-cache'
      })
      .then(response => response.json())
      .then(data => [key, data])
    );

  window.onload = Promise.all(promises)
  	.then(values => new Map(values))
    .then(callback);
}

// For examples allows writing to the page in a standard format
function write(div, title, value) {
  $('#' + div).append('<p class="small">' + title + '</p><p>' + value + '</p>');
}

// Gets an id -> name mapping for all subClasses and enums from meta
function getEnumMap(metaJson) {
  const items = JSPath.apply('."imin:index"(.subClass | .enumeration).."imin:item"', metaJson);
  return new Map(items.map(i => [i.id, i.name]));
}

function enumMapperFactory(metaJson) {
	const enumIndex = getEnumMap(metaJson);
  return array => enumIndex.get(array);
}

// Fills out the data based on the compacted imin:locationSummary representation
// used in /event-series/:id, to match the same structure as search results in /event-series?
function augmentLocations(data) {
  const locationSummaryMap = new Map(JSPath.apply('."imin:locationSummary"', data).map(i => [i.id, i]));
  JSPath.apply('.subEvent', data).forEach(sessionSeries => {
    var id = JSPath.apply('.location.id[-1]', sessionSeries);
    if (locationSummaryMap.has(id)) {
      sessionSeries.location = locationSummaryMap.get(id);
    }
  });
  return data;
}

function uniq(array) {
   return Array.from(new Set(array));
}
