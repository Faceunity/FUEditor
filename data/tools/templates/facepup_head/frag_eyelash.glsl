//opengles 3.0
#ifdef GLSL3_shader
    #define OUT_PARAM out
    #define IN_PARAM in
    OUT_PARAM vec4 FragColor;
    #define gl_FragColor FragColor
#else
    #define OUT_PARAM varying
    #define IN_PARAM varying
#endif


// #define GL_ES
#if defined(GLSL3_shader)
	#define SAMPLER_2D texture
	#define SAMPLER_3D texture
	#define SAMPLER_CUBE texture

    #define TEXTURE_2D_LOD textureLod
    #define TEXTURE_CUBE_LOD textureLod
#elif defined(GL_ES)
	#define SAMPLER_2D texture2D
	#define SAMPLER_3D texture3D
	#define SAMPLER_CUBE textureCube

    #if defined(SUPPORT_EXT_TEXTURE_LOD)
        #define TEXTURE_2D_LOD texture2DLodEXT   
        #define TEXTURE_CUBE_LOD textureCubeLodEXT   
    #else 
        #define TEXTURE_2D_LOD texture2D
        #define TEXTURE_CUBE_LOD textureCube
    #endif
#else
	#define SAMPLER_2D texture
	#define SAMPLER_3D texture
	#define SAMPLER_CUBE texture

    #define TEXTURE_2D_LOD textureLod
    #define TEXTURE_CUBE_LOD textureLod
#endif

#define TARGET_MOBILE 1

IN_PARAM vec3 N_frag;
IN_PARAM vec3 V_frag;
IN_PARAM vec2 st_frag;
IN_PARAM vec4 world_pos;

IN_PARAM vec3 dPds_frag, dPdt_frag;

struct FragmentState
{
	//inputs
	vec3	vertex_position;
	vec3	vertex_eye;
	vec2	main_uv;
	vec2	second_uv;
	
	vec3	vertex_normal;
	vec3	vertex_tangent;
	vec3	vertex_bitangent;
	vec3    reflect_dir;
	
	//material 
	vec3	albedo;
	vec3	reflectivity;
	vec3	normal;
	float   roughness;
	float   linearRoughness;
	vec3	fresnel;
	float   opacity;
	float   ao;
    float   curvature;

#if defined(MATERIAL_HAS_CLEAR_COAT)
    float clearCoat;
    float clearCoatRoughness;
    float clearCoatLinearRoughness;
#endif

#if defined(MATERIAL_HAS_ANISOTROPY)
    vec3  anisotropicT;
    vec3  anisotropicB;
    float anisotropy;
#endif

#if defined(SHADING_MODEL_SUBSURFACE)
    float thickness;
    vec3  subsurfaceColor;
    float subsurfacePower;
#endif

    vec3  subsurfaceColor; // cloth subsurfacee color

	float NoV;
	vec2  dfg;  // for ibl specular
	vec3 diffuse_light;
	vec3 specular_light;
	vec3 emissive_light;
};

struct MaterialInputs
{
	vec4 baseColor;
	float roughness;
	float metallic;
	float reflectance;
	float ao;

	vec4  emissive;
	float clearCoat;
	float clearCoatRoughness;

	float anisotropy;
    vec3  anisotropyDirection;

#if defined(SHADING_MODEL_SUBSURFACE)
    float thickness;
    float subsurfacePower;
    vec3  subsurfaceColor;
#endif

#if defined(SHADING_MODEL_CLOTH)
    vec3  sheenColor;
    vec3  subsurfaceColor;
#endif

    vec3  normal;
};

void initMaterial(out MaterialInputs material) 
{
    material.baseColor = vec4(1.0,1.0,1.0,1.0);
    material.roughness = 1.0;
    material.metallic = 0.0;
    material.reflectance = 0.5;
    material.ao = 1.0;

    material.emissive = vec4(0.0,0.0,0.0,0.0);

#if defined(MATERIAL_HAS_CLEAR_COAT)
    material.clearCoat = 1.0;
    material.clearCoatRoughness = 0.0;
#endif

#if defined(MATERIAL_HAS_ANISOTROPY)
    material.anisotropy = 0.0;
    material.anisotropyDirection = vec3(1.0, 0.0, 0.0);
#endif

#if defined(SHADING_MODEL_SUBSURFACE)
    material.thickness = 0.5;
    material.subsurfacePower = 12.234;
    material.subsurfaceColor = vec3(1.0);
#endif

#if defined(SHADING_MODEL_CLOTH)
    material.sheenColor = sqrt(material.baseColor.rgb);
    material.subsurfaceColor = vec3(0.0,0.0,0.0);
#endif

    material.normal = vec3(0.0, 0.0, 1.0);
}


struct Light {
    vec4 colorIntensity;  // rgb, pre-exposed intensity
    vec3 l;
    float attenuation;
};

#define M_PI 3.14159265359
#define M_HALF_PI 1.570796327
#define HALF_FLT_MAX    65504.0
#define HALF_FLT_MIN    0.00006103515625

#define M_INV_PI 0.31830988618379067153776752674503
#define M_INV_LOG2 1.4426950408889634073599246810019
#define M_GOLDEN_RATIO 0.618034

#define FLT_EPS HALF_FLT_MIN

#define saturateMediump(x) min(x, HALF_FLT_MAX)

#if defined(TARGET_MOBILE)
// min roughness such that (MIN_ROUGHNESS^4) > 0 in fp16 (i.e. 2^(-14/4), slightly rounded up)
#define MIN_ROUGHNESS              0.089
#define MIN_LINEAR_ROUGHNESS       0.007921
#else
#define MIN_ROUGHNESS              0.045
#define MIN_LINEAR_ROUGHNESS       0.002025
#endif
#define MAX_CLEAR_COAT_ROUGHNESS   0.6

vec4 pack(float depth)
{
    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0,
                            256.0 * 256.0,
                            256.0,
                            1.0);
    const vec4 bitMsk = vec4(0,
                             1.0 / 256.0,
                             1.0 / 256.0,
                             1.0 / 256.0);
    vec4 comp = fract(depth * bitSh);
    comp -= comp.xxyz * bitMsk;
    return comp * (256.0 / 255.0);
}

vec4 shader_depth_main(){
    vec4 base_color = SAMPLER_2D(tex_base_color, st_frag);
    if (base_color.a < 0.999)
        discard;
    return pack(gl_FragCoord.z);
}

vec4 shader_main(){
    vec4 base_color = SAMPLER_2D(tex_base_color, st_frag);
    base_color.a *= opacity;
    base_color.a = clamp(base_color.a, 0.0, 1.0);
    return base_color;
}