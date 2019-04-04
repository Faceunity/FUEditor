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


IN_PARAM vec3 N_frag,V_frag;
IN_PARAM vec2 st_frag;
IN_PARAM vec3 dPds_frag, dPdt_frag;


struct FragmentState
{
	vec3	vertex_eye;

	vec3	vertex_normal;
	vec3	vertex_tangent;
	vec3	vertex_bitangent;
	
	//material 
	vec3	albedo;
	vec3	spec;
	vec3	normal;
	float   shiftTex;
	float   main_gloss;
	float   ao;
};


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
	float angle = a*2.0*M_PI;
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

vec3 shiftTangent(vec3 T, vec3 N, float shift){
    vec3 shiftedT = T + (shift * N);
    return normalize(shiftedT);
}

float StrandSpecular(vec3 T, vec3 V, vec3 L, float exponent)
{
    vec3 H = normalize(L + V);
    float dotTH = dot(T, H);
    float sinTH = sqrt(1.0 - dotTH * dotTH);
    float dirAtten = smoothstep(-1.0, 0.0, dotTH);

    return dirAtten * pow(sinTH, exponent);
}


vec3 getWorldNormalMap(vec3 T, vec3 B, vec3 N, vec3 local_N)
{
	local_N.xy = local_N.xy * 2.0 - 1.0;
	local_N.z = sqrt(dot(local_N.xy, -local_N.xy) + 1.0);

	vec3 ret = T * local_N.x + B*local_N.y + N*local_N.z;
	return normalize(ret);
}

/*
// http://www.thetenthplanet.de/archives/1180
void cotangent_frame(vec3 N, vec3 p, vec2 uv, out vec3 T, out vec3 B)
{
    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( p );
    vec3 dp2 = dFdy( p );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );

    // solve the linear system
    vec3 dp2perp = cross( dp2, N );
    vec3 dp1perp = cross( N, dp1 );
    T = dp2perp * duv1.x + dp1perp * duv2.x;
    B = dp2perp * duv1.y + dp1perp * duv2.y;

    // construct a scale-invariant frame
    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
    //return mat3( T * invmax, B * invmax, N );
    T = T * invmax;
    B = B * invmax;
}
*/

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
vec3 IBLDiffuse(inout FragmentState s)
{
	vec3 rotated_normal = rotate(s.normal, env_rotate);
	vec3 irradiance = irradianceFromSH(rotated_normal);
	irradiance *= env_intensity;
	return s.albedo.xyz * irradiance;
}

vec3 HairShading(const FragmentState state, const Light light)
{
	float NdotL = saturate(dot(state.normal, light.l));
    vec3 tt = state.vertex_tangent * anistropic_dir.x + state.vertex_bitangent * anistropic_dir.y;
    vec3 t1 = shiftTangent(tt, state.vertex_normal, SpecularShift);
    vec3 t2 = shiftTangent(tt, state.vertex_normal, SpecularSecondaryShift + state.shiftTex);

    float diff = saturate(mix(Diffuse_lerp_base, 1.0, NdotL));
    float spec_power = exp2(state.main_gloss*13.0);
    float second_spec_power = exp2(state.main_gloss*13.0*SecondaryGlossFactor);

    float spec1 = StrandSpecular(t1, state.vertex_eye, light.l, spec_power);
    float spec2 = StrandSpecular(t2, state.vertex_eye, light.l, second_spec_power);

    vec3 ret = vec3(0.0,0.0,0.0);
    
    ret.rgb += state.albedo * diff;
    ret.rgb += SpecularColor * state.spec * light.colorIntensity.rgb * (spec1 * S_Intensity * NdotL);
    ret.rgb += SpecularSecondaryColor * state.spec * light.colorIntensity.rgb * (spec2 * S_Intensity * NdotL);
    
    return ret; 
}

vec4 shader_main_depth(){
    vec4 albedo_map  = SAMPLER_2D(tex_albedo,st_frag);  // albedo, alpha
    float alpha = albedo_map.a;
    if(alpha - alphaThreshold <= 0.0) 
        discard;
    return vec4(0.0,0.0,0.0,1.0);
}

vec4 shader_main_alphacut(){
    FragmentState state;

    vec4 albedo_map  = SAMPLER_2D(tex_albedo,st_frag);  // albedo, alpha
    float alpha = albedo_map.a;

    if(alpha - alphaThreshold < 0.0) {
        discard;
    } else {
        vec3 local_N  = SAMPLER_2D(tex_normal, st_frag).rgb; //xy = normal, z =gloss
        vec4 spec_map = SAMPLER_2D(tex_spec, st_frag); //spec.xyz, shiftTex

		float albedoAlpha = albedo_map.a;
		//if(enableColorShift > 0.5) {
		vec3 albedo_map_hsv = rgb2hsv(albedo_map.xyz);
		albedo_map_hsv.r = hair_color_hsv.r;
		albedo_map_hsv.g = hair_color_hsv.g;
		albedo_map.xyz = hsv2rgb(albedo_map_hsv);
		albedoAlpha = hair_color_hsv.a;
		//}

        state.albedo = sRGBToLinearFast(albedo_map.xyz) * albedoAlpha;
        state.spec = sRGBToLinearFast(spec_map.xyz);
        state.shiftTex = spec_map.a - 0.5;
        state.main_gloss = local_N.z;

        vec3 N = normalize(N_frag);
        vec3 T = normalize(dPds_frag);
        vec3 B = normalize(cross(N, T));

        state.vertex_normal = gl_FrontFacing ? N : -N;
        state.vertex_tangent = gl_FrontFacing ? T : -T;
        state.vertex_bitangent = gl_FrontFacing ? B : -B;
        state.normal = getWorldNormalMap(T,B,N,local_N);
        state.vertex_eye = -normalize(V_frag); // camera is 0, 0, 0

        // lighting
        Light main_light;
        main_light.colorIntensity = vec4(L0_color,1.0);
        main_light.l = -L0_dir;
        main_light.attenuation = 1.0;

        Light rim_light;
        rim_light.colorIntensity = vec4(L1_color,1.0);
        rim_light.l = -L1_dir;
        rim_light.attenuation = 1.0;

        vec3 contribute0 = HairShading(state, main_light);
        vec3 contribute1 = HairShading(state, rim_light);
        vec3 ibl_diffuse = IBLDiffuse(state);

        vec4 ret;
        ret.a = alpha * TransFactor;
        ret.rgb = contribute0 + contribute1 + ibl_diffuse;
        ret.rgb = LinearToSrgb(ret.rgb);
        return ret;
    }
}

vec4 shader_main(){
    FragmentState state;

    vec4 albedo_map  = SAMPLER_2D(tex_albedo,st_frag);  // albedo, alpha
    float alpha = albedo_map.a;
    vec3 local_N  = SAMPLER_2D(tex_normal, st_frag).rgb; //xy = normal, z =gloss
	vec4 spec_map = SAMPLER_2D(tex_spec, st_frag); //spec.xyz, shiftTex

	float albedoAlpha = albedo_map.a;
	//if(enableColorShift > 0.5) {
		vec3 albedo_map_hsv = rgb2hsv(albedo_map.xyz);
		albedo_map_hsv.r = hair_color_hsv.r;
		albedo_map_hsv.g = hair_color_hsv.g;
		albedo_map.xyz = hsv2rgb(albedo_map_hsv);
		albedoAlpha = hair_color_hsv.a;
	//}
	
	state.albedo = sRGBToLinearFast(albedo_map.xyz) * albedoAlpha;
	state.spec = sRGBToLinearFast(spec_map.xyz);
	state.shiftTex = spec_map.a - 0.5;
	state.main_gloss = local_N.z;

	vec3 N = normalize(N_frag);
	vec3 T = normalize(dPds_frag);
	vec3 B = normalize(cross(N, T));

    state.vertex_normal = gl_FrontFacing ? N : -N;
    state.vertex_tangent = gl_FrontFacing ? T : -T;
	state.vertex_bitangent = gl_FrontFacing ? B : -B;
	state.normal = getWorldNormalMap(T,B,N,local_N);
	state.vertex_eye = -normalize(V_frag); // camera is 0, 0, 0

    // lighting
    Light main_light;
    main_light.colorIntensity = vec4(L0_color,1.0);
    main_light.l = -L0_dir;
    main_light.attenuation = 1.0;

    Light rim_light;
    rim_light.colorIntensity = vec4(L1_color,1.0);
    rim_light.l = -L1_dir;
    rim_light.attenuation = 1.0;

    vec3 contribute0 = HairShading(state, main_light);
    vec3 contribute1 = HairShading(state, rim_light);
    vec3 ibl_diffuse = IBLDiffuse(state);

	vec4 ret;
    ret.a = alpha * TransFactor;

    ret.rgb = contribute0 + contribute1 + ibl_diffuse;
    ret.rgb = LinearToSrgb(ret.rgb);
    return ret;
}
