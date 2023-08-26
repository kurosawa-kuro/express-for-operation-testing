#!/bin/bash

# 1. 必要なパッケージのアップデートとインストール
sudo apt update
sudo apt install -y curl software-properties-common

# 2. NodeSourceリポジトリの追加
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -

# 3. Node.jsとnpmのインストール
sudo apt install -y nodejs

# 4. インストールの確認
node -v
npm -v

echo "Node.js installation is complete!"

