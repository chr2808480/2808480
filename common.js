document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  alert('右クリックできないんだ～こめんなさい～');
});

document.addEventListener('copy', function(e) {
  e.preventDefault();
  alert('コピーしないでね～こめんなさい～');
});

document.addEventListener('cut', function(e) {
  e.preventDefault();
  alert('切り取らないでね～こめんなさい～');
});

document.addEventListener('keydown', function(e) {
  // Ctrl+C, Ctrl+V, Ctrl+X のショートカットを無効化
  if (e.ctrlKey) {
    switch(e.key) {
      case 'c':
      case 'v':
      case 'x':
        e.preventDefault();
        alert('ショートカットキーは使わないでね～こめんなさい～');
        break;
    }
  }
});

// ===== 長押し・ダブルクリック禁止 =====

// 右クリック禁止
document.addEventListener("contextmenu", e => e.preventDefault());

// ダブルクリック禁止
document.addEventListener("dblclick", e => {
    e.preventDefault();
    e.stopPropagation();
});

// スマホの長押し禁止
document.addEventListener("touchstart", e => {
    if (e.touches.length > 1) e.preventDefault();
});

// ピンチ操作禁止（必要なら）
document.addEventListener("gesturestart", e => e.preventDefault());

// スマホ用メニュー　クラス追加
const ham = document.querySelector("#js-hamburger");
const nav = document.querySelector("#js-globalnav");
const Main = document.querySelector("#js-main");

ham.addEventListener("click", function () {
 ham.classList.toggle("_active");
 nav.classList.toggle("_active");
 Main.classList.toggle("_darker");
});

// 子メニュー表示
const parentMenu = document.querySelectorAll("._has-child > a");
for (let i = 0; i < parentMenu.length; i++) {
 parentMenu[i].addEventListener("click", function(e){
  e.preventDefault();
  this.nextElementSibling.classList.toggle("active");
 })
}



// ページUP
const PageUpBtn = document.querySelector('#js-pageup');

window.addEventListener("scroll", () =>  {
 PageUpBtn?.classList.toggle("_active", window.scrollY > 700);
});

PageUpBtn?.addEventListener('click', () => {
 window.scrollTo({
  top: 0,
  behavior: 'smooth'
 });
});



// Gallery
document.addEventListener('DOMContentLoaded', () => {
    const detailView = document.getElementById('detail-view');
    const fullImage = document.getElementById('full-image');
    const listItems = document.querySelectorAll('.gallerylist__item');
    const detailCaption = document.getElementById('detail-caption'); // ← 追加


    // 現在のスクロール位置を保持する変数
    let scrollPosition = 0;

const openDetail = (src, caption) => {
    // 現在のスクロール位置を記録
    scrollPosition = window.pageYOffset;

    fullImage.src = src;
    detailCaption.textContent = caption || ''; // ← 追加
    detailView.classList.remove('hidden');

    // 背面のリストが動かないように body を固定する
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
};

 const closeDetail = () => {
     
       // スムーズスクロールを一瞬だけ無効化
        document.documentElement.style.scrollBehavior = 'auto';
  
        detailView.classList.add('hidden');
        fullImage.src = '';

        // body の固定を解除し、元の位置にスクロールさせる
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
        
       // スムーズスクロールの設定を元に戻す
        setTimeout(() => {
                  document.documentElement.style.scrollBehavior = '';
              }, 0);
          };

document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallerylist__item');
    if (item) {
        openDetail(item.getAttribute('data-full'), item.getAttribute('data-caption'));
    }
});

    if (detailView) {
        detailView.addEventListener('click', closeDetail);
    }
});

// 応援フォーム送信
emailjs.init('5X817nnLC3qenuVtC');

const contactForm = document.getElementById('js-contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
 contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  formStatus.textContent = '送信中...';

  emailjs.sendForm('service_rwf3ey8', 'template_w407ihr', contactForm)
   .then(() => {
    formStatus.textContent = '送信完了しました～。ありがとうございます！';
    contactForm.reset();
   })
   .catch(() => {
    formStatus.textContent = '送信できませんでした……。時間をおいてまたお試しください。';
   });
 });
}
