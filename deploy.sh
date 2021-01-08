hexo generate \
&& cp -r ./source/go ./public \
&& cp -r ./source/go ./.deploy_git \
&& hexo deploy