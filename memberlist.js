$(function() {
    var $container = $('.memberlist:not(.maxposters) .userlist');
    var filters = {};    
    var $filterButtons = $('.filter-group label');
  
    // init Isotope
    $container.isotope({
            itemSelector: '.userlist_profile',
            layoutMode: 'fitRows',

            getSortData: {
                nombre: '.userlist_pseudo',
                playedby: '.sort-pb',
                edad: '.sort-edad parseInt',
                inscripcion: function(itemElem) {
                    var date = $(itemElem).find('.userlist_joined .userlist_content').text().split("/");
                    var parseIso = new Date(parseInt(date[2]),parseInt(date[1])-1,parseInt(date[0])).toISOString();
                    return Date.parse(parseIso);
                },
            },
    });

    // bind filter checkbox click
    $('.memberlist:not(.maxposters) #form-ui').on('change', function(event) {
        var checkbox = event.target;
        var $checkbox = $(checkbox);
        var group = $checkbox.parents('.filter-group').attr('data-group');
        var filterGroup = filters[group];
        if (!filterGroup) {
            filterGroup = filters[group] = [];
        }
        if (checkbox.checked) {
            filterGroup.push(checkbox.value);
        } else {
            var index = filterGroup.indexOf(checkbox.value);
            filterGroup.splice(index, 1);
        }

        var comboFilter = getComboFilter();
        $container.isotope({ filter: comboFilter });
        updateFilterCounts();      
        
    });
    
    // bind sort label click
    $('.memberlist:not(.maxposters) .sort-group').on('click', 'label', function() {
        var sortValue = $(this).attr('data-sort-value');
        $container.isotope('updateSortData').isotope({ sortBy: sortValue });
    });
  
    // change is-checked class on checkbox
    $('.memberlist:not(.maxposters) .sort-group').each(function(i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'label', function() {
             $buttonGroup.find('.is-checked').removeClass('is-checked');
             $(this).addClass('is-checked');
        });
    });
    
    // add filter count 
    function updateFilterCounts()  {
        // get filtered item elements
        var itemElems = $container.isotope('getFilteredItemElements');
        var $itemElems = $(itemElems);
        $filterButtons.each( function(i, label) {
            var $label = $(label);
            var filterValue = $label.children('input').attr('value');
            if (!filterValue) {
                // do not update 'any' buttons
                return;
            }
            var count = $itemElems.filter(filterValue).length;
            $label.find('.filter-count').text(count);
        });
    }

    // create combo filter function
    function getComboFilter() {
        var combo = [];
        for (var prop in filters) {
            var group = filters[prop];
            if (!group.length) {
                continue;
            }
            if (!combo.length) {
                combo = group.slice(0);
                continue;
            }
            var nextCombo = [];
            for (var i = 0; i < combo.length; i++) {
                for (var j = 0; j < group.length; j++) {
                    var item = combo[i] + group[j];
                    nextCombo.push(item);
                }
            }
            combo = nextCombo;
        }
        var comboFilter = combo.join(', ');
        return comboFilter;
    }
    
    // get hash filter
    function getHashFilter() {
        // get filter=filterName
      var matches = location.hash.match(/filter=([^&]+)/i);
      var hashFilter = matches && matches[1];
      return hashFilter && decodeURIComponent(hashFilter);
    }
        
    // create hash filter function
    var isIsotopeInit = false;
    
    var hashFilter = getHashFilter();
    function onHashchange() {
      if (!hashFilter && isIsotopeInit) {
        return;
      }
      isIsotopeInit = true;
      $container.isotope({filter: hashFilter}); 
        
      // set filter in hash    
      $filterButtons.on('click', 'label', function() {;
          var filterAttr = $(this).children('input').attr('value');
          location.hash = 'filter=' + encodeURIComponent(filterAttr);   
      });
        
    }  
    
    $(window).on('hashchange', onHashchange);  
    onHashchange();
        
});
