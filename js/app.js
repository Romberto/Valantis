

window.addEventListener('load', function(){
    const header = document.querySelector('header').clientHeight
    const main = document.querySelector('main')
    main.style.paddingTop = `${header}px`
    const loading = '<p class="text-center spiner">Loading ...</p>'
    const title = document.querySelector('.content h3')
    title.textContent = ``
    const popupBtn = document.querySelector('#popupBtn')
    popupBtn.style.width = `${header-5}px`
    popupBtn.style.height = `${header-5}px`
    const step = 50 // количество элементов на странице


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
        return data.result
    } catch (error) {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(param),
            });
            const data = await response.json();
            console.log('error log',error);
            return data.result
        
    }
    }

    
    // получаем параметр id продуктов

    function get_ids(page){
    let offset = (page - 1) * step
    let limit = 100
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


    // получаем id продуктов для страницы
    async function getProductId(page){
        let data = await fetchData(get_ids(page))
        return data
    }

    // удаляем дубли
    function removeDublecate(arr){
        const uniqueArr = arr.reduce((acc, current) => {
            if (!acc.includes(current)) {
                acc.push(current);
            }
            return acc;
        }, []);
        return uniqueArr
    }


    // получаем продусты

    async function getProducts(products){
        const data = await fetchData(get_items(products))
        return data
    }


    // обновляем список id продуктов и возвращает список id согласно странице

    async function upgradeLocalStorage(page){
        let unicData = []
        let localPage = JSON.parse(localStorage.getItem('localPage'))
        if(localPage){
            if(localPage.length < page * step){
                let ids = await getProductId(page)
                let unitedList = localPage.concat(ids)
                unicData = removeDublecate(unitedList)
                localStorage.setItem('localPage', JSON.stringify(unicData))
                return getListProductid(unicData, page)
            }else{
                return getListProductid(localPage, page)
            }
        }else{
            let ids = await getProductId(page)
            unicData = removeDublecate(ids)
            localStorage.setItem('localPage',JSON.stringify(unicData))
            return getListProductid(unicData, page)  
        }
    }

    // проверка на последнюю страницу

    


    // возвращает список id согласно выбранной странице

    function getListProductid(arr, page){
        let offset = (page- 1) * step
        let limit = step * page
        nextPage = arr.slice(offset, limit+1 )
        return {'nextPage': nextPage > 50 ? true : false, 'pageList': arr.slice(offset, limit )}
    }



    // отоброжает список продуктов

    async function renderContent(page){
        const pag = document.querySelector('.pagination')
        pag.innerHTML = ''
        let idsList = await upgradeLocalStorage(page)
        let data = await getProducts(idsList.pageList)
        await renderPagination(page, idsList.nextPage)
        const listProduct = document.querySelector('#list')
        html = data.map(toHTMLProduct).join('')
        listProduct.innerHTML = html
        
        
    }


    // возвращает строку html для карточки продукта

    function toHTMLProduct(product){
        return `<li class="card product-card mb-2 me-1" style="width: 18rem;">
        <div class="card-body">
          <h5 class="card-title">${product.product}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">${product.brand ? product.brand : 'бренд не указан'}</h6>
          <p class="card-text text-center">${product.price}</p>
          <p class="card-text">${product.id}</p>
        </div>
      </li>`
    }
    


    // спинер загрузки

    function spinerLoading(){
        
        const list = document.querySelector('#list')
        list.innerHTML = loading
    }

    // пагинация


    async function renderPagination(page, nextPage){
        const pagination = document.querySelector('.pagination')
        if(!nextPage){
            if (page === 1){
                pHtml = `
                <li class="page-item"><a class="page-link page-number active" href="#" data-page="1">1</a></li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="2">2</a></li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="3">3</a></li>
                <li class="page-item">
                    <a class="page-link next" href="#" aria-label="Next" data-active="${page}">
                        &raquo;
                    </a>
                </li>
                `  
            }else{
                pHtml = 
            `   <li class="page-item">
                    <a class="page-link prev" href="#" aria-label="Previous" data-active="${page}">
                    &laquo;
                    </a>
                </li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="${page-1}">${page-1}</a></li>
                <li class="page-item"><a class="page-link page-number active" href="#" data-page="${page}">${page}</a></li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="${page+1}">${page+1}</a></li>
                <li class="page-item">
                    <a class="page-link next" href="#" aria-label="Next" data-active="${page}">
                        &raquo;
                    </a>
                </li>`
            }
        }else{
                pHtml = `<li class="page-item">
                    <a class="page-link prev" href="#" aria-label="Previous" data-active="${page}">
                    &laquo;
                    </a>
                </li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="${page-2}">${page-2}</a></li>
                <li class="page-item"><a class="page-link page-number" href="#" data-page="${page-1}">${page-1}</a></li>
                <li class="page-item"><a class="page-link page-number active" href="#" data-page="${page}">${page}</a></li>
                `
        }
        

        pagination.innerHTML = pHtml
    }

    

    async function start(page=1){
        spinerLoading()
        await renderContent(page)
        
    }


    async function startBrand(){
        const brands = await getBrands()
        renderBrands(brands)
    }


    // обрабатывает клики по кнопкам пагинации номера страниц

    function clickator(){
        document.addEventListener('click', function(e){
            if(e.target.classList.contains('page-number')){
                if(e.target.classList.contains('active')){
                    e.preventDefault()
                }else{
                    let id = parseInt(e.target.dataset.page)
                    start(id)
                } 
            }
        })
    }

    function pageNext(){
        let pagination = document.querySelector('.next')
        let dataPage = parseInt(pagination.dataset.active) 
        start(dataPage + 1)
        
        
    }

    function pagePrev(){
        let pagination = document.querySelector('.prev')
        let dataPage = parseInt(pagination.dataset.active) 
        start(dataPage - 1)
    }

 


    // обрабатывыет клик по кнопкам next, prev и фильтры

    function rowClicator(){
        document.addEventListener('click', function(e){
            if(e.target.classList.contains('next')){
                pageNext()
            }else if(e.target.classList.contains('prev')){
                pagePrev()
            }else if(e.target.classList.contains('filters__link')){
                clickFilter(e)
            }else if(e.target.classList.contains('filter__page')){
                const page = e.target.dataset.page
                spinerLoading()
                renderFilterProduct(parseInt(page))
            }else if (e.target.classList.contains('filter__page_next')){
                const page = parseInt(e.target.dataset.active) + 1
                spinerLoading()
                renderFilterProduct(parseInt(page))

            }else if (e.target.classList.contains('filter__page_prev')){
                const page = parseInt(e.target.dataset.active) - 1
                spinerLoading()
                renderFilterProduct(parseInt(page))
            }
        })
    }

        // ФИЛЬТРЫ

        function get_fields(){
            return {
                "action": "get_fields",
                "params": {"field": "brand"}
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
        
    
        // фозвращает название брендов для фильтра
    
        async function getBrands(){
            const fields = await fetchData(get_fields())
            brands = []
            for (let item of fields){
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


         function closeFilters(){
            let itemsFilter = document.querySelectorAll('.filtres__price')
            for (let item of itemsFilter){
                item.classList.add('hidden')
                item.parentNode.classList.remove('filter_selected')
            }
         }

         // открывает инпут для ввода фильтра

        function clickFilter(event){
            closeFilters()
            filterInput = undefined
            const parent = event.target.parentNode
            parent.classList.add('filter_selected')
            if(event.target.id === 'btnPrice'){
                filterInput = document.querySelector('#price')
                filterInput.classList.remove('hidden')
            }else if(event.target.id === 'btnName'){
                filterInput = document.querySelector('#name')
                filterInput.classList.remove('hidden')
            }
        }


        function titleFilter(val){
            const title = document.querySelector('.content h3')
            title.textContent = `Фильтр ${val}`
        }


        // инициализирует фильтрацию и разбивает результат на страницы

        async function filterGo(){
            let products = [] // список id по запросу фильтрации 
            let unicProducts = []  // список избавленный от возможных дублей
            
            document.addEventListener('click',async function(e){
                let input =undefined
                if(e.target.id ==='jsFilterPrice'){  // если фильтр по цене
                    input = document.querySelector('#price__input')
                    let price_value = input.value
                    input.value = ''
                    closeFilters()
                    products = await fetchData(paramFilter('price', parseInt(price_value)))
                    if(!products){
                        const contentListProduct = document.querySelector('#list')
                        contentListProduct.innerHTML = '<p> нет данных ...</p>'
                    }else{
                        closePopup()
                        spinerLoading()
                        
                        titleFilter(`по цене ${price_value}`)
                        unicProducts = removeDublecate(products)
                        splitIntoPages(unicProducts)
                        await renderFilterProduct()
                        
                }
                }
                else if(e.target.id ==='jsFilterName'){  // если фильтр по имени
                    input = document.querySelector('#name__input')
                    let name_value = input.value
                    input.value = ''
                    closeFilters()
                    products = await fetchData(paramFilter('product', name_value))
                    if(!products){
                        const contentListProduct = document.querySelector('#list')
                        contentListProduct.innerHTML = '<p> нет данных ...</p>'
                    }else{
                        titleFilter(`по названию ${name_value}`)
                        closePopup()
                        spinerLoading()
                        unicProducts = removeDublecate(products)
                        splitIntoPages(unicProducts)
                        await renderFilterProduct()
                }
                }
                
            })
            const select = document.querySelector('#selectBrand')  // фильтр по бренду
            select.addEventListener('change',async function(event){
                closePopup()
                spinerLoading()
                let change = event.target.value
                titleFilter(`по бренду ${change}`)
                products = await fetchData(paramFilter('brand', change))
                unicProducts = removeDublecate(products)
                splitIntoPages(unicProducts)
                await renderFilterProduct()
            })
        } 
    

     // сохраняет страницы с отфильтрованными страницами в localStorage

    function splitIntoPages(arr){
        let page = 1
        let productsList = []
        let result = {}
        result[page] = []
        for(let item of arr){
            if (result[page].length >= 50){
                productsList = []
                page++
                productsList.push(item)
                result[page]=productsList
            }else{
                result[page].push(item)
            }
        }
        localStorage.setItem('filterPages', JSON.stringify(result))
    }


    // получаем страницы для погинации

    function getNeighbors(list, page) {
        const neighbors = [];
        const length = list.length;
        if (length < 4){
            for(let i = 0; i < 3 ; i++ ){
                if(list[i]){
                    neighbors.push(list[i])
                }
            }
            return neighbors
        }else{
            if(page === 1){
                return [1,2,3]
            }else if(page === length){
                return [length-2, length-1, length] 
            }else{
                return [page-1, page, page+1]
            }    
        } 
    }


    // рендер страницы с отфильтрованными товарами

    async function renderFilterProduct(page=1){
        const pag = document.querySelector('.pagination')
        pag.innerHTML = ''
        const listProduct = document.querySelector('#list')
        let filterPages = JSON.parse(localStorage.getItem('filterPages'))
        let countFilterPage = Object.keys(filterPages)
        let products = await fetchData(get_items(filterPages[page]))
        let neighbors = getNeighbors(countFilterPage, page)
        html = products.map(toHTMLProduct).join('')
        listProduct.innerHTML = html
        renderfilterPagination(neighbors, page)
    }

    // рендер пагинации для отфильтрованных товаров

    function renderfilterPagination(pages, page){
        let pagination = document.querySelector('.pagination')
        let html = ``
        let intPage = parseInt(page)
        if(intPage != 1){
            html += `
                <li class="page-item">
                    <a class="page-link filter__page_prev" href="#" aria-label="Previous" data-active="${page}">
                    &laquo;
                    </a>
                </li>`
        }
        for (let item of pages){
            if(intPage === parseInt(item)){
                html += `<li class="page-item"><a class="page-link active filter__page" href="#" data-page="${item}">${item}</a></li>`
            }else{
                html += `<li class="page-item"><a class="page-link filter__page" href="#" data-page="${item}">${item}</a></li>`
            }
        }
        if(pages.length != intPage){
            html += `
                <li class="page-item">
                    <a class="page-link filter__page_next" href="#" aria-label="Next" data-active="${page}">
                        &raquo;
                    </a>
                </li>
            `
        }
        pagination.innerHTML = html
    }


    // открывает попап фильтров

    function menuPopup(){
        popupBtn.addEventListener('click', function(e){
            e.preventDefault()
            const filterPopup = document.querySelector('.filters__wrapper')
            filterPopup.classList.toggle('visible')
        })

    }


    // закрывает поппап фильтры

    function closePopup(){
        const filterPopup = document.querySelector('.filters__wrapper')
        filterPopup.classList.remove('visible')
    }

    function clickCloseBtnPopup(){
        const btn = document.querySelector('.closePopup')
        btn.addEventListener('click', (e)=>{
            closePopup()
        })
    }
    
    function defaultMain(){
        start()
        startBrand()
        clickator()
        rowClicator()
        filterGo()
        menuPopup()
        clickCloseBtnPopup()
    }



    
    defaultMain()
    
})