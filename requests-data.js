// ===== リクエストページ（request.html）のデータ =====

// 受付状況　true＝受付中／false＝お休み中
// false にすると、ページ上部の表示が「お休み中」になり、お題箱の入力欄も使えなくなります。
const REQUEST_OPEN = true;

// pixivリクエストのプラン
// pixivで設定しているプランと同じ内容にしてください。プランが増えたら { } ごとコピーして増やせます。
const REQUEST_PLANS = [
  {
    name: "イラスト",
    price: 3000,
    url: "https://www.pixiv.net/request/plans/200217",
    detail: "推しのファンアートやオリジナルのイラストを描きます。完成した作品はpixivとこのサイトのギャラリーにのせます。",
    ok: "オリジナル、二次創作（ファンアート）",
    ng: "R-18・R-18G、実在の人物、AI学習への利用",
  },
];

// 受けたリクエストの記録（新しいものを上に書いてください）
//   id       … 番号（ほかと重ならなければOK）
//   date     … 受けた日
//   route    … "pixiv"＝pixivリクエスト ／ "odaibako"＝お題箱
//   type     … 種類（イラスト・文章・ブログのお題 など）
//   from     … お名前。「さん」は自動で付きます。空 "" にすると「匿名さん」
//   status   … "working"＝制作中 ／ "done"＝完成
//   showText … false にすると依頼文を隠して、作品だけのせます（「作品だけ掲載OK」を選んだ人のとき）
//   text     … 依頼文。改行したいところには <br> を入れてください（posts-data.js と同じです）
//   image    … 完成した作品の画像（ギャラリーと同じ画像を指定できます）。制作中は書かなくてOK
//   link     … pixivの作品ページやブログ記事のURL（なくてもOK）
// 「掲載しない」を選んだ人のリクエストは、ここには書かないでください。
const REQUESTS = [
  // 例）お題箱から受けて、いま制作中のもの
  // { id: 2, date: "2026-10-05", route: "odaibako", type: "ブログのお題", from: "", status: "working", showText: true,
  //   text: "群馬のおすすめの星空スポットを知りたいです！" },
  //
  // 例）pixivリクエストで完成したもの（依頼文は非公開）
  // { id: 1, date: "2026-10-01", route: "pixiv", type: "イラスト", from: "〇〇", status: "done", showText: false,
  //   text: "", image: "images/gallery/illust/20260921.png", link: "https://www.pixiv.net/artworks/000000" },
];
