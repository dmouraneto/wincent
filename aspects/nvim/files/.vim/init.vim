set number " show current line number
set relativenumber " use relative line numbers
set nohlsearch " dont highlight matched searches
set autoindent
set smartindent
set tabstop=2
set shiftwidth=2
set expandtab
set nowrap
set noswapfile
set nobackup
set undodir=~/.vim/undodir
set undofile
syntax on
set updatetime=50
set colorcolumn=100
highlight ColorColumn ctermbg=0 guibg=lightgrey
call plug#begin('~/.vim/plugged')
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-surround'
Plug 'vim-airline/vim-airline'
Plug 'preservim/nerdtree'
Plug 'tpope/vim-commentary'
Plug 'gruvbox-community/gruvbox'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug '/usr/local/opt/fzf'
Plug 'junegunn/fzf.vim'
Plug 'vimwiki/vimwiki'
call plug#end()
colorscheme gruvbox
set background=dark

let mapleader = " "
nnoremap <C-p> :GFiles<CR>
nnoremap <Leader>pf :Files<CR>
nnoremap <C-h> :wincmd h<CR>
nnoremap <C-j> :wincmd j<CR>
nnoremap <C-k> :wincmd k<CR>
nnoremap <C-l> :wincmd l<CR>
nnoremap <leader>+ :res +5<CR>
nnoremap <leader>- :res -5<CR>
nnoremap <leader>> :vertical res +5<CR>
nnoremap <leader>< :vertical res -5<CR>

command! -nargs=0 Prettier :CocCommand prettier.formatFile
nnoremap <leader>p :Prettier<CR>
nnoremap <leader>o :CocCommand tsserver.organizeImports<CR>

" let g:coc_suggest_disable=1
let g:coc_global_extensions = ['coc-tsserver']
nmap <leader>gd <Plug>(coc-definition)
nmap <leader>gy <Plug>(coc-type-definition)
nmap <leader>gi <Plug>(coc-implementation)
nmap <leader>gr <Plug>(coc-references)
nmap <leader>rr <Plug>(coc-rename)
nmap <leader>g[ <Plug>(coc-diagnostic-prev)
nmap <leader>g] <Plug>(coc-diagnostic-next)
nmap <leader>f <Plug>(coc-fix-current)
nmap <silent> <leader>gp <Plug>(coc-diagnostic-prev-error)
nmap <silent> <leader>gn <Plug>(coc-diagnostic-next-error)
nnoremap <leader>cr :CocRestart

" Use K to show documentation in preview window.
nnoremap <silent> K :call <SID>show_documentation()<CR>

function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  elseif (coc#rpc#ready())
    call CocActionAsync('doHover')
  else
    execute '!' . &keywordprg . " " . expand('<cword>')
  endif
endfunction

" correct highlight for comments in json files
autocmd FileType json syntax match Comment +\/\/.\+$+ 

" git commit messages width
autocmd BufRead, BufNewFile COMMIT_EDITMSG set textwidth=72

" using ; instead of : to make easier enter ex/cmd-mode
nnoremap ; :
nnoremap : ;

" shortcut to open vimrc
nnoremap <leader>vr :e ~/.vim/vimrc<CR>

" NERDTree
nnoremap <leader>nn :NERDTreeToggle<CR>
nnoremap <leader>nf :NERDTreeFind<CR>

