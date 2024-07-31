
class ProductDetailsGellary extends HTMLElement{
  constructor() {
    super()
    this.scrollSliderSelector = `.${this.dataset.scrollSelector}`
    this.thumbSliderSelector = `.${this.dataset.thumbSelector}`
    
    this.thumbSlideType = this.dataset.slideType
    this.scrollSliderDirection = this.dataset.direction
    this.verticalSlideMarginBottom = 8

    this.scrollSlider = null
    this.thumbSlider = null

    this.initScrollSlider()
    this.initThumbSlider()

    if(this.scrollSliderDirection==='vertical' && screen.width > 768) this.querySelector(this.scrollSliderSelector).style.height = this.querySelector(this.thumbSliderSelector).clientHeight + 'px'
  }

  initScrollSlider() {
    this.scrollSlider = new Swiper(this.scrollSliderSelector, {
      slidesPerView:  screen.width > 768 ? this.scrollSliderDirection==='vertical' ? 'auto': 6 : 6,
      spaceBetween: this.verticalSlideMarginBottom,
      direction: screen.width > 768 ? this.scrollSliderDirection : 'horizontal',
    })
  }

  initThumbSlider() {
    this.thumbSlider = new Swiper(this.thumbSliderSelector, {
      slidesPerView: 1,
      effect: this.thumbSlideType,
      autoHeight: true,
      pagination: {
       el: '.swiper-pagination',
       clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      thumbs: {
        swiper: this.scrollSlider,
      }
    })
  }
}
customElements.define("pd-gellary", ProductDetailsGellary)

class QuantitySelector extends HTMLElement{
  constructor() {
    super()
    this.querySelectorAll("button").forEach(btn => btn.addEventListener("click", this.handleQtyButton.bind(this)))
    this.qty_input = this.querySelector("input")
  }

  handleQtyButton(e) {
    let value = parseInt(e.currentTarget.dataset.value),
        current_value = parseInt(this.qty_input.value) + value
    current_value < 1 ? current_value = 1 : current_value
    this.qty_input.value = current_value
  }
}
customElements.define("quantity-selector", QuantitySelector)


class ProductVariant extends HTMLElement{
  constructor() {
    super()
    this.sectionId = this.dataset.sectionId
    this.productId = this.dataset.productId
    this.swiperClass = `.swiper-${this.productId}-${this.sectionId}`
    this.section = document.querySelector(`#shopify-section-${this.sectionId}`)

    this.getVariantData()
    this.getAllSlide()

    this.sliderElement = this.section.querySelector("pd-gellary")
    
    this.form = this.querySelector("form")
    this.form?.addEventListener("input", this.handleInputEvents.bind(this))
  }

  getAllSlide() {
    this.slidesEl = document.querySelectorAll(".pd-thumb-swiper .swiper-slide")
    this.slidesArr = []
    this.slidesEl.forEach(slide => {
       this.slidesArr = [...this.slidesArr, {
         index: parseInt(slide.dataset.index),
         src: slide.dataset.src
       }]
    })
  }
  
  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]')?.textContent);
  }
  
  handleInputEvents(e) {
    this.updateOptions()
    this.updateMasterId()
    this.updateURL()
    this.renderProductInfo()
    this.updateSlide()
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('.pd-variant-field'), (element) => {
        return Array.from(element.querySelectorAll('input')).find((radio) => radio.checked)?.value;
    });
  }

  updateMasterId() {
    this.currentVariant = this.variantData.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }
  
  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  
  updateSlide() {
    if(this.currentVariant && this.currentVariant.featured_image) {
      let variant = this.slidesArr.find(item => this.currentVariant.featured_image.src.includes(item.src))
      // let variant = this.slidesArr.find(item => item.src ===  this.currentVariant.featured_image.src)
      if(variant) this.sliderElement.thumbSlider.slideTo(variant.index)
    }
  }
  
  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;  
    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.sectionId}`
    )
    .then((response) => response.text())
    .then((responseText) => {
      if (this.currentVariant.id !== requestedVariantId || this.section === null) return;
      
      const html = new DOMParser().parseFromString(responseText, 'text/html');
      if(this.section.querySelector(".pd-variant-wrapper")) this.section.querySelector(".pd-variant-wrapper").innerHTML = html.querySelector(".pd-variant-wrapper").innerHTML
      if(this.section.querySelector(".pd-product-price")) this.section.querySelector(".pd-product-price").innerHTML = html.querySelector(".pd-product-price").innerHTML
      if(this.section.querySelector(".pd-product-stock")) this.section.querySelector(".pd-product-stock").innerHTML = html.querySelector(".pd-product-stock").innerHTML
      if(this.section.querySelector(".pd-current-variant-id")) this.section.querySelector(".pd-current-variant-id").innerHTML = html.querySelector(".pd-current-variant-id").innerHTML
      if(this.section.querySelector(".pd-atc-button-wrapper")) this.section.querySelector(".pd-atc-button-wrapper").innerHTML = html.querySelector(".pd-atc-button-wrapper").innerHTML

    })
    .catch(err => console.log(err))
    .finally(() => {
      // initQuickAddProduct()
      customFormSubmit()
      custom_buy_now()
    })
  }
}

customElements.define("pd-variant", ProductVariant)

window.custom_buy_now = () => {
  document.querySelector('#buy_now').addEventListener('click', (e) => {
    var buynowform = document.querySelector(".shopify-product-form")
  
    var buynowinput = document.createElement('input')
    buynowinput.value="/cart/checkout"
    buynowinput.type = "hidden"
    buynowinput.name="return_to"
  
    buynowform.appendChild(buynowinput)
    buynowform.submit()
  })
}
custom_buy_now()


// Accordion
class Accordion {
  constructor(accordion = '', newOptions) {
      let options = {
          initOpenIndex: 1,
          closeAll: false,
          duration: 400,
          activeClass: 'active'
      }
      this.options = { ...options, ...newOptions }
      this.handleValidAccordions(accordion)
  }

  handleValidAccordions(accordion) {
      if (accordion.length > 1)
          this.accordion = document.querySelector(accordion)
      else return

      this.setIconsTransition()
      this.tabItemsArray = Array.from(this.accordion.children);
      
      if(this.tabItemsArray.length > 0) {
          if(this.options.initOpenIndex > this.tabItemsArray.length) this.options.initOpenIndex = this.tabItemsArray.length
      }

      this.tabItemsArray?.forEach((tabElement, index, arr) => {
          let item = this.handleAccordionItems(tabElement)
          this.contentInitialHeight(item[1])
          if (index === this.options.initOpenIndex - 1) this.InitialOpen(arr[index])
          this.handleAccordion(item, index)
      })
  }

  setIconsTransition() {
      if (this.accordion?.querySelectorAll("svg")) {
          this.accordion?.querySelectorAll("svg").forEach(svg => svg.style.transition = `${this.options.duration}ms`)
      }
  }

  contentInitialHeight(content) {
      content.style.height = "0px"
      content.style.overflow = 'hidden'
  }

  handleAccordion(item, index) {
      item[0].addEventListener('click', e => {
          this.toggle(item)
          this.currentIndex = index
          if (this.options.closeAll) this.closeAll()
      })
  }

  handleAccordionItems(accordion) {
      if (accordion.children.length == 2) {
          let title = accordion.children[0]
          let content = accordion.children[1]
          return [title, content]
      }
  }

  InitialOpen(accordion) {
      let item = this.handleAccordionItems(accordion)
      this.setActiveClass(item)
      this.open(item)
  }

  open(item) {
      let content = item[1]
      this.transition(content)
      content.style.height = `${content.scrollHeight}px`
  }

  close(item) {
      let content = item[1]
      content.style.height = `${0}px`
  }

  toggle(item) {
      let content = item[1]
      let height = content.clientHeight
      this.transition(content)
      height == 0 ? (this.setActiveClass(item), content.style.height = `${content.scrollHeight}px`) : (this.removeActiveClass(item), content.style.height = "0px")
  }

  transition(el) {
      el.style.transition = `all ${this.options.duration}ms ease`
  }

  closeAll() {
      this.tabItemsArray?.forEach((accordion, index, arr) => {
          let item = this.handleAccordionItems(accordion)
          if (index !== this.currentIndex) (this.close(item), this.removeActiveClass(item))
      })
  }

  setActiveClass(item) {
      item[1].parentElement.classList.add(this.options.activeClass)
  }
  removeActiveClass(item) {
      item[1].parentElement.classList.remove(this.options.activeClass)
  }
}
