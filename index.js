const body = document.querySelector("body"),
      nav = document.querySelector("nav"),
      modeToggle = document.querySelector(".dark-light"),
      searchToggle = document.querySelector(".searchToggle"),
      sidebarOpen = document.querySelector(".sidebarOpen"),
      siderbarClose = document.querySelector(".siderbarClose");

      let getMode = localStorage.getItem("mode");
          if(getMode && getMode === "dark-mode"){
            body.classList.add("dark");
          }

// js code to toggle dark and light mode
      modeToggle.addEventListener("click" , () =>{
        modeToggle.classList.toggle("active");
        body.classList.toggle("dark");

        // js code to keep user selected mode even page refresh or file reopen
        if(!body.classList.contains("dark")){
            localStorage.setItem("mode" , "light-mode");
        }else{
            localStorage.setItem("mode" , "dark-mode");
        }
      });

// js code to toggle search box
        searchToggle.addEventListener("click" , () =>{
        searchToggle.classList.toggle("active");
      });
 
      
//   js code to toggle sidebar
sidebarOpen.addEventListener("click" , () =>{
    nav.classList.add("active");
});

body.addEventListener("click" , e =>{
    let clickedElm = e.target;

    if(!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")){
        nav.classList.remove("active");
    }
});

/*
  More about this function - 
  https://codepen.io/rachsmith/post/animation-tip-lerp
*/
function lerp({ x, y }, { x: targetX, y: targetY }) {
    const fraction = 0.1;
    
    x += (targetX - x) * fraction;
    y += (targetY - y) * fraction;
    
    return { x, y };
  }
  
  class Slider {
    constructor (el) {
      const imgClass = this.IMG_CLASS = 'slider__images-item';
      const textClass = this.TEXT_CLASS = 'slider__text-item';
      const activeImgClass = this.ACTIVE_IMG_CLASS = `${imgClass}--active`;
      const activeTextClass = this.ACTIVE_TEXT_CLASS =  `${textClass}--active`;
      
      this.el = el;
      this.contentEl = document.getElementById('slider-content');
      this.onMouseMove = this.onMouseMove.bind(this);
      
      // taking advantage of the live nature of 'getElement...' methods
      this.activeImg = el.getElementsByClassName(activeImgClass);
      this.activeText = el.getElementsByClassName(activeTextClass);
      this.images = el.getElementsByTagName('img');
      
      document.getElementById('slider-dots')
        .addEventListener('click', this.onDotClick.bind(this));
      
      document.getElementById('left')
        .addEventListener('click', this.prev.bind(this));
      
      document.getElementById('right')
        .addEventListener('click', this.next.bind(this));
      
      window.addEventListener('resize', this.onResize.bind(this));
      
      this.onResize();
      
      this.length = this.images.length;
      this.lastX = this.lastY = this.targetX = this.targetY = 0;
    }
    onResize () {
      const htmlStyles = getComputedStyle(document.documentElement);
      const mobileBreakpoint =  htmlStyles.getPropertyValue('--mobile-bkp');
      
      const isMobile = this.isMobile = matchMedia(
        `only screen and (max-width: ${mobileBreakpoint})`
      ).matches;
      
      this.halfWidth = innerWidth / 2;
      this.halfHeight = innerHeight / 2;
      this.zDistance = htmlStyles.getPropertyValue('--z-distance');
      
      if (!isMobile && !this.mouseWatched) {
        this.mouseWatched = true;
        this.el.addEventListener('mousemove', this.onMouseMove);
        this.el.style.setProperty(
          '--img-prev', 
          `url(${this.images[+this.activeImg[0].dataset.id - 1].src})`
        );
        this.contentEl.style.setProperty('transform', `translateZ(${this.zDistance})`);
      } else if (isMobile && this.mouseWatched) {
        this.mouseWatched = false;
        this.el.removeEventListener('mousemove', this.onMouseMove);
        this.contentEl.style.setProperty('transform', 'none');
      }
    }
    getMouseCoefficients ({ pageX, pageY } = {}) {
      const halfWidth = this.halfWidth;
      const halfHeight = this.halfHeight;
      const xCoeff = ((pageX || this.targetX) - halfWidth) / halfWidth;
      const yCoeff = (halfHeight - (pageY || this.targetY)) / halfHeight;
      
      return { xCoeff,  yCoeff }
    }
    onMouseMove ({ pageX, pageY }) {   
      this.targetX = pageX;
      this.targetY = pageY;
      
      if (!this.animationRunning) {
        this.animationRunning = true;
        this.runAnimation();
      }
    }
    runAnimation () {
      if (this.animationStopped) {
        this.animationRunning = false;
        return;
      }
      
      const maxX = 10;
      const maxY = 10;
      
      const newPos = lerp({
        x: this.lastX,
        y: this.lastY
      }, {
        x: this.targetX,
        y: this.targetY
      });
      
      const { xCoeff, yCoeff } = this.getMouseCoefficients({
        pageX: newPos.x, 
        pageY: newPos.y
      });
        
      this.lastX = newPos.x;
      this.lastY = newPos.y;
  
      this.positionImage({ xCoeff, yCoeff });
      
      this.contentEl.style.setProperty('transform', `
        translateZ(${this.zDistance})
        rotateX(${maxY * yCoeff}deg)
        rotateY(${maxX * xCoeff}deg)
      `);
      
      if (this.reachedFinalPoint) {
        this.animationRunning = false;
      } else {
        requestAnimationFrame(this.runAnimation.bind(this)); 
      }
    }
    get reachedFinalPoint () {
      const lastX = ~~this.lastX;
      const lastY = ~~this.lastY;
      const targetX = this.targetX;
      const targetY = this.targetY;
      
      return (lastX == targetX || lastX - 1 == targetX || lastX + 1 == targetX) 
          && (lastY == targetY || lastY - 1 == targetY || lastY + 1 == targetY);
    }
    positionImage ({ xCoeff, yCoeff }) {
      const maxImgOffset = 1;
      const currentImage = this.activeImg[0].children[0];
      
      currentImage.style.setProperty('transform', `
        translateX(${maxImgOffset * -xCoeff}em)
        translateY(${maxImgOffset * yCoeff}em)
      `);  
    }
    onDotClick ({ target }) {
      if (this.inTransit) return;
      
      const dot = target.closest('.slider__nav-dot');
      
      if (!dot) return;
      
      const nextId = dot.dataset.id;
      const currentId = this.activeImg[0].dataset.id;
      
      if (currentId == nextId) return;
      
      this.startTransition(nextId);
    }
    transitionItem (nextId) {
      function onImageTransitionEnd (e) {
        e.stopPropagation();
        
        nextImg.classList.remove(transitClass);
        
        self.inTransit = false;
        
        this.className = imgClass;
        this.removeEventListener('transitionend', onImageTransitionEnd);
      }
      
      const self = this;
      const el = this.el;
      const currentImg = this.activeImg[0];
      const currentId = currentImg.dataset.id;
      const imgClass = this.IMG_CLASS;
      const textClass = this.TEXT_CLASS;
      const activeImgClass = this.ACTIVE_IMG_CLASS;
      const activeTextClass = this.ACTIVE_TEXT_CLASS;
      const subActiveClass = `${imgClass}--subactive`;
      const transitClass = `${imgClass}--transit`;
      const nextImg = el.querySelector(`.${imgClass}[data-id='${nextId}']`);
      const nextText = el.querySelector(`.${textClass}[data-id='${nextId}']`);
      
      let outClass = '';
      let inClass = '';
  
      this.animationStopped = true;
      
      nextText.classList.add(activeTextClass);
      
      el.style.setProperty('--from-left', nextId);
      
      currentImg.classList.remove(activeImgClass);
      currentImg.classList.add(subActiveClass);
      
      if (currentId < nextId) {
        outClass = `${imgClass}--next`;
        inClass = `${imgClass}--prev`;
      } else {
        outClass = `${imgClass}--prev`;
        inClass = `${imgClass}--next`;
      }
      
      nextImg.classList.add(outClass);
      
      requestAnimationFrame(() => {
        nextImg.classList.add(transitClass, activeImgClass);
        nextImg.classList.remove(outClass);
        
        this.animationStopped = false;
        this.positionImage(this.getMouseCoefficients());
        
        currentImg.classList.add(transitClass, inClass);
        currentImg.addEventListener('transitionend', onImageTransitionEnd);
      });
  
      if (!this.isMobile)
        this.switchBackgroundImage(nextId);
    }
    startTransition (nextId) {
      function onTextTransitionEnd(e) {
        if (!e.pseudoElement) {
          e.stopPropagation();
  
          requestAnimationFrame(() => {
            self.transitionItem(nextId);
          });
  
          this.removeEventListener('transitionend', onTextTransitionEnd);
        }
      }
      
      if (this.inTransit) return;
  
      const activeText = this.activeText[0];
      const backwardsClass = `${this.TEXT_CLASS}--backwards`;
      const self = this;
      
      this.inTransit = true;
      
      activeText.classList.add(backwardsClass);
      activeText.classList.remove(this.ACTIVE_TEXT_CLASS);
      activeText.addEventListener('transitionend', onTextTransitionEnd);
      
      requestAnimationFrame(() => {
        activeText.classList.remove(backwardsClass);
      });
    }
    next () {
      if (this.inTransit) return;
      
      let nextId = +this.activeImg[0].dataset.id + 1;
      
      if (nextId > this.length)
          nextId = 1;
      
      this.startTransition(nextId);
    }
    prev () {
      if (this.inTransit) return;
      
      let nextId = +this.activeImg[0].dataset.id - 1;
      
      if (nextId < 1)
          nextId = this.length;
      
      this.startTransition(nextId);
    }
    switchBackgroundImage (nextId) {
      function onBackgroundTransitionEnd (e) {
        if (e.target === this) {
          this.style.setProperty('--img-prev', imageUrl);
          this.classList.remove(bgClass);
          this.removeEventListener('transitionend', onBackgroundTransitionEnd);
        }
      }
  
      const bgClass = 'slider--bg-next';
      const el = this.el;
      const imageUrl = `url(${this.images[+nextId - 1].src})`;
      
      el.style.setProperty('--img-next', imageUrl);
      el.addEventListener('transitionend', onBackgroundTransitionEnd);
      el.classList.add(bgClass);
    }
  }
  
  const sliderEl = document.getElementById('slider');
  const slider = new Slider(sliderEl);
  
  // ------------------ Demo stuff ------------------------ //
  
  let timer = 0;
  
  function autoSlide () {
    requestAnimationFrame(() => {
      slider.next();
    });
    
    timer = setTimeout(autoSlide, 5000);
  }
  
  function stopAutoSlide () {
    clearTimeout(timer);
    
    this.removeEventListener('touchstart', stopAutoSlide);
    this.removeEventListener('mousemove', stopAutoSlide);  
  }
  
  sliderEl.addEventListener('mousemove', stopAutoSlide);
  sliderEl.addEventListener('touchstart', stopAutoSlide);
  
  timer = setTimeout(autoSlide, 2000);

// For Header Sreach BAr
document.addEventListener('DOMContentLoaded', function() {
    let animatedElements = document.querySelectorAll('.info-h4');
  
    function checkScroll() {
      animatedElements.forEach(function(element) {
        // Check if the element is in the viewport
        let bounding = element.getBoundingClientRect();
  
        if (
          bounding.top >= 0 &&
          bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) {
          element.classList.add('info'); // Add the animate class when the element is in the viewport
        }
      });
    }
  
    // Initial check on page load
    checkScroll();
  
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
});

// For Header H4 
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.info-h3');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('info');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// For Header H4 
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('#animation-h2');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('animation');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// For Header BTN 1
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.btn-animation');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('btns-animation');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// For Header BTN-3
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.btn-animation-3');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('btns-animation-3');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// For Landing Page-2
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.animation-left');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= -30 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('animation-left-done');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// Landing Page-2 Foer Image
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.animation-right');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= -30 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('animation-right-done');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// 
document.addEventListener('DOMContentLoaded', function() {
  let animatedElements = document.querySelectorAll('.card-animation');

  function checkScroll() {
    animatedElements.forEach(function(element) {
      let bounding = element.getBoundingClientRect();

      if (
        bounding.top >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        element.classList.add('card-animation-done');
      }
    });
  }

  checkScroll();
  window.addEventListener('scroll', checkScroll);
});

// Car Sales
$(document).ready(function(){
  $('.counter-value').each(function(){
      $(this).prop('Counter',0).animate({
          Counter: $(this).text()
      },{
          duration: 3500,
          easing: 'swing',
          step: function (now){
              $(this).text(Math.ceil(now));
          }
      });
  });
});

// Peoples Reviews
var testiomnialData = [
  {
      avatar: "https://img.freepik.com/free-photo/woman-with-long-hair-yellow-hoodie-with-word-music-it_1340-39068.jpg",
      name: "Simonette Lindermann",
      review: "Mind-blowing discovery! changed my routine. Essential for everyone. A vise advice to all interested. Can't imagine without it!"
  },
  {
      avatar: "https://img.freepik.com/free-photo/close-up-portrait-young-bearded-man-white-shirt-jacket-posing-camera-with-broad-smile-isolated-gray_171337-629.jpg",
      name: "Merilee Beal",
      review: "Unbelievable gem! Altered my life. A must-have now. Wholeheartedly advise it to everyone. An absolute game-changer"
  },
  {
      avatar: "https://img.freepik.com/free-photo/handsome-african-guy-with-stylish-haircut-taking-photo-digital-camera_171337-1345.jpg",
      name: "Suzi Lankester",
      review: "Phenomenal addition! Completely transformed my days. Can't go without it. Strongly endorse for all. A game-changer for sure!"
  },
  {
      avatar: "https://img.freepik.com/free-photo/pretty-smiling-joyfully-female-with-fair-hair-dressed-casually-looking-with-satisfaction_176420-15187.jpg",
      name: "Gaston Cunnow",
      review: "Amazing product! It changed my life. Can't live without it now. Highly recommended to everyone!"
  },
  {
      avatar: "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg",
      name: "Marys Lobb",
      review: "Life-altering find! Indispensable now. Enthusiastically suggest to all. A game-changer for everyone!"
  },
  {
      avatar: "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg",
      name: "Marys Lobb",
      review: "Life-altering find! Indispensable now. Enthusiastically suggest to all. A game-changer for everyone!"
  }, {
      avatar: "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg",
      name: "Marys Lobb",
      review: "Life-altering find! Indispensable now. Enthusiastically suggest to all. A game-changer for everyone!"
  }]
var slideHolder = document.querySelector("#slideHolder")
for (let i of testiomnialData) slideHolder.innerHTML += `<div class="swiper-slide"> <div class="ImgHolder"><img src="${i.avatar}"></div><div class="ContentHolder"><h3>${i.name}</h3><p>${i.review}</p></div></div>`

const swiper = new Swiper('#craouselContainer', {
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 2.3,
  loop: true,
  spaceBetween: 30,
  effect: "coverflow",
  coverflowEffect: {
      rotate: 0,
      depth: 800,
      slideShadows: true,
  },
  pagination: {
      el: '.swiper-pagination',
      clickable: true
  },
  autoplay: { delay: 500 }
});
window.onresize = queryResizer
queryResizer()
function queryResizer() {
  if (window.innerWidth < 724) swiper.params.slidesPerView = 2
  if (window.innerWidth > 501) swiper.params.slidesPerView = 2
  if (window.innerWidth > 724) swiper.params.slidesPerView = 2.3
  if (window.innerWidth < 501) swiper.params.slidesPerView = 1
  swiper.update()
}


const next = document.querySelector(".next");
const prev = document.querySelector(".previous");
const slides = document.querySelectorAll(".slide");

let index = 0;
display(index);

function display(index) {
  slides.forEach((slide) => {
    slide.style.display = "none";
  });
  slides[index].style.display = "flex";
}

function nextSlide() {
  index++;
  if (index > slides.length - 1) {
    index = 0;
  }
  display(index);
}

function prevSlide() {
  index--;
  if (index < 0) {
    index = slides.length - 1;
  }
  display(index);
}

next.addEventListener("click", nextSlide);
prev.addEventListener("click", prevSlide);
