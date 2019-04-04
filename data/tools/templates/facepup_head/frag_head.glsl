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


// color space
float sRGBToLinear(float c)
{
	float lin = c <= 0.04045 ? c/12.92 : pow(((c+0.055)/1.055), 2.4);
    return lin;
}

vec3 sRGBToLinear(vec3 c)
{
	return vec3(sRGBToLinear(c.x), sRGBToLinear(c.y), sRGBToLinear(c.z));
}

float sRGBToLinearFast(float c)
{
	return pow(c, 2.2);
}

vec3 sRGBToLinearFast(vec3 c)
{
	return vec3(sRGBToLinearFast(c.x), sRGBToLinearFast(c.y), sRGBToLinearFast(c.z));
}

float LinearToSrgbFast(float c)
{
	return pow(c, 1.0/2.2);
}

vec3 LinearToSrgbFast(vec3 c)
{
	return vec3(LinearToSrgbFast(c.x), LinearToSrgbFast(c.y), LinearToSrgbFast(c.z));
}

float LinearToSrgbBranchlessChannel(float lin) 
{
	lin = max(6.10352e-5, lin); // minimum positive non-denormal (fixes black problem on DX11 AMD and NV)
	return min(lin * 12.92, pow(max(lin, 0.00313067), 1.0/2.4) * 1.055 - 0.055);
	// Possible that mobile GPUs might have native pow() function?
	//return min(lin * 12.92, exp2(log2(max(lin, 0.00313067)) * (1.0/2.4) + log2(1.055)) - 0.055);
}

vec3 LinearToSrgbBranchless(vec3 lin) 
{
	return vec3(
		LinearToSrgbBranchlessChannel(lin.r),
		LinearToSrgbBranchlessChannel(lin.g),
		LinearToSrgbBranchlessChannel(lin.b));
}

float LinearToSrgbBranchingChannel(float lin) 
{
	if(lin < 0.00313067) return lin * 12.92;
	return pow(lin, (1.0/2.4)) * 1.055 - 0.055;
}

vec3 LinearToSrgbBranching(vec3 lin) 
{
	return vec3(
		LinearToSrgbBranchingChannel(lin.r),
		LinearToSrgbBranchingChannel(lin.g),
		LinearToSrgbBranchingChannel(lin.b));
}

vec3 LinearToSrgb(vec3 lin) 
{
// #if FEATURE_LEVEL > FEATURE_LEVEL_ES3_1
// 	// Branching is faster than branchless on AMD on PC.
// 	return LinearToSrgbBranching(lin);
// #else
	// Adreno devices(Nexus5) with Android 4.4.2 do not handle branching version well, so always use branchless on Mobile
	return LinearToSrgbBranchless(lin);
//#endif
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

    float d = q.x - min(q.w, q.y);
    //float e = 1.0e-10;
    float e = HALF_FLT_MIN;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 fixNormalSample(vec3 v, bool flipY)
{
	vec3 res = (v - vec3(0.5,0.5,0.5))*2.0;
	res.y = flipY ? -res.y : res.y;
	return res;
}

vec3 fixBinormal(vec3 n, vec3 t, vec3 b)
{
	vec3 nt = cross(n,t);
	return sign(dot(nt,b))*nt;
}

vec3 rotate(vec3 v, float a)
{
	float angle = a;
	float ca = cos(angle);
	float sa = sin(angle);
	return vec3(v.x*ca+v.z*sa, v.y, v.z*ca-v.x*sa);
}

// float saturate(float a)
// {
// 	return clamp(a, 0.0, 1.0);
// }

float saturate(float value)
{
	return clamp(value, 0.0, 1.0);
}

vec3 saturate(vec3 value)
{
	return clamp(value, vec3(0.0,0.0,0.0), vec3(1.0,1.0,1.0));
}


float sq(float x) {
    return x * x;
}

float max3(const vec3 v) {
    return max(v.x, max(v.y, v.z));
}

float pow5(float x) {
    float x2 = x * x;
    return x2 * x2 * x;
}


/// ibl part
float D_GGX(float linearRoughness, float NoH, const vec3 h){
	// Walter et al. 2007, "Microfacet Models for Refraction through Rough Surfaces"

    // In mediump, there are two problems computing 1.0 - NoH^2
    // 1) 1.0 - NoH^2 suffers floating point cancellation when NoH^2 is close to 1 (highlights)
    // 2) NoH doesn't have enough precision around 1.0
    // Both problem can be fixed by computing 1-NoH^2 in highp and providing NoH in highp as well

    // However, we can do better using Lagrange's identity:
    //      ||a x b||^2 = ||a||^2 ||b||^2 - (a . b)^2
    // since N and H are unit vectors: ||N x H||^2 = 1.0 - NoH^2
    // This computes 1.0 - NoH^2 directly (which is close to zero in the highlights and has
    // enough precision).
    // Overall this yields better performance, keeping all computations in mediump

// #if defined(TARGET_MOBILE)
//     vec3 NxH = cross(shading_normal, h);
//     float oneMinusNoHSquared = dot(NxH, NxH);
// #else
    float oneMinusNoHSquared = 1.0 - NoH * NoH;
//#endif

    float a = NoH * linearRoughness;
    float k = linearRoughness / (oneMinusNoHSquared + a * a);
    float d = k * k * M_INV_PI;
    return saturateMediump(d);
}

float D_GGX_Anisotropic(float at, float ab, float ToH, float BoH, float NoH) {
    // Burley 2012, "Physically-Based Shading at Disney"
    float a2 = at * ab;
    vec3 d = vec3(ab * ToH, at * BoH, a2 * NoH);
    return saturateMediump(a2 * sq(a2 / dot(d, d)) * M_INV_PI);
}

float D_Ashikhmin(float linearRoughness, float NoH) {
    // Ashikhmin 2007, "Distribution-based BRDFs"
	float a2 = linearRoughness * linearRoughness;
	float cos2h = NoH * NoH;
	float sin2h = max(1.0 - cos2h, 0.0078125); // 2^(-14/2), so sin2h^2 > 0 in fp16
	float sin4h = sin2h * sin2h;
	float cot2 = -cos2h / (a2 * sin2h);
	return 1.0 / (M_PI * (4.0 * a2 + 1.0) * sin4h) * (4.0 * exp(cot2) + sin4h);
}

float D_Charlie(float linearRoughness, float NoH) {
    // Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
    float invAlpha  = 1.0 / linearRoughness;
    float cos2h = NoH * NoH;
    float sin2h = max(1.0 - cos2h, 0.0078125); // 2^(-14/2), so sin2h^2 > 0 in fp16
    return (2.0 + invAlpha) * pow(sin2h, invAlpha * 0.5) / (2.0 * M_PI);
}

vec3 F_Schlick(const vec3 f0, float f90, float VoH) {
    // Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"
    float f = pow5(1.0 - VoH);
    return f + f0 * (f90 - f);
}

float F_Schlick(float f0, float f90, float VoH) {
    return f0 + (f90 - f0) * pow5(1.0 - VoH);
}

vec3 F_SchlickSpherical(const vec3 f0, float f90, float VoH) {
    // Schlick with Spherical Gaussian approximation
	// cf http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf p3
    float sphg = pow(2.0, (-5.55473*VoH - 6.98316) * VoH);
	return f0 + (vec3(f90,f90,f90) - f0) * sphg;
}

float F_SchlickSpherical(float f0, float f90, float VoH) {
    float sphg = pow(2.0, (-5.55473*VoH - 6.98316) * VoH);
	return f0 + (f90 - f0) * sphg;
}

float V_SmithGGX(float linearRoughness, float NoV, float NoL) {
    float k = linearRoughness * 0.5;
    float G1V = 1.0 / ( NoV*(1.0-k) + k);
    float G1L = 1.0 / ( NoL*(1.0-k) + k);
    return saturateMediump(G1V*G1L);
}

float V_SmithGGXCorrelated(float linearRoughness, float NoV, float NoL) {
    // Heitz 2014, "Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs"
    float a2 = linearRoughness * linearRoughness;
    // TODO: lambdaV can be pre-computed for all the lights, it should be moved out of this function
    float lambdaV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);
    float lambdaL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);
    float v = 0.5 / (lambdaV + lambdaL);
    // a2=0 => v = 1 / 4*NoL*NoV   => min=1/4, max=+inf
    // a2=1 => v = 1 / 2*(NoL+NoV) => min=1/4, max=+inf
    // clamp to the maximum value representable in mediump
    return saturateMediump(v);
}

float V_SmithGGXCorrelated_Fast(float linearRoughness, float NoV, float NoL) {
    // Hammon 2017, "PBR Diffuse Lighting for GGX+Smith Microsurfaces"
    float v = 0.5 / mix(2.0 * NoL * NoV, NoL + NoV, linearRoughness);
    return saturateMediump(v);
}

float V_SmithGGXCorrelated_Anisotropic(float at, float ab, float ToV, float BoV, float ToL, float BoL, float NoV, float NoL) {
    // Heitz 2014, "Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs"
    // TODO: lambdaV can be pre-computed for all the lights, it should be moved out of this function
    float lambdaV = NoL * length(vec3(at * ToV, ab * BoV, NoV));
    float lambdaL = NoV * length(vec3(at * ToL, ab * BoL, NoL));
    float v = 0.5 / (lambdaV + lambdaL);
    return saturateMediump(v);
}

float V_Kelemen(float LoH) {
    // Kelemen 2001, "A Microfacet Based Coupled Specular-Matte BRDF Model with Importance Sampling"
    return saturateMediump(0.25 / (LoH * LoH));
}

float V_Neubelt(float NoV, float NoL) {
    // Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
    return saturateMediump(1.0 / (4.0 * (NoL + NoV - NoL * NoV)));
}

float Fd_Lambert(){
	return M_INV_PI;
}

float Fd_Wrap(float NoL, float w){
	return saturate((NoL + w) / sq(1.0 + w));
}

float Fd_Burley(float linearRoughness, float NoV, float NoL, float LoH) {
    // Burley 2012, "Physically-Based Shading at Disney"
    float f90 = 0.5 + 2.0 * linearRoughness * LoH * LoH;
    float lightScatter = F_Schlick(1.0, f90, NoL);
    float viewScatter  = F_Schlick(1.0, f90, NoV);
    return lightScatter * viewScatter * M_INV_PI;
}


float IORToF0(float transmittedIor, float incidentIor) {
    return sq((transmittedIor - incidentIor) / (transmittedIor + incidentIor));
}

vec3 F0ClearCoatToSurface(const vec3 f0) {
    // Approximation of iorTof0(f0ToIor(f0), 1.5)
    // This assumes that the clear coat layer has an IOR of 1.5
#if defined(TARGET_MOBILE)
    return saturate(f0 * (f0 * 0.526868 + 0.529324) - 0.0482256);
#else
    return saturate(f0 * (f0 * (0.941892 - 0.263008 * f0) + 0.346479) - 0.0285998);
#endif
}

vec3 Fresnel(const vec3 f0, float LoH){
	return F_Schlick(f0, 1.0, LoH);
// #if defined(TARGET_MOBILE)
//    	return F_Schlick(f0, 1.0, LoH);
// #else
//     float f90 = saturate(dot(f0, vec3(50.0 * 0.33)));
//     return F_Schlick(f0, f90, LoH);
// #endif
}

vec3 ClothSurfaceShading(const FragmentState state, const Light light, const float visibility)
{
	float NoL = saturate(dot(state.normal, light.l));
	float NoV = abs(dot(state.normal, state.vertex_eye)) + FLT_EPS;

	vec3  h = normalize(state.vertex_eye + light.l);
    float NoH = saturate(dot(state.normal, h));
    float LoH = saturate(dot(light.l, h));

    // specular BRDF
    float D = D_Charlie(state.linearRoughness, NoH);
    float V = V_Neubelt(NoV, NoL);
    vec3  F = Fresnel(state.reflectivity, LoH);
    // Ignore pixel.energyCompensation since we use a different BRDF here
    vec3 Fr = (D * V) * F;

    // diffuse BRDF, lambert
    float diffuse = M_INV_PI;
    // Energy conservative wrap diffuse to simulate subsurface scattering
    diffuse *= Fd_Wrap(dot(state.normal, light.l), 0.5);

    // We do not multiply the diffuse term by the Fresnel term as discussed in
    // Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
    // The effect is fairly subtle and not deemed worth the cost for mobile
    vec3 Fd = diffuse * state.albedo;
    // Cheap subsurface scatter
    Fd *= saturate(state.subsurfaceColor + NoL);
    // We need to apply NoL separately to the specular lobe since we already took
    // it into account in the diffuse lobe
    vec3 color = Fd + Fr * NoL;
    color *= light.colorIntensity.rgb * light.attenuation * visibility;
    return color;
}

float ClearCoatLobe(const FragmentState state, const vec3 h, float NoH, float LoH, out float Fc) {
// #if defined(MATERIAL_HAS_NORMAL)
//     // If the material has a normal map, we want to use the geometric normal
//     // instead to avoid applying the normal map details to the clear coat layer
//     float clearCoatNoH = saturate(dot(shading_tangentToWorld[2], h));
// #else
//     float clearCoatNoH = NoH;
// #endif

//     // clear coat specular lobe
//     float D = D_GGX(state.clearCoatLinearRoughness, clearCoatNoH, h);
//     float V = V_Kelemen(LoH);
//     float F = F_Schlick(0.04, 1.0, LoH) * state.clearCoat; // fix IOR to 1.5

//     Fc = F;
//     return D * V * F;
	return 1.0;
}


vec3 AnisotropicLobe(const FragmentState state, const Light light, const vec3 h,float NoV, float NoL, float NoH, float LoH) {
// #if defined(MATERIAL_HAS_ANISOTROPY)
//     vec3 l = light.l;
//     vec3 t = state.anisotropicT;
//     vec3 b = state.anisotropicB;
//     vec3 v = state.vertex_eye;

//     float ToV = dot(t, v);
//     float BoV = dot(b, v);
//     float ToL = dot(t, l);
//     float BoL = dot(b, l);
//     float ToH = dot(t, h);
//     float BoH = dot(b, h);

//     // Anisotropic parameters: at and ab are the roughness along the tangent and bitangent
//     // to simplify materials, we derive them from a single roughness parameter
//     // Kulla 2017, "Revisiting Physically Based Shading at Imageworks"
//     float at = max(state.linearRoughness * (1.0 + state.anisotropy), MIN_LINEAR_ROUGHNESS);
//     float ab = max(state.linearRoughness * (1.0 - state.anisotropy), MIN_LINEAR_ROUGHNESS);

//     // specular anisotropic BRDF
//     float D = D_GGX_Anisotropic(at, ab, ToH, BoH, NoH);
//     float V = V_SmithGGXCorrelated_Anisotropic(state.linearRoughness, at, ab, ToV, BoV, ToL, BoL, NoV, NoL);
//     vec3  F = Fresnel(state.reflectivity, LoH);

//     return (D * V) * F;
// #endif
    return vec3(0.0,0.0,0.0);
}


vec3 IsotropicLobe(const FragmentState state, const Light light, const vec3 h,float NoV, float NoL, float NoH, float LoH) {

    float D = D_GGX(state.linearRoughness, NoH, h);
    float V = V_SmithGGXCorrelated_Fast(state.linearRoughness, NoV, NoL);
    vec3  F = Fresnel(state.reflectivity, LoH);
    return (D * V) * F;
}

vec3 SpecularLobe(const FragmentState state, const Light light, const vec3 h,float NoV, float NoL, float NoH, float LoH) {
// #if defined(MATERIAL_HAS_ANISOTROPY)
//     return AnisotropicLobe(state, light, h, NoV, NoL, NoH, LoH);
// #else
//     return IsotropicLobe(state, light, h, NoV, NoL, NoH, LoH);
// #endif
	return IsotropicLobe(state, light, h, NoV, NoL, NoH, LoH);
}

vec3 SubSurfaceShading(const FragmentState state, const Light light, const float visibility){
	vec3  h = normalize(state.vertex_eye + light.l);

    float NoV = state.NoV;
    float NoL = dot(state.normal, light.l);
    float sss_NoL = 0.5 + NoL * 0.5;
    NoL = saturate(NoL)+0.001;
    float NoH = saturate(dot(state.normal, h));
    float LoH = saturate(dot(light.l, h));

    vec3 Fr = SpecularLobe(state, light, h, NoV, NoL, NoH, LoH);
    
    vec2 lut_sample = vec2(sss_NoL, 1.0 - state.curvature);
    vec3 sss_factor = sRGBToLinearFast(SAMPLER_2D(tex_pre_integrated_brdf, lut_sample).rgb);
    vec3 sss_hsv_factor = rgb2hsv(sss_factor);
    sss_hsv_factor.r += skin_sss_hue_shift; 
    sss_factor = hsv2rgb(sss_hsv_factor);

    vec3 Fd = sss_factor * M_INV_PI * state.albedo;
    vec3 color = (Fd + Fr*NoL) * light.colorIntensity.rgb * (light.attenuation * visibility);
    return color;
}

// vec3 SubsurfaceSurfaceShading(const FragmentState state, const Light light, float visibility) {
//     vec3  h = normalize(state.vertex_eye + light.l);

//     float NoL = saturate(dot(state.normal, light.l));
//     float NoH = saturate(dot(state.normal, h));
//     float LoH = saturate(dot(light.l, h));

//     vec3 Fr = vec3(0.0);
//     if (NoL > 0.0) {
//         // specular BRDF
//         float D = D_GGX(state.linearRoughness, NoH, h);
// 	    float V = V_SmithGGXCorrelated(state.linearRoughness, NoV, NoL);
//     	vec3  F = Fresnel(state.reflectivity, LoH);
//         Fr = (D * V) * F;
//     }

//     // diffuse BRDF
//     vec3 Fd = state.albedo * Fd_Lambert();

//     // NoL does not apply to transmitted light
//     vec3 color = (Fd + Fr) * (NoL * visibility);

//     // subsurface scattering
//     // Use a spherical gaussian approximation of pow() for forwardScattering
//     // We could include distortion by adding shading_normal * distortion to light.l
//     float scatterVoH = saturate(dot(state.vertex_eye, -light.l));
//     float forwardScatter = exp2(scatterVoH * state.subsurfacePower - state.subsurfacePower);
//     float backScatter = saturate(NoL * state.thickness + (1.0 - state.thickness)) * 0.5;
//     float subsurface = mix(backScatter, 1.0, forwardScatter) * (1.0 - state.thickness);
//     color += state.subsurfaceColor * (subsurface * Fd_Lambert());

//     // TODO: apply occlusion to the transmitted light
//     return (color * light.colorIntensity.rgb) * light.attenuation;
// }

// ////////////////////////////////////////////////////////////////////////////////
// ///  IBL 

// Irradiance spherical harmonics polynomial coefficients
// This is a color 2nd degree polynomial in (x,y,z), so it needs 10 coefficients
// for each color channel
//uniform vec3 shCoefs[10];
vec3 irradianceFromSH(vec3 n)
{
	vec3 uDiffuseLightSphere[9];

    uDiffuseLightSphere[0] = vec3(0.287, 0.233, 0.206);
    uDiffuseLightSphere[1] = vec3(0.088, 0.109, 0.130);
    uDiffuseLightSphere[2] = vec3(0.131, 0.141, 0.139);
    uDiffuseLightSphere[3] = vec3(0.207, 0.201, 0.190);
    uDiffuseLightSphere[4] = vec3(0.033, 0.075, 0.109);
    uDiffuseLightSphere[5] = vec3(0.044, 0.073, 0.096);
    uDiffuseLightSphere[6] = vec3(0.001, 0.001, -0.001);
    uDiffuseLightSphere[7] = vec3(0.056, 0.055, 0.049);
    uDiffuseLightSphere[8] = vec3(0.086, 0.067, 0.052);

	// uDiffuseLightSphere[0] = vec3(0.445, 0.407, 0.388);
    // uDiffuseLightSphere[1] = vec3(0.411, 0.379, 0.366);
    // uDiffuseLightSphere[2] = vec3(0.125, 0.131, 0.138);
    // uDiffuseLightSphere[3] = vec3(-0.155, -0.134, -0.122);
    // uDiffuseLightSphere[4] = vec3(-0.154, -0.133, -0.111);
    // uDiffuseLightSphere[5] = vec3(0.036, 0.040, 0.043);
    // uDiffuseLightSphere[6] = vec3(-0.015, -0.008, 0.000);
    // uDiffuseLightSphere[7] = vec3(-0.027, -0.036, -0.060);
    // uDiffuseLightSphere[8] = vec3(-0.057, -0.056, -0.064);

	//l = 0 band
	vec3 d = uDiffuseLightSphere[0].xyz;

	//l = 1 band
	d += uDiffuseLightSphere[1].xyz * n.y;
	d += uDiffuseLightSphere[2].xyz * n.z;
	d += uDiffuseLightSphere[3].xyz * n.x;

	//l = 2 band
	vec3 swz = n.yyz * n.xzx;
	d += uDiffuseLightSphere[4].xyz * swz.x;
	d += uDiffuseLightSphere[5].xyz * swz.y;
	d += uDiffuseLightSphere[7].xyz * swz.z;

	vec3 sqr = n * n;
	d += uDiffuseLightSphere[6].xyz * ( 3.0*sqr.z - 1.0 );
	d += uDiffuseLightSphere[8].xyz * ( sqr.x - sqr.y );

	return d;

	// return (shCoefs[0]*n.x + shCoefs[1]*n.y + shCoefs[2]*n.z + shCoefs[3])*n.x
	// 	+ (shCoefs[4]*n.y + shCoefs[5]*n.z + shCoefs[6])*n.y
	// 	+ (shCoefs[7]*n.z + shCoefs[8])*n.z
	// 	+ shCoefs[9];
}

///
void IBLDiffuse(inout FragmentState s)
{
	vec3 rotated_normal = rotate(s.normal, env_rotate);
	vec3 irradiance = irradianceFromSH(rotated_normal);
	irradiance *= env_intensity;
	s.diffuse_light += s.albedo.xyz * irradiance;
}


vec2 PrefilteredDFG_Cloth_Charlie(float roughness, float NoV) {
    const vec3 c0 = vec3(0.95, 1250.0, 0.0095);
    const vec4 c1 = vec4(0.04, 0.2, 0.3, 0.2);

    float a = 1.0 - NoV;
    float b = 1.0 - roughness;

    float n = pow(c1.x + a, 64.0);
    float e = b - c0.x;
    float g = exp2(-(e * e) * c0.y);
    float f = b + c1.y;
    float a2 = a * a;
    float a3 = a2 * a;
    float c = n * g + c1.z * (a + c1.w) * roughness + f * f * a3 * a3 * a2;
    float r = min(c, 18.0);

    return vec2(r, r * c0.z);
}

vec2 PrefilteredDFG_Cloth_Ashikhmin(float roughness, float NoV) {
    const vec4 c0 = vec4(0.24,  0.93, 0.01, 0.20);
    const vec4 c1 = vec4(2.00, -1.30, 0.40, 0.03);

    float s = 1.0 - NoV;
    float e = s - c0.y;
    float g = c0.x * exp2(-(e * e) / (2.0 * c0.z)) + s * c0.w;
    float n = roughness * c1.x + c1.y;
    float r = max(1.0 - n * n, c1.z) * g;

    return vec2(r, r * c1.w);
}


vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	// [ Lazarov 2013, "Getting More Physical in Call of Duty: Black Ops II" ]
	// Adaptation to fit our G term.
	const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
	const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

	// Anything less than 2% is physically impossible and is instead considered to be shadowing
	// Note: this is needed for the 'specular' show flag to work, since it uses a SpecularColor of 0
	AB.y *= saturate( 50.0 * SpecularColor.g );

	return SpecularColor * AB.x + AB.y;
}

float EnvBRDFApproxNonmetal( float Roughness, float NoV )
{
	// Same as EnvBRDFApprox( 0.04, Roughness, NoV )
	const vec2 c0 = vec2(-1.0, -0.0275);
	const vec2 c1 = vec2(1, 0.0425);
	vec2 r = Roughness * c0 + c1;
	return min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
}

float ComputeSpecularAO(float NoV, float ao, float roughness) {
	return saturate(pow(NoV + ao, exp2(-16.0 * roughness - 1.0)) - 1.0 + ao);
}

vec3 getSpecularDominantDirection(vec3 n, vec3 r, float linearRoughness) {
#define IBL_OFF_SPECULAR_PEAK 1
#if defined(IBL_OFF_SPECULAR_PEAK)
    float s = 1.0 - linearRoughness;
    return mix(n, r, s * (sqrt(s) + linearRoughness));
#else
    return r;
#endif
}

vec3 getReflectedVector(const FragmentState state, const vec3 n) {
	vec3 shading_reflected = reflect(-state.vertex_eye, n);
// #if defined(MATERIAL_HAS_ANISOTROPY)
//     vec3  anisotropyDirection = state.anisotropy >= 0.0 ? state.anisotropicB : state.anisotropicT;
//     vec3  anisotropicTangent  = cross(anisotropyDirection, state.vertex_eye);
//     vec3  anisotropicNormal   = cross(anisotropicTangent, anisotropyDirection);
//     float bendFactor          = abs(state.anisotropy) * saturate(5.0 * state.roughness);
//     vec3  bentNormal          = normalize(mix(n, anisotropicNormal, bendFactor));

//     vec3 r = reflect(-state.vertex_eye, bentNormal);
// #else
    vec3 r = shading_reflected;
//#endif
    return getSpecularDominantDirection(n, r, state.linearRoughness);
}


float ComputeMipFromRoughness(float Roughness, float CubemapMaxMip)
{
	const float REFLECTION_CAPTURE_ROUGHEST_MIP = 1.0;
	const float REFLECTION_CAPTURE_ROUGHNESS_MIP_SCALE = 1.2;

	// Heuristic that maps roughness to mip level
	// This is done in a way such that a certain mip level will always have the same roughness, regardless of how many mips are in the texture
	// Using more mips in the cubemap just allows sharper reflections to be supported
	//float LevelFrom1x1 = REFLECTION_CAPTURE_ROUGHEST_MIP - REFLECTION_CAPTURE_ROUGHNESS_MIP_SCALE * log2(Roughness);
	//return CubemapMaxMip - LevelFrom1x1;
	return Roughness * CubemapMaxMip;
}

vec3 decodeRGBM(vec4 c) {
    float max_lum = 5.0;
    c.rgb *= (c.a * max_lum);
    return c.rgb * c.rgb;
}

vec3 SpecularIrradiance(vec3 r, float Roughness)
{
	// Compute fractional mip from roughness
	const float ReflectionCubemapMaxMip = 5.0;
	float lod = ComputeMipFromRoughness(Roughness, ReflectionCubemapMaxMip);
	
	//vec4 SpecularIBL = TEXTURE_CUBE_LOD(tex_cube_ibl, r, lod);
	//vec4 SpecularIBL = SAMPLER_2D(tex_ibl, r.xy);
	vec4 SpecularIBL = vec4(0.0,0.0,0.0,1.0);
	
	// if use rgbm, decode from ibl
	vec3 ref = decodeRGBM(SpecularIBL);
    return ref;
}

vec3 IBLReflection(FragmentState s, float NoV, vec3 ReflectionVector)
{
	float roughness = s.roughness;
	float SpecularColor = EnvBRDFApproxNonmetal(roughness, NoV);
    // Environment map has been prenormalized, scale by lightmap luminance
	vec3 SpecularIBL = SpecularIrradiance(ReflectionVector, roughness);
	return SpecularIBL * SpecularColor;
}

void EvaluateClothIndirectDiffuseBRDF(const FragmentState state, inout float diffuse) {
#if defined(SHADING_MODEL_CLOTH)
	// Simulate subsurface scattering with a wrap diffuse term
    diffuse *= Fd_Wrap(state.NoV, 0.5);
#endif
}

vec3 SpecularDFG(const FragmentState state){
#if defined(SHADING_MODEL_CLOTH)
    return state.reflectivity * state.dfg.x + state.dfg.y;
#else
    return mix(state.dfg.xxx, state.dfg.yyy, state.reflectivity);
#endif
}

void EvaluateClearCoatIBL(const FragmentState state, float specularAO, inout vec3 Fd, inout vec3 Fr) {
// #if defined(MATERIAL_HAS_CLEAR_COAT)
// 	#if defined(MATERIAL_HAS_NORMAL)
// 	    // We want to use the geometric normal for the clear coat layer
// 	    float clearCoatNoV = abs(dot(state.vertex_normal, state.vertex_eye)) + FLT_EPS;
// 	    vec3 clearCoatR = reflect(-state.vertex_eye, state.vertex_normal);
// 	#else
// 	    float clearCoatNoV = state.NoV;
// 	    vec3 clearCoatR = state.reflect_dir;
// 	#endif
//     // The clear coat layer assumes an IOR of 1.5 (4% reflectance)
//     float Fc = F_Schlick(0.04, 1.0, clearCoatNoV) * state.clearCoat;
//     float attenuation = 1.0 - Fc;
//     Fr *= sq(attenuation);
//     Fr += SpecularIrradiance(clearCoatR, state.clearCoatRoughness) * (specularAO * Fc);
//     Fd *= attenuation;
// #endif
}

void EvaluateSubsurfaceIBL(const FragmentState state, const vec3 diffuseIrradiance, inout vec3 Fd, inout vec3 Fr) {
// #if defined(SHADING_MODEL_SUBSURFACE)
//     vec3 viewIndependent = diffuseIrradiance;
//     vec3 viewDependent = SpecularIrradiance(-state.vertex_eye, state.roughness, 1.0 + state.thickness);
//     float attenuation = (1.0 - state.thickness) / (2.0 * M_PI);
//     Fd += state.subsurfaceColor * (viewIndependent + viewDependent) * attenuation;
// #elif defined(SHADING_MODEL_CLOTH) && defined(MATERIAL_HAS_SUBSURFACE_COLOR)
//     Fd *= saturate(pixel.subsurfaceColor + shading_NoV);
// #endif

// #if defined(SHADING_MODEL_CLOTH)
// 	Fd *= saturate(state.subsurfaceColor + state.NoV);
// #endif
}

void EvaluateIBL(FragmentState state, inout vec3 color){
	// Apply transform here to rotate the IBL
    vec3 n = normalize(rotate(state.normal, env_rotate)); 
    vec3 r = getReflectedVector(state, state.normal);
    r = rotate(r, env_rotate);

    float ao = state.ao;
    float specularAO = ComputeSpecularAO(state.NoV, ao, state.roughness);

    // diffuse indirect
    float diffuseBRDF = ao;
    vec3 diffuseIrradiance = irradianceFromSH(n);
    vec3 Fd = state.albedo * diffuseIrradiance * diffuseBRDF;
    vec3 Fr = IBLReflection(state, state.NoV, r) * specularAO;

    // Note: iblLuminance is already premultiplied by the exposure
    color.rgb += (Fd + Fr) * env_intensity;
}

void SetupMaterial(inout FragmentState state)
{
	vec4 base_color = SAMPLER_2D(tex_base_color, st_frag);
  
	if(base_color.a < 0.75) {
        discard;
    }

		vec4 C_mask = SAMPLER_2D(tex_changemask,st_frag);
		if(C_mask.r > 0.5) {
			vec3 C_hsv = rgb2hsv(base_color.rgb);
			C_hsv.r = color_change0.r;
			C_hsv.g *= color_change0.g;
			C_hsv.b *= color_change0.b;
			if(C_hsv.b>255.0) C_hsv.b = 255.0;
			base_color.rgb = hsv2rgb(C_hsv);
		}	
        if (C_mask.g > 0.5) {
            vec3 C_hsv = rgb2hsv(base_color.rgb);
			C_hsv.r = color_change1.r;
			C_hsv.g *= color_change1.g;
			C_hsv.b *= color_change1.b;
			if(C_hsv.b>255.0) C_hsv.b = 255.0;
			base_color.rgb = hsv2rgb(C_hsv);
        }
	
    vec4 curvature_roughness_ao_mask = SAMPLER_2D(tex_metallic_gloss_ao, state.main_uv);
	state.albedo = base_color.rgb * colorScale.rgb;
    vec3 lip_shifted_color = base_color.rgb * lip_color_scale.rgb;
    float lip_mask = curvature_roughness_ao_mask.a;
    state.albedo = mix(state.albedo, lip_shifted_color.rgb, lip_mask);

    // vec2 beard_offset = vec2(1536.0, 2265.0) / 4096.0;
    // vec2 beard_scale = vec2(4.0, 4.0);
    vec2 beard_uv = (st_frag - beard_offset) * beard_scale;

    //float beard_alpha = SAMPLER_2D(tex_beard, beard_uv).g;
    float beard_alpha = 1.0;
	beard_alpha = pow(beard_alpha,beard_opacity);
    float beard_intensity = mix(1.0, beard_alpha, beard_color.a);
    state.albedo = mix(beard_color.rgb, state.albedo, beard_intensity);
	state.albedo.rgb = sRGBToLinearFast(state.albedo.rgb);
	state.opacity = 1.0;

	float m = 0.0;
	float g = 0.0;

	m = metallic_factor;
	g = (1.0-curvature_roughness_ao_mask.g) * gloss_factor;
    g *= beard_intensity;
	state.ao = mix(1.0, curvature_roughness_ao_mask.b, occlusion_intensity);

	float spec = 0.04;
	state.reflectivity = mix(vec3(spec,spec,spec), state.albedo.xyz, m );
	state.albedo.xyz = state.albedo.xyz - m * state.albedo.xyz;
	state.fresnel = vec3(fresnel_intensity, fresnel_intensity, fresnel_intensity);

	float h = saturate(dot(state.normal, state.vertex_eye));
	h = gloss_horizon_smooth - h * gloss_horizon_smooth;
    g = mix(g, 1.0, h*h );
	state.roughness = 1.0 - g;

	state.roughness = max(state.roughness, MIN_ROUGHNESS);
	state.linearRoughness = state.roughness * state.roughness;
    state.curvature = curvature_roughness_ao_mask.r * curvature_scale;
}

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

float unpack(vec4 color)
{
    const vec4 bitShifts = 255.0 / 256.0 * vec4(1.0 / (256.0 * 256.0 * 256.0),
                                                1.0 / (256.0 * 256.0),
                                                1.0 / 256.0,
                                                1);
    return dot(color, bitShifts);
}

vec4 getLightSpacePosition(const vec3 p, const vec3 n, mat4 light_mvp, float NoL) {
#ifdef TARGET_MOBILE
    float normalBias = 1.0 - NoL * NoL;
#else
    float normalBias = sqrt(1.0 - NoL * NoL);
#endif

    vec3 offsetPosition = p + n * (normalBias * shadow_bias.y);
    vec4 lightSpacePosition = (light_mvp * vec4(offsetPosition, 1.0));
    lightSpacePosition.z -= shadow_bias.x;

    return lightSpacePosition;
}

float sampleDepth(sampler2D shadowMap, vec2 base, vec2 dudv, float depth){
    vec2 uv = base + dudv;
    vec4 packedDepth = SAMPLER_2D(shadowMap, uv);
    float sample_depth = unpack(packedDepth);
    return depth < sample_depth ? 1.0 : 0.0;
}

float ShadowPCFLow(vec3 worldPosition, mat4 L_MVP, sampler2D shadowMap, float shadowMap_size, vec3 N, float NdotL) 
{
    //  Castaño, 2013, "Shadow Mapping Summary Part 1"
    float texelSize = 1.0 / shadowMap_size;
    vec4 projPosition = getLightSpacePosition(worldPosition, N, L_MVP, NdotL);
    vec3 shadowPosition = projPosition.xyz / projPosition.w;
    shadowPosition = shadowPosition * 0.5 + 0.5;

    // clamp position to avoid overflows below, which cause some GPUs to abort
    //shadowPosition.xy = clamp(shadowPosition.xy, vec2(-1.0), vec2(2.0));
    float in_shadow_range = (shadowPosition.x >= 0.0 && shadowPosition.x <=1.0 && shadowPosition.y >= 0.0 && shadowPosition.y <= 1.0) ? 1.0 : 0.0;

    vec2 offset = vec2(0.5);
    vec2 uv = (shadowPosition.xy * shadowMap_size) + offset;
    vec2 base = (floor(uv) - offset) * texelSize;
    vec2 st = fract(uv);

    vec2 uw = vec2(3.0 - 2.0 * st.x, 1.0 + 2.0 * st.x);
    vec2 vw = vec2(3.0 - 2.0 * st.y, 1.0 + 2.0 * st.y);

    vec2 u = vec2((2.0 - st.x) / uw.x - 1.0, st.x / uw.y + 1.0);
    vec2 v = vec2((2.0 - st.y) / vw.x - 1.0, st.y / vw.y + 1.0);

    u *= texelSize;
    v *= texelSize;

    float depth = shadowPosition.z;
    float sum = 0.0;

    sum += uw.x * vw.x * sampleDepth(shadowMap, base, vec2(u.x, v.x), depth);
    sum += uw.y * vw.x * sampleDepth(shadowMap, base, vec2(u.y, v.x), depth);

    sum += uw.x * vw.y * sampleDepth(shadowMap, base, vec2(u.x, v.y), depth);
    sum += uw.y * vw.y * sampleDepth(shadowMap, base, vec2(u.y, v.y), depth);
    sum = sum * (1.0 / 16.0);
    return mix(1.0, sum, in_shadow_range);
}

vec4 shader_depth_main(){
    return pack(gl_FragCoord.z);
}

vec4 shader_main(){

	vec3 N = normalize(N_frag);	
	vec3 V = -normalize(V_frag);

	FragmentState state;
	state.vertex_eye = V;
	state.vertex_normal = gl_FrontFacing ? N : -N;
	// state.vertex_tangent = iFS_Tangent;
	// state.vertex_bitangent = fixBinormal(state.vertex_normal,state.vertex_tangent,iFS_Binormal);
	state.main_uv = st_frag;

	state.albedo = vec3(1.0,1.0,1.0);
	state.normal = normalize(state.vertex_normal);
	state.roughness = 1.0;
	state.reflectivity = vec3(0.04,0.04,0.04);
	state.fresnel = vec3(1.0,1.0,1.0);
  	state.ao = 1.0;
  	state.opacity = 1.0;

	state.diffuse_light = vec3(0.0,0.0,0.0);
	state.specular_light = vec3(0.0,0.0,0.0);
	state.emissive_light = vec3(0.0,0.0,0.0);

	SetupMaterial(state);

	// common computed for lighting
	state.NoV = abs(dot(state.normal, state.vertex_eye)) + FLT_EPS;
	state.reflect_dir = reflect(-state.vertex_eye, state.normal);

	// lighting
    Light main_light;
    main_light.colorIntensity = vec4(L0_color,1.0);
    main_light.l = -L0_dir;
    main_light.attenuation = 1.0;
    float shadow = ShadowPCFLow(world_pos.xyz, L0_MVP, tex_shadowmap, shadowmap_size, state.normal, saturate(dot(state.normal, main_light.l)));
    //main_light.attenuation = shadow;

    Light rim_light;
    rim_light.colorIntensity = vec4(L1_color,1.0);
    rim_light.l = -L1_dir;
    rim_light.attenuation = 1.0;

	vec3 contrib0 = SubSurfaceShading(state, main_light, 1.0);
	vec3 contrib1 = SubSurfaceShading(state, rim_light, 1.0) * state.ao;
	vec3 ibl_contribute = vec3(0.0,0.0,0.0);
	EvaluateIBL(state,ibl_contribute);

    vec3 finalColor = contrib0 + contrib1 + ibl_contribute;
	// Convert the fragment color from linear to sRGB for display (we should make the framebuffer use sRGB instead).
	finalColor = LinearToSrgb(finalColor);
	return vec4(finalColor, state.opacity);
}
