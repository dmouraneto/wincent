set runtimepath^=~/.config/nvim/lua runtimepath+=~/.vim/after runtimepath+=~/.vim
let &packpath = &runtimepath
source ~/.vim/vimrc
source ~/.config/nvim/lua/init.lua
