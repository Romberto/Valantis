window.addEventListener('load',async function(){

    let list = document.querySelector('#list')
    let pagination = document.querySelector('.pagination')
    list.innerHTML = '<p class="text-light text-center">Loading...</p>'
    const paginationStep = 50
    let titleFilter = document.querySelector('#content h3')
   
    const headerHeigth = document.querySelector('header').clientHeight
    const main = document.querySelector('main')
    main.style.paddingTop = `${headerHeigth}px`

    start()

    



    // открыть строку фильтрации по цене или имени
    const filtersBtn = document.querySelectorAll('.filters__link')
    for(let item of filtersBtn){
      item.addEventListener('click', function(e) {
        removeActiveClass()
        e.preventDefault()
        if(item.id === 'btnPrice'){
          document.querySelector('#price').classList.toggle('active');
        }else if (item.id === 'btnName'){
          document.querySelector('#name').classList.toggle('active');
        }
      });
    }

    
    
  
    // клик по кнопке фильтровать 

    document.addEventListener('click',async function(event){
      if(event.target.classList.contains('price__btn')){
        let inputValue = document.querySelector('#price__input').value;
        if(inputValue){
          list.innerHTML = '<p class="text-light text-center">Loading...</p>'
          pagination.innerHTML = ''
          titleFilter.innerHTML = ''
          const block = document.querySelector('#price').classList.remove('active')
          document.querySelector('.price__input').value = '';
          await apiFelteredRequest('price', parseFloat(inputValue))
        }

      }else if (event.target.classList.contains('name__btn')){
        let inputValue = document.querySelector('#name__input').value;
        if(inputValue){
          list.innerHTML = '<p class="text-light text-center">Loading...</p>'
          pagination.innerHTML = ''
          titleFilter.innerHTML = ''
          const block = document.querySelector('#name').classList.remove('active')
          document.querySelector('.name__input').value = '';
          await apiFelteredRequest('product', inputValue)
        }
      }
    })


    // событие выбор бренда 

      const select = document.querySelector('#selectBrand')

      select.addEventListener('change',async function(){
        let value = this.value
        if(value){
          list.innerHTML = '<p class="text-light text-center">Loading...</p>'
          pagination.innerHTML = ''
          titleFilter.innerHTML = ''
          document.querySelector('#selectBrand').value = 'по бренду'
          await apiFelteredRequest('brand', value)

        }
        
      })


    


    // пагинация

    document.addEventListener('click', function(event) {
        // кнопки цифры
        if (event.target.classList.contains('number-page')) {
                list.innerHTML = '<p class="text-light text-center">Loading...</p>'
                pagination.innerHTML = ''
                let numberPage = event.target.dataset.page
                start(Number(numberPage))
        // кнопка next       
        }else if(event.target.classList.contains('next')){
            list.innerHTML = '<p class="text-light text-center">Loading...</p>'
            pagination.innerHTML = ''
            let numberPage = (parseInt(event.target.dataset.activepage) + 1)
            start(numberPage)
        // кнопка prev
        }else if(event.target.classList.contains('prev')){
            list.innerHTML = '<p class="text-light text-center">Loading...</p>'
            pagination.innerHTML = ''
            let numberPage = (parseInt(event.target.dataset.activepage) - 1)
            start(numberPage)
        }
      });




    // запрос API

    async function fetchData(param) {
        const password = 'Valantis';
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const authString = CryptoJS.MD5(`${password}_${timestamp}`)
      
        const url = 'https://api.valantis.store:41000/'
        
        const headers = {
          'X-Auth': authString,
          'Content-Type': 'application/json'
        };
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(param),
            });
          const data = await response.json();
          return data
        } catch (error) {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(param),
                });
              const data = await response.json();
              console.log('error log',error);
              return data
            
        }
      }

    


    // получаем параметр id продуктов

      function get_ids(page){
        offset = (page - 1) * paginationStep
        limit = 55
        return {
            "action": "get_ids",
            "params": {"offset": offset, "limit": limit}
        }
      }
    
    
      // функция для получения параметра продуктов по id 
    
      function get_items (ids = []){
          return {
              "action": "get_items",
              "params": {"ids": ids}
          }
      }

    
    //  возвращает список объектов продуктов лишённых дублей

    async function filterDublicateProduct(productList){
        productObj = await fetchData(get_items(productList.result)) // получаем объекты продуктов
        let uniqueObjects = productObj.result.reduce((acc, obj) => {
          if (acc.length >= 50) {
            return acc;
          }
          let existingObj = acc.find((o) => o.id === obj.id);
          if (!existingObj) {
            acc.push(obj);
          }
          return acc;
        }, []);
        return uniqueObjects
    }


  // загрузка страницы
 
    async function start(page=1){
            localStorage.clear();
            const getIDproduct = await fetchData(get_ids(page))
            const products = await filterDublicateProduct(getIDproduct)
            const brands = await getBrands()
            renderBrands(brands)
            renderPage(products, page)
            filteredProductList = []
    }


  // собирает страницу

    function renderPage(products=[], page){
        html = products.map(toHTML).join('')
        const list = document.querySelector('#list')
        list.innerHTML = html
        pagination.innerHTML = renderPagination(page)
    }


    // получаем html для списка продустов

    function toHTML(product){
        return `<li class="card product-card mb-2 me-1" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${product.product}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">${product.brand ? product.brand : 'бренд не указан'}</h6>
          <p class="card-text text-center">${product.price}</p>
          <p class="card-text">${product.id}</p>
        </div>
      </li>`
    }

    
    

    // получаем html пагинации

    function renderPagination(page){
        return `
                ${page == 1 ? '': `<div class="prev btn btn-light" data-activepage="${page}">prev</div>`}
                <div class="number-page btn btn-small ${page == 1 ? 'btn-danger': 'btn-light'} " data-page="${page == 1 ? 1 : page -1}">${page == 1 ? 1 : page - 1}</div>
                <div class="number-page btn btn-small ${page == 1 ? 'btn-light': 'btn-danger'} " data-page="${page == 1 ? 2 : page}">${page == 1 ? 2 : page}</div>
                <div class="number-page btn btn-small btn-light" data-page="${page == 1 ? 3 : page +1 }">${page == 1 ? 3 : page + 1 }</div>
                <div class="next btn btn-light" data-activepage="${page}">next</div>
        `
    }

    

    // ФИЛЬТРЫ

    function get_fields(){
        return {
            "action": "get_fields",
            "params": {"field": "brand"}
        }
         }
    

    // фозвращает название брендов для фильтра

    async function getBrands(){
        const fields = await fetchData(get_fields())
        brands = []
        for (let item of fields.result){
            if(!brands.includes(item) && item != null){
                brands.push(item)
            }
        }
        return brands
     }



     // заполняет елемент select брендами 

     function renderBrands(brands=[]){
        let html = brands.map(toHtmlBrand).join('')
        const select = document.querySelector('#selectBrand')
        select.insertAdjacentHTML('beforeend', html)

     }


     // возвращает html с брендами

     function toHtmlBrand(brand){
      return `<option value="${brand}">${brand}</option>`
     }


     function removeActiveClass(){
      const filtres__price = document.querySelectorAll('.filtres__price')
      for(let i of filtres__price ){
        i.classList.remove('active')
      }
    }


    // формирует параметры запроса к API для фильтров

    function paramFilter(field, value){
      if (field === 'price'){
        return {  "action": "filter",
          "params": {"price": value} }
      }else if (field === 'brand'){
        return {  "action": "filter",
        "params": {"brand": value} }
      }else if (field === 'product'){
        return {  "action": "filter",
        "params": {"product": value} }
      }
        
      
    }



    // запрос к API фильтры

    async function apiFelteredRequest(field, value){
            const getIdsProduct = await fetchData(paramFilter(field, value)) // получаем id по фильтру
            const products = await getNotDublucatProduct(getIdsProduct) // получаем продускы и убераем дубли
            const paggination = await productPaginator(products, 50) // разделяем на страницы
            localStorage.setItem('products', JSON.stringify(paggination)); // сохраняем страницы
            getTitleFilter(field, value)
            renderFilterPage()
            
                     
    }


    // заголовок фильтров

    function getTitleFilter(field, value){
      let title = ''
      
      if (field === 'price'){
        title = `фильтр по цене: ${value}`
      }else if (field === 'brand'){
        title = `фильтр по бренду ${value}`
      }else if (field === 'product'){
        title = `фильтр по цене ${value}`
      }
      let html = `<h3 class="text-center">${title}</h3>`
      document.querySelector('#content h3').innerHTML = html
    }

    // возвращает список объектов лищённых дублей 

    async function getNotDublucatProduct(productList){
      productObj = await fetchData(get_items(productList.result))
      let uniqueObjects = productObj.result.reduce((acc, obj) => {
        let existingObj = acc.find((o) => o.id === obj.id);
        if (!existingObj) {
          acc.push(obj)
        }
        return acc;
      }, []);
      return uniqueObjects
    }



    // разделяет список на страницы 
    async function productPaginator(products , countProduct){
      let result = {}
      let page = 1
      let productsList = []
      for (let i=0; products.length > i; i++  ) 
        if(productsList.length < countProduct){
          productsList.push(products[i])
          result[page] = productsList
        }else{
          result[page] = productsList
          page++
          productsList = [products[i]]
        }
      return result

    }


    // рендер страницы отфильтрованных товаров

    function renderFilterPage(page=1){
      products = JSON.parse(localStorage.getItem('products'));
      countPage = Object.keys(products).length
      if (countPage > 1){
        renderFilterProductList(products[page])
        renderFilterPaginanor(countPage, page)
      }else{
        renderFilterProductList(products[page])
      }
    }


    // вставляет html со списком товаров на страницу

    function renderFilterProductList(products){
      html = products.map(toHTML).join('')
      const list = document.querySelector('#list')
      list.innerHTML = html
    }


    // отрисовывает кнопки пагинации

    function renderFilterPaginanor(countPage, activePage){
      let pagination = document.querySelector('.pagination')
      let html = ``
      if(countPage < 6){
        for (i = 1 ; i < countPage + 1; i++){
          html += `<li class="page-item"><a class="page-link ${ i === activePage ? 'active-page': ''}" href="#">${i}</a></li>`
        }
      }else{
        
      }
      
      pagination.innerHTML = html
      }




});