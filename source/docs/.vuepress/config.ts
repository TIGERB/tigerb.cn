import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { viteBundler } from '@vuepress/bundler-vite'
// import { webpackBundler } from '@vuepress/bundler-webpack'

export default defineUserConfig({
  title: "施展TIGERB",
  description: "施展的知识库",
  bundler: viteBundler(),
  // bundler: webpackBundler(),
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/20190707142019.png",
    author: "TIGERB",
    // authorAvatar: "/head.png",
    docsRepo: "https://github.com/TIGERB",
    docsBranch: "main",
    docsDir: "example",
    lastUpdatedText: "",
    // series 为原 sidebar
    series: {
      "/docs/theme-reco/": [
        {
          text: "module one",
          children: ["home", "theme"],
        },
        // {
        //   text: "module two",
        //   children: ["api", "plugin"],
        // },
      ],
    },
    navbar: [
      { text: "首页", link: "/" },
      { text: "电商设计手册系列", link: "/categories/reco/1/" },
      { text: "Go语言轻松进阶系列", link: "/tags/tag1/1/" },
      { text: "施展爱思考系列", link: "/tags/tag1/1/" },
      // {
      //   text: "Docs",
      //   children: [
      //     { text: "vuepress-reco", link: "/docs/theme-reco/theme" },
      //     { text: "vuepress-theme-reco", link: "/blogs/other/guide" },
      //   ],
      // },
    ],
    bulletin: {
      body: [
        {
          type: "text",
          content: `🎉🎉🎉 `,
          style: "font-size: 12px;",
        },
        {
          type: "title",
          content: "关注我的公众号",
        },
        {
          type: "text",
          content: `
          <img src="https://blog-1251019962.cos-website.ap-beijing.myqcloud.com/qiniu_img_2022/wechat-blog-qrcode.jpg?imageMogr2/thumbnail/260x260!/format/webp/blur/1x0/quality/90|imageslim" />`,
          style: "font-size: 12px;",
        },
        // {
        //   type: "hr",
        // },
        // {
        //   type: "title",
        //   content: "GitHub",
        // },
        // {
        //   type: "text",
        //   content: `
        //   <ul>
        //     <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/issues">Issues<a/></li>
        //     <li><a href="https://github.com/vuepress-reco/vuepress-theme-reco-next/discussions/1">Discussions<a/></li>
        //   </ul>`,
        //   style: "font-size: 12px;",
        // },
        // {
        //   type: "hr",
        // },
        // {
        //   type: "buttongroup",
        //   children: [
        //     {
        //       text: "打赏",
        //       link: "/docs/others/donate.html",
        //     },
        //   ],
        // },
      ],
    },
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
});
