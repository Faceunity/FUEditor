# **FUEditor 使用文档**

## 简介
__FUEditor__ 是一款高效便捷的AR人脸道具编辑工具软件，为[Faceunity](www.faceunity.com)公司的Nama SDK提供支持。
 - 可以高效制作2D道具。贴纸，贴纸动画，动画组，特定脸部动作触发动画。Faceunity的2D贴纸技术本质也是3D的，有前后景深效果，侧脸时仍能紧贴人脸，而不是全部贴纸都在一个平面上。
 - 可以制作AR Mesh面具。
 - 可以制作3D的道具，调整材质，如花环头盔等。  
 ![xxx](https://github.com/Faceunity/FUEditor/blob/master/data/doc/img/gif.gif)

## 1. 快速教程
- 系统要求  
  - win7/8/10 64位电脑
  - 摄像头，推荐使用 Logitech C920
-	FUEditor无须安装可直接使用，将FUEditor.zip解压到系统适当位置。
-	目录结构解释  
```C
+FUEdittor\          //FUEditor根目录
       -FUEditor.bat      //双击点击，启动FUEditor
       +bins\             //FUEditor程序库
       +data\             //FUEditor数据目录
       +log\              //FUEditor运行日志
       +Projects\         //所有道具项目的目录
         +daoju1\          //道具“daoju1”项目目录
           -daoju1.fuproj   //道具项目“daoju1”工程文件
           +build\          //已签名道具bundle（测试证书）
           +release\        //已签名道具bundle（正式证书）
           +zip\            //未签名压缩包
           +fcopy\          //自定义内容目录，用于自定义脚本
           +out\            //临时文件
         +daoju2           //道具“daoju2”项目目录
           -daoju2.fuproj   //道具项目“daoju2”工程文件
           ...
         +daoju3           //道具“daoju3”项目目录
           ...
```
- 启动程序  
 双击 FUEditor 目录中 FUEditor.bat 启动程序。显示最近项目列表，可以选择以前的项目，也可以新建项目。

 ![test](https://github.com/Faceunity/FUEditor/blob/master/data/doc/img/start.png)

- 查看example    
 FUEditor中自带一些示例项目，首次启动时，显示的项目即是示例项目，在最近项目列表中鼠标左键选择打开‘example_2D’项目。

 ![test](https://github.com/Faceunity/FUEditor/blob/master/data/doc/img/choice.png)  
 进入示例项目，点击![test](./img/qt32/play.png)按钮启动摄像头，点击![test](./img/qt32/refresh.png)开始预览。

 ![test](https://github.com/Faceunity/FUEditor/blob/master/data/doc/img/example.png)  
---
