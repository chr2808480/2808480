# えとくらし

Chihiro の個人サイト「えとくらし」のソースです。描いたイラスト・撮った写真・ブログをのせています。
GitHub Pages で公開しています：https://chr2808480.github.io/2808480/

## ページ

| ファイル | 内容 |
|---|---|
| `index.html` | トップ（NEWS・ギャラリーとブログの新着・プロフィール・応援フォーム） |
| `gallery.html` | ギャラリー（イラスト・写真） |
| `blog.html` | ブログの一覧（カテゴリーで絞り込み） |
| `posts/<id>.html` | ブログの記事ページ（自動で作られます。直接は編集しません） |
| `request.html` | リクエスト（pixivリクエスト・お題箱） |
| `privacy.html` | プライバシーポリシー・免責事項 |
| `blogdetail.html` | 以前の記事URL（`blogdetail.html?id=…`）から新しい記事ページへの案内 |
| `base.html` | 新しいページを作るときのひな形（どこからもリンクしていません） |

## 中身を更新するときに直すファイル

- **ブログ記事**：`posts-data.js`（新しい記事を上に書きます）
- **ギャラリー**：`gallery-data.js` と `images/gallery/` の画像
- **リクエスト**：`requests-data.js`（受付状況・プラン・受けたリクエスト）
- **NEWS**：`index.html` の「更新履歴」

## 記事ページとサイトマップ

`posts-data.js` から、記事ページ（`posts/<id>.html`）と `sitemap.xml` を作っています。

- Claude の `blog-rewrite` スキルで記事を追加・更新したときは、その場で作り直されます。
- GitHub の画面で `posts-data.js` を直接書き換えたときは、`.github/workflows/build-posts.yml` が自動で作り直します。
- 手元で作り直すときは、リポジトリのルートで次を実行します。

```bash
python3 .claude/skills/blog-rewrite/scripts/posts.py build
```

記事ページの見た目は `.claude/skills/blog-rewrite/templates/post.html` で決まります。

## スタイルとスクリプト

- `reset.css`：ブラウザごとの見た目の差をそろえる下地
- `root.css`：色とフォントの設定（`common.css` から読み込み）
- `common.css`：全ページ共通の見た目
- `each.css`：ページごとの見た目
- `common.js`：メニュー・ページUP・画像の全画面表示・応援フォーム送信・右クリックなどの禁止
