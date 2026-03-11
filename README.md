# Google Drive Direct Download Link Converter

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Made with HTML](https://img.shields.io/badge/Made%20with-HTML%2FCSS%2FJS-blue)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222)

Google Drive の共有リンクを、直接ダウンロード用URLに変換するシンプルな静的Webツールです。  

## Features

- Google Drive 共有リンクを直接ダウンロードURLへ変換
- 複数リンクを一括変換
- 各URLを1件ずつコピー
- 変換後URLをまとめてコピー

## Supported input examples

以下のような形式のリンクに対応しています。

```txt
https://drive.google.com/file/d/{ID}/view?usp=sharing
https://drive.google.com/open?id={ID}
https://drive.google.com/uc?export=download&id={ID}

変換後は次の形式になります。

https://drive.google.com/uc?export=download&id={ID}
