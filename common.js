// 入力欄（応援フォーム・お題箱）の中かどうか
// 入力欄の中だけは、右クリック・コピー・貼り付けを使えるようにしています。
// （メモ帳などで書いた文章を貼り付けて送る人が多いためです）
const isFormField = target => target instanceof Element && target.closest('input, textarea, select') !== null;

document.addEventListener('contextmenu', function(e) {
  if (isFormField(e.target)) return;
  e.preventDefault();
  alert('右クリックできないんだ～こめんなさい～');
});

document.addEventListener('copy', function(e) {
  if (isFormField(e.target)) return;
  e.preventDefault();
  alert('コピーしないでね～こめんなさい～');
});

document.addEventListener('cut', function(e) {
  if (isFormField(e.target)) return;
  e.preventDefault();
  alert('切り取らないでね～こめんなさい～');
});

document.addEventListener('keydown', function(e) {
  if (isFormField(e.target)) return;
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

// ===== ダブルクリック・ピンチ操作禁止 =====

// ダブルクリック禁止
document.addEventListener("dblclick", e => {
    e.preventDefault();
    e.stopPropagation();
});

// スマホの2本指操作（ピンチ）禁止
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

    // ブログ記事の写真（posts/〜.html）
    // 写真そのものへのリンクになっていますが、移動はせずに、この場で大きく表示します
    const photo = e.target.closest('.post-photo');
    if (photo && detailView) {
        e.preventDefault();
        openDetail(photo.getAttribute('href'), '');
    }
});

    if (detailView) {
        detailView.addEventListener('click', closeDetail);
    }
});

// ブログ記事の写真（posts/〜.html）：縦長の写真に目印（_portrait）を付ける
// 縦長かどうかは CSS だけでは見分けられないので、読み込んだ写真の縦横の大きさで判断しています。
// 目印の付いた写真は、each.css で画面の高さの5割までに抑えています。
document.querySelectorAll('.post-photo img').forEach(img => {
    const mark = () => img.classList.toggle('_portrait', img.naturalHeight > img.naturalWidth);
    if (img.complete) {
        mark();
    } else {
        img.addEventListener('load', mark);
    }
});

// 応援フォーム送信
// EmailJS を読み込んでいるページ（トップ・Request）でだけ準備します。
// 読み込んでいないブログなどのページでは、ここでエラーにならないようにしています。
if (typeof emailjs !== 'undefined') {
 emailjs.init('5X817nnLC3qenuVtC');
}
const contactForm = document.getElementById('js-contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
 contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  formStatus.textContent = '送信中...';

  // えとくらし用テンプレート（お題箱と共用）で送ります。
  // メッセージは1行ずつに分けて送り、届くメールでも改行がそのまま見えるようにしています。
  const data = new FormData(contactForm);
  emailjs.send('service_rwf3ey8', 'template_etokurashi', {
   form_name: '応援メッセージ',
   name: data.get('name'),
   message_lines: data.get('message').split(/\r?\n/),
  })
   .then(() => {
    formStatus.textContent = '送信完了しました～。ありがとうございます！';
    contactForm.reset();
   })
   .catch(() => {
    formStatus.textContent = '送信できませんでした……。時間をおいてまたお試しください。';
   });
 });
}
