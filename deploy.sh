hexo generate \
&& cp -r ./source/go-patterns ./public \
&& cp -r ./source/go-patterns ./.deploy_git \
&& hexo deploy