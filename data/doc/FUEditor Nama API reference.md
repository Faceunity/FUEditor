# FUEditor Nama API 参考文档  

本文介绍FUEditor所用到的Nama接口（也就是脚本里出现以FaceUnity开头的函数和变量）的参数和功能。  

## 变量  

### m_platform  

当前平台名称（Android，IOS，PC）  

### g_image_w  

输出视频宽度  

### g_image_h  

输出视频高度  

### m_is_bgra  

视频图像输出格式 2为rgba，4为bgra  

### g_current_rmode  

旋转模式，取值范围为 0-3，分别对应人脸相对于图像数据旋转0度、90度、180度、270度

## 函数  

### MatrixTranslate函数    

生成平移矩阵  

```c++
float[16] MatrixTranslate(float[3] trans)
```

#### 参数  

trans：平移的xyz所组成的数组

#### 返回值  

返回一个4x4矩阵组成的数组  

### MatrixMul函数  

矩阵乘法  

```c++
float[16] MatrixMul(float[16] mat0, float[16] mat1)
```

#### 参数  

mat0：矩阵1

mat1：矩阵2

#### 返回值  

mat0 * mat1，返回一个4x4矩阵组成的数组  

### CreateEyeMatrix函数  

创建视图矩阵，类似gluLookAt  

```c++
float[16] CreateEyeMatrix(float[3] center, float[2] pupil_pos)
```

#### 参数  

center：观察中心点

pupil_pos：眼睛位置xy

#### 返回值  

返回创建的视图矩阵

### CreateViewMatrix函数  

创建视图矩阵  

```c++
float[16] CreateViewMatrix(float[4] rot, float[3] trans)
```

#### 参数  

rot：相机旋转四元数

trans：相机平移向量

#### 返回值  

返回创建的视图矩阵

### CreateProjectionMatrix函数  

创建投影矩阵  

```c++
float[16] CreateProjectionMatrix(float z_near, float z_far, float[4] ar_mat)
```

#### 参数

z_near：近平面深度值  

z_far：远平面深度值  

ar_mat：给投影矩阵增加旋转效果  

#### 返回值  

返回创建的投影矩阵  

#### 备注  

以上参数可以不传，即使用nama提供的默认值  

### CreateProjectionMatrix_FOV函数  

传入fov创建投影矩阵  

```c++
float[16] CreateProjectionMatrix_FOV(float fov, float z_near, float z_far, int fix_rmode)
```

#### 参数  

fov：视野角  

z_near：近平面深度值  

z_far：远平面深度值  

fix_rmode：旋转模式，取值范围为 0-3，分别对应人脸相对于图像数据旋转0度、90度、180度、270度  

#### 返回值  

返回创建的投影矩阵  

#### 备注  

以上参数可以不传，即使用nama提供的默认值  

### LoadTexture函数  

加载纹理  

```c++
COnDemandTexture LoadTexture(string fn, int do_mipmap, int wrap_mode)
```

#### 参数  

fn：纹理文件名  

do_mipmap：是否有mipmap  

wrap_mode：纹理环绕模式  

#### 返回值  

返回COnDemandTexture，这是一个nama用的纹理对象，取出opengl纹理id还需要调用nama里面的GetTexture函数  

#### 备注  

do_mipmap和wrap_mode为可选参数，不传的话使用nama提供的默认值  

### ReadFromCurrentItem函数  

读取文件内容  

```c++
string ReadFromCurrentItem(string fn)
```

#### 参数  

fn：文件名  

#### 返回值  

返回读取的文件内容作为字符串  

### TestVTF函数  

查询机器是否支持vertex texture fetch  

```c++
bool TestVTF()
```

#### 返回值  

返回机器是否支持vtf的结果  

### LoadBlendshape函数  

加载模型的各个blendshape（如果没有blendshape则是直接加载模型）  

```c++
Blendshape LoadBlendshape(string fn_json, string fn_bin)
```

#### 参数  

fn_json：模型的json（属性配置文件）  

fn_bin：模型数据的二进制文件（顶点，纹理坐标，法线...等各种attribute实际数据）  

#### 返回值  

Blendshape格式的json，属性包含所有fn_json里的属性，内容以对应读取的数据填充，取出此对象传递给接下来的渲染blendshape操作使用  

### ComputeBlendshapeGeometry函数  

根据params传入的expression计算blendshape按照expression融合的mesh  

```c++
void ComputeBlendshapeGeometry(Blendshape obj_json, JSON params, int expressions_n, int updatenormal, int picasso_eyerot)
```

#### 参数  

obj_json：Blendshape格式的json，即LoadBlendshape的返回对象  

params：需要传入的参数json，包含对应blendshape的表情系数  

expressions_n：blendshape个数  

updatenormal：是否需要重新计算法线  

picasso_eyerot：picasso项目用的参数  

#### 备注  

obj_json和params为必传参数，后面3个可以不传使用nama提供的默认值  

### RenderBlendshapeComponent_new函数  

渲染blendshape融合后的mesh  

```c++
void RenderBlendshapeComponent_new(Blendshape obj_json, JSON drawcall, string s_vert_shader, string s_shader, JSON uniforms, string pass)
```

#### 参数  

obj_json：之前计算得到的Blendshape格式的json  

drawcall：Blendshape里包含的drawcalls  

s_vert_shader：vertex shader  

s_shader：fragement shader  

uniform：shader用到的uniform  

pass：当前的渲染pass  

### SimpleOITEnd函数  

透明排序结束，重置一些opengl状态  

```c++
void SimpleOITEnd()
```

### GetARMat函数  

生成投影到2d屏幕的矩阵  

```c++
float[4] GetARMat()
```

#### 返回值  

投影矩阵  

#### 备注  

按照rmode计算投影旋转方向，rmode取值范围为 0-3，分别对应人脸相对于图像数据旋转0度、90度、180度、270度  

### RenderBillboard函数  

渲染公告板  

```c++
void RenderBillboard(COnDemandTexture ptex, JSON board_desc, JSON frame_desc, float[4] matp, float[16] view_mat, int isFullScreenObj, JSON face_param)
```

#### 参数  

ptex：贴图对象  

board_desc：2d_desc.json读取的json  

frame_desc：board_desc里的texture_frames对象  

matp：作为ar_mat影响投影矩阵运算  

view_mat：视图矩阵（传递给shader）  

isFullScreenObj：是否全屏  

face_param：其他参数，传入params即可  

### InsertImageFilter函数  

插入滤镜（给屏幕一个后处理shader）  

```c++
void InsertImageFilter(string s_type, string shader, JSON uniforms)
```

#### 参数  

s_type：滤镜类型，有warp（变形）和color（颜色）  

shader：fragment shader  

uniforms：传给shader的uniform  

### LoadNNModel函数    

导入神经网络模型  

```c++
CCaffeModel LoadNNModel(JSON fn_json)
```

#### 参数  

fn_json：神经网络json配置文件，其中包含图像的宽(input_width),高(input_height),通道数(input_channel)以及网络模型的文件名(.....)（例如init_net.pb和predict_net.pb）  

#### 返回值  

CCaffeModel传递给RunNNModelRaw使用  

### ExtractNNModelInput函数    

提取神经网络模型的输入图像数组  

```c++
float[w*h*channels] ExtractNNModelInput(int w, int h, int channels, float[] matrix, float[] base_color)
```

#### 参数  

w：神经网络输入宽度  

h：神经网络输入高度  

channels：神经网络通道数  

matrix：输入图像的transform matrix  

base_color：图像额外相加的值（例如需要减去的均值，可以将此项设置成均值的相反数。）  

#### 返回值  

神经网络图像数组  

### RunNNModelRaw函数  

单次运行神经网络模型模型，返回预测结果数组。结果数组长度为n+1（n维为神经网络输出结果长度，最后一维存储网络运行时间）  

```c++
float[] RunNNModelRaw(CCaffeModel model, float[] input)
```

#### 参数  

model: 神经网络模型的handle  

input: 输入图像数组  

#### 返回值  

预测结果数组  

### UploadBackgroundSegmentationResult函数    

返回背景分割运算后的纹理  

```c++
int UploadBackgroundSegmentationResult(CCaffeModel model, float[] nn_output)
```

#### 参数  

model: 神经网络模型的handle  

nn_output：RunNNModelRaw返回的预测结果数组  

#### 返回值  

背景分割运算后的纹理id  

### LoadMeanValueCoord函数    



### LoadFaceInfo函数    



### FaceTransfer函数    



### RenderAR函数    



### RenderAREx函数    