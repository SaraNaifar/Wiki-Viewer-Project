
/* const $ = window.$   // because $ is a global variable

$('document').ready(function () {
  $('#search').keypress(function (event) {
    if (event.which === 13) {
      event.preventDefault()
      var searchedItem = $('#search').val()

        // the search Input Value

      var input = encodeURI(searchedItem)
        // API url
      var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + input

             // Ajax call
      $.ajax({
        type: 'GET',
        url: url,
        origin: '*',
        dataType: 'jsonp',
        success: function (data) {
          console.log(data)
          $('#output-search').html('')

          var wikihtml = ''
          var title = data[1]
          var content = data[2]
          var link = data[3]

          for (var i = 0; i < title.length; i++) {
            if (title[i] !== undefined) {
              wikihtml += generateHtml(title[i], content[i], link[i])
            }
          }

          $('#output-search').prepend(wikihtml)

                 // SECOND CALL FOR GETTING IMAGES
          var url2 = 'http://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=' + input + '&pithumbsize=250&format=json'

          $.ajax({
            type: 'GET',
            url: url2,
            origin: '*',
            dataType: 'jsonp',
            success: function (data2) {
              console.log(data2)

                       // INSERTION OF HTML / DATA+IMAGES

              var res = data2.query.pages
              console.log(res)
              for (var key in res) {
                var id = res[key].pageid
                if (data2.query.pages[id].thumbnail !== undefined) {
                  var imgUrl = data2.query.pages[id].thumbnail.source

                  $('#img-description').html('<img src="' + imgUrl + '">')
                } else {
                  $('#output-search').prepend(wikihtml)

                  $('#img-description').html('<img src="http://via.placeholder.com/140x100">')
                }
              }
            }

          })
        }

      })
    }
  })

  function generateHtml (title, content, link) {
    var outputHtml = ('<div class="container-cards"><div class="card"><h3 class="card-header"><a href=":wikiLinkTitle" target="_blank">:wikiTitle</a></h3><div class="card-block"><div class="card-text row mb-1"><div id="img-description" class="col-md-4" ></div><div class="col-md-8"><p>:wikiContent</p></div></div><a href=":wikiLinkButton" class="btn btn-primary buttonLink" target="_blank">Read more</a></div></div></div><hr>')
    outputHtml = outputHtml.replace(':wikiLinkTitle', link)
    outputHtml = outputHtml.replace(':wikiTitle', title)
    outputHtml = outputHtml.replace(':wikiContent', content)
    outputHtml = outputHtml.replace(':wikiLinkButton', link)
    // outputHtml = outputHtml.replace(':wikiImg',image);

    return outputHtml
  }
}) */
const $ = window.$
const API_URL = 'https://en.wikipedia.org/w/api.php?callback=?'

// returns the image of a result or a placeholder image instead
function getImage (obj) {
  if (obj.thumbnail && obj.thumbnail.source) {
    return obj.thumbnail.source
  }
  return 'images/placeholder2.png'
}

function fetchData (term, success) {
  $.getJSON(API_URL, {
    action: 'query',
    format: 'json',
    inprop: 'url',
    formatversion: 2,
    prop: 'extracts|pageimages|info',
    generator: 'search',
    gsrsearch: term,
    gsrwhat: 'text',
    piprop: 'thumbnail',
    pilimit: 'max',
    pithumbsize: 200,
    exsentences: 3,
    exintro: '',
    explaintext: '',
    exlimit: 10
  }, success)
}

function createResultElt (obj) {
  return `<div class="container-cards">
    <div class="card">
    <h3 class="card-header">
    <a href="${obj.title}" target="_blank">${obj.title}</a></h3>
    <div class="card-block"><div class="card-text row mb-1">
    <div id="img-description" class="col-md-4" ><img src=${obj.image}></div>
    <div class="col-md-8"><p>${obj.snippet}</p>
    </div></div>
    <a href="${obj.title}"
    class="btn btn-primary buttonLink" target="_blank">Read more</a>
    </div></div>
    </div><hr>`
}

function updateUI (results) {
  let $resultList = $('#output-search')
  let resultElements = results.map(createResultElt)
  $resultList.html(resultElements.join(''))
}

$(document).ready(function () {
  let $searchInput = $('#search')
  // let $searchButton = $('.search-button')

  function doSearch () {
    let term = $searchInput.val()

    if (term.trim() === '') {
      return
    }

    fetchData(term, function success (data) {
      console.log(data)
      let rawResults = data.query.pages

      let results = rawResults.map(function (obj) {
        return {
          title: obj.title,
          url: obj.fullurl,
          image: getImage(obj),
          snippet: obj.extract
        }
      })

      $searchInput.val('')
      updateUI(results)
    })
  }

  $searchInput.keyup(function (event) {
    if (event.key == 'Enter') {
      doSearch()
    }
  })
})
